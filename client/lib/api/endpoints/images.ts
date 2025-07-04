/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import { customInstance } from '../axios';
import type { GetUploadSignatureParams, ProblemDetails, UploadSignatureResult } from '../models';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getUploadSignature = (
  params?: GetUploadSignatureParams,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<UploadSignatureResult>(
    { url: `/api/images/upload-signature`, method: 'GET', params, signal },
    options
  );
};

export const getGetUploadSignatureQueryKey = (params?: GetUploadSignatureParams) => {
  return [`/api/images/upload-signature`, ...(params ? [params] : [])] as const;
};

export const getGetUploadSignatureQueryOptions = <
  TData = Awaited<ReturnType<typeof getUploadSignature>>,
  TError = ProblemDetails
>(
  params?: GetUploadSignatureParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUploadSignature>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetUploadSignatureQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUploadSignature>>> = ({ signal }) =>
    getUploadSignature(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getUploadSignature>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type GetUploadSignatureQueryResult = NonNullable<Awaited<ReturnType<typeof getUploadSignature>>>;
export type GetUploadSignatureQueryError = ProblemDetails;

export function useGetUploadSignature<TData = Awaited<ReturnType<typeof getUploadSignature>>, TError = ProblemDetails>(
  params: undefined | GetUploadSignatureParams,
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUploadSignature>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getUploadSignature>>,
          TError,
          Awaited<ReturnType<typeof getUploadSignature>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useGetUploadSignature<TData = Awaited<ReturnType<typeof getUploadSignature>>, TError = ProblemDetails>(
  params?: GetUploadSignatureParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUploadSignature>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getUploadSignature>>,
          TError,
          Awaited<ReturnType<typeof getUploadSignature>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useGetUploadSignature<TData = Awaited<ReturnType<typeof getUploadSignature>>, TError = ProblemDetails>(
  params?: GetUploadSignatureParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUploadSignature>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

export function useGetUploadSignature<TData = Awaited<ReturnType<typeof getUploadSignature>>, TError = ProblemDetails>(
  params?: GetUploadSignatureParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUploadSignature>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getGetUploadSignatureQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const deleteImage = (publicId: string, options?: SecondParameter<typeof customInstance>) => {
  return customInstance<void>({ url: `/api/images/${publicId}`, method: 'DELETE' }, options);
};

export const getDeleteImageMutationOptions = <TError = ProblemDetails, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteImage>>, TError, { publicId: string }, TContext>;
  request?: SecondParameter<typeof customInstance>;
}): UseMutationOptions<Awaited<ReturnType<typeof deleteImage>>, TError, { publicId: string }, TContext> => {
  const mutationKey = ['deleteImage'];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteImage>>, { publicId: string }> = (props) => {
    const { publicId } = props ?? {};

    return deleteImage(publicId, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteImageMutationResult = NonNullable<Awaited<ReturnType<typeof deleteImage>>>;

export type DeleteImageMutationError = ProblemDetails;

export const useDeleteImage = <TError = ProblemDetails, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteImage>>, TError, { publicId: string }, TContext>;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseMutationResult<Awaited<ReturnType<typeof deleteImage>>, TError, { publicId: string }, TContext> => {
  const mutationOptions = getDeleteImageMutationOptions(options);

  return useMutation(mutationOptions, queryClient);
};
