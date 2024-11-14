import { useMutation, useQuery } from '@tanstack/react-query';
import { HobitApiRequest, HobitApiResponse } from '../types/api';
import { hobitApi } from '../api/api';

export function useHobitQueryApi<
  T extends HobitApiRequest,
  R extends { type: T['type'] } & HobitApiResponse,
>(req: T, queryKey?: any[]) {
  return useQuery({
    queryKey: queryKey ?? [req.type],
    queryFn: async () => {
      return hobitApi<T, R>(req);
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
      const resp = await hobitApi<T, R>({ type, ...req } as T);
      return resp;
    },
  });

  return mutateAsync;
}
