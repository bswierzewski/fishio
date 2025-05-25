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

// 2. Funkcja do konfiguracji interceptorów.
//    Przyjmuje funkcje getToken i signOut z Clerk.
type GetTokenFunction = (options?: { template?: string; skipCache?: boolean }) => Promise<string | null>;
type SignOutFunction = (options?: { redirectUrl?: string; sessionId?: string }) => Promise<void>;

export const setupClerkInterceptors = (
  instance: AxiosInstance,
  tokenTemplate: string,
  getToken: GetTokenFunction,
  signOut: SignOutFunction
) => {
  // Usuń poprzednie interceptory, jeśli istnieją, aby uniknąć duplikatów
  if (requestInterceptorId !== undefined) {
    instance.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== undefined) {
    instance.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getToken({ template: tokenTemplate }); // Użyj przekazanej funkcji getToken
      // console.log('ApiClient: Token from interceptor:', token ? 'Exists' : 'Null');
      // console.log('ApiClient: Request interceptor for:', config.url);

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

      // Handle 401 errors (unauthorized) - sign out user
      if (axiosError.response?.status === 401) {
        console.log('ApiClient: Unauthorized (401). Signing out...');
        try {
          await signOut({ redirectUrl: '/sign-in' });
        } catch (signOutError) {
          console.error('ApiClient: Error during sign out:', signOutError);
        }
        return Promise.reject(axiosError);
      }

      // Handle all other errors with user-friendly messages
      handleApiError(axiosError);

      return Promise.reject(axiosError);
    }
  );
};

// 3. Twoja funkcja `customInstance`.
//    Będzie używać `axiosInstance`, która zostanie skonfigurowana z interceptorami.
//    Orval może być skonfigurowany, aby używać tej funkcji jako mutatora.
export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  // `axiosInstance` będzie miała interceptory dodane przez `setupClerkInterceptors`
  // w momencie, gdy ta funkcja zostanie wywołana z komponentu klienckiego.
  return axiosInstance({
    ...config,
    ...options
  }).then(({ data }) => data);
};

// Możesz również wyeksportować `axiosInstance` bezpośrednio, jeśli Orval
// ma być skonfigurowany do używania instancji, a nie funkcji `customInstance`.
// export default axiosInstance;
