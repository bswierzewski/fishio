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

export const setupClerkInterceptors = (instance: AxiosInstance, tokenTemplate: string, getToken: GetTokenFunction) => {
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
};

export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance({
    ...config,
    ...options
  }).then(({ data }) => data);
};
