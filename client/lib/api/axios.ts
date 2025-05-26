import Axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig
} from 'axios';

import { handleApiError } from '../error-utils';

export const axiosInstance: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Przechowuj referencje do ID interceptorów, aby uniknąć duplikatów przy HMR
let requestInterceptorId: number | undefined;
let responseInterceptorId: number | undefined;

type GetTokenFunction = (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>;
type SignOutFunction = (options?: { redirectUrl?: string; sessionId?: string }) => Promise<void>;

export const setupClerkInterceptors = (
  instance: AxiosInstance,
  tokenTemplate: string,
  getToken: GetTokenFunction,
  signOut: SignOutFunction
) => {
  if (requestInterceptorId !== undefined) {
    instance.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== undefined) {
    instance.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Always try to add token to every request
      const token = await getToken({ template: tokenTemplate });
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  responseInterceptorId = instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (Axios.isCancel(error)) {
        // If request was cancelled, propagate the error
        return Promise.reject(error);
      }

      const axiosError = error as AxiosError;

      // Handle 401 errors - use Clerk's signOut
      if (axiosError.response?.status === 401) {
        console.log('ApiClient: Unauthorized (401). Signing out...');

        await signOut({ redirectUrl: '/sign-in' });

        return Promise.reject(axiosError);
      }

      // Handle all other errors with user-friendly messages
      handleApiError(axiosError);

      return Promise.reject(axiosError);
    }
  );
};

export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance({
    ...config,
    ...options
  }).then(({ data }) => data);
};
