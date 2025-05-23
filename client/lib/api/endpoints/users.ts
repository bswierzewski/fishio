/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * Fishio API
 * OpenAPI spec version: v1
 */
import { useQuery } from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import { customInstance } from '../axios';
import type { SearchAvailableUsersParams, Void } from '../models';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const searchAvailableUsers = (
  params?: SearchAvailableUsersParams,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal
) => {
  return customInstance<Void>({ url: `/api/users/search`, method: 'GET', params, signal }, options);
};

export const getSearchAvailableUsersQueryKey = (params?: SearchAvailableUsersParams) => {
  return [`/api/users/search`, ...(params ? [params] : [])] as const;
};

export const getSearchAvailableUsersQueryOptions = <
  TData = Awaited<ReturnType<typeof searchAvailableUsers>>,
  TError = unknown
>(
  params?: SearchAvailableUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof searchAvailableUsers>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  }
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getSearchAvailableUsersQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof searchAvailableUsers>>> = ({ signal }) =>
    searchAvailableUsers(params, requestOptions, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof searchAvailableUsers>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData, TError> };
};

export type SearchAvailableUsersQueryResult = NonNullable<Awaited<ReturnType<typeof searchAvailableUsers>>>;
export type SearchAvailableUsersQueryError = unknown;

export function useSearchAvailableUsers<TData = Awaited<ReturnType<typeof searchAvailableUsers>>, TError = unknown>(
  params: undefined | SearchAvailableUsersParams,
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof searchAvailableUsers>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof searchAvailableUsers>>,
          TError,
          Awaited<ReturnType<typeof searchAvailableUsers>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useSearchAvailableUsers<TData = Awaited<ReturnType<typeof searchAvailableUsers>>, TError = unknown>(
  params?: SearchAvailableUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof searchAvailableUsers>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof searchAvailableUsers>>,
          TError,
          Awaited<ReturnType<typeof searchAvailableUsers>>
        >,
        'initialData'
      >;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };
export function useSearchAvailableUsers<TData = Awaited<ReturnType<typeof searchAvailableUsers>>, TError = unknown>(
  params?: SearchAvailableUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof searchAvailableUsers>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

export function useSearchAvailableUsers<TData = Awaited<ReturnType<typeof searchAvailableUsers>>, TError = unknown>(
  params?: SearchAvailableUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof searchAvailableUsers>>, TError, TData>>;
    request?: SecondParameter<typeof customInstance>;
  },
  queryClient?: QueryClient
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {
  const queryOptions = getSearchAvailableUsersQueryOptions(params, options);

  const query = useQuery(queryOptions, queryClient) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}
