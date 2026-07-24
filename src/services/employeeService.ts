/** @format */

import apiClient from '@/config/axios';
import endpoints from '@/config/endPoints';

// Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  roleId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  Role?: {
    id: string;
    key: string;
    name: string;
  };
}

export interface EmployeeListResponse {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EmployeeLoginRequest {
  email: string;
  password: string;
  fcmToken?: string;
}

export interface EmployeeLoginResponse {
  employee: Employee;
  token: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleId: string;
  fcmToken?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  fcmToken?: string;
}

// Transform function
const transformEmployee = (item: any): Employee => ({
  id: item.id,
  name: item.name,
  email: item.email,
  phone: item.phone,
  address: item.address,
  roleId: item.roleId,
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  Role: item.Role
    ? {
        id: item.Role.id,
        key: item.Role.key,
        name: item.Role.name,
      }
    : undefined,
});

export const employeeService = {
  list: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<EmployeeListResponse> => {
    const response = await apiClient.get(endpoints.employees.getAll, {
      params: filters,
    });

    // API response structure: { success, message, data: [...], pagination: {...} }
    const backendData = response.data;
    const dataArray = backendData.data || [];
    const pagination = backendData.pagination || {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      data: dataArray.map(transformEmployee),
      pagination: {
        page: Number(pagination.page || 1),
        limit: Number(pagination.limit || 10),
        totalItems: Number(pagination.totalItems || 0),
        totalPages: Number(pagination.totalPages || 1),
        hasNextPage: Boolean(pagination.hasNextPage),
        hasPreviousPage: Boolean(pagination.hasPreviousPage),
      },
    };
  },

  getById: async (id: string | number): Promise<Employee> => {
    const response = await apiClient.get(endpoints.employees.getById(id));
    const data = response.data?.data || response.data;
    return transformEmployee(data);
  },

  create: async (payload: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post(endpoints.employees.create, payload);
    const data = response.data?.data || response.data;
    return transformEmployee(data);
  },

  update: async (
    id: string | number,
    payload: UpdateEmployeeRequest
  ): Promise<Employee> => {
    const response = await apiClient.put(endpoints.employees.update(id), payload);
    const data = response.data?.data || response.data;
    return transformEmployee(data);
  },

  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(endpoints.employees.delete(id));
  },

  login: async (
    payload: EmployeeLoginRequest
  ): Promise<EmployeeLoginResponse> => {
    const response = await apiClient.post(endpoints.employees.login, payload);
    const data = response.data?.data || response.data;
    const employee = transformEmployee(data.employee || data);
    const token = data.token;
    return { employee, token };
  },
};

export default employeeService;

