import { useMutation, useQuery } from '@tanstack/react-query';
import { HobitApiRequest, HobitApiResponse } from '../types/api';
import { hobitApi } from '../api/api';

export function useHobitQueryApi<
  T extends HobitApiRequest,
  C extends T['type'],
  R extends { type: C } & HobitApiResponse,
>(type: C, req?: Omit<T, 'type'>, queryKey?: any[]) {
  return useQuery({
    queryKey: queryKey ?? [type, req],
    queryFn: async () => {
      return hobitApi<T, R>({ type, ...req } as T, 'GET');
    },
  });
}

export function useHobitMutateApi<
  T extends HobitApiRequest,
  C extends T['type'],
  R extends { type: C } & HobitApiResponse,
>(type: C) {
  const { mutateAsync } = useMutation({
    mutationFn: async (req?: Omit<T, 'type'>) => {
      const resp = await hobitApi<T, R>({ type, ...req } as T, 'POST');
      return resp;
    },
  });

  return mutateAsync;
}
