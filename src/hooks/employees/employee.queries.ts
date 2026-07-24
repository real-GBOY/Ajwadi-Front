/** @format */

import { useQuery } from '@tanstack/react-query';
import { reactQueryKeys } from '@/config/reactQueryKeys';
import { employeeService } from '@/services/employeeService';

const employeeKeys = reactQueryKeys.employees;

export const useListEmployees = (
  filters?: {
    page?: number;
    limit?: number;
    search?: string;
  },
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeService.list(filters),
    enabled: options?.enabled !== false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

export const useGetEmployeeById = (
  id: string | number | null,
  options?: {
    enabled?: boolean;
  }
) =>
  useQuery({
    queryKey: employeeKeys.detail(id!),
    queryFn: () => employeeService.getById(id!),
    enabled: (options?.enabled !== false) && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

