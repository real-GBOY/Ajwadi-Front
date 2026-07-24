/** @format */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import complaintService, {
  Complaint,
  ComplaintListResponse,
  ComplaintResponse,
  ComplaintCountResponse,
  CreateComplaintRequest,
  UpdateComplaintRequest,
  ListComplaintsParams,
  ComplaintCountParams,
} from '@/services/complaintService';
import { reactQueryKeys } from './complaint.queries';

/**
 * Get all complaints with optional filters and pagination
 */
export function useListComplaints(
  params?: ListComplaintsParams,
  options?: { enabled?: boolean }
) {
  return useQuery<ComplaintListResponse>({
    queryKey: reactQueryKeys.complaints.list(params),
    queryFn: () => complaintService.getAll(params),
    enabled: options?.enabled !== false,
  });
}

/**
 * Get a complaint by ID
 */
export function useGetComplaintById(id: string | number | null) {
  return useQuery<ComplaintResponse>({
    queryKey: reactQueryKeys.complaints.detail(id),
    queryFn: () => complaintService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Get complaints count with optional filters
 */
export function useGetComplaintsCount(params?: ComplaintCountParams) {
  return useQuery<ComplaintCountResponse>({
    queryKey: reactQueryKeys.complaints.count(params),
    queryFn: () => complaintService.getCount(params),
  });
}

/**
 * Create a new complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, CreateComplaintRequest>({
    mutationFn: (data) => complaintService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
    },
  });
}

/**
 * Update a complaint
 */
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, { id: string | number; data: UpdateComplaintRequest }>(
    {
      mutationFn: ({ id, data }) => complaintService.update(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
        queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
      },
    }
  );
}

/**
 * Delete a complaint
 */
export function useDeleteComplaint() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string | number>({
    mutationFn: (id) => complaintService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
    },
  });
}

/**
 * Mark complaint as read
 */
export function useMarkComplaintAsRead() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string | number>({
    mutationFn: (id) => complaintService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
    },
  });
}

/**
 * Mark complaint as unread
 */
export function useMarkComplaintAsUnread() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string | number>({
    mutationFn: (id) => complaintService.markAsUnread(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
    },
  });
}

/**
 * Pin a complaint
 */
export function usePinComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string | number>({
    mutationFn: (id) => complaintService.pin(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(id) });
    },
  });
}

/**
 * Unpin a complaint
 */
export function useUnpinComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string | number>({
    mutationFn: (id) => complaintService.unpin(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(id) });
    },
  });
}

/**
 * Resolve a complaint
 */
export function useResolveComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string | number>({
    mutationFn: (id) => complaintService.resolve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.detail(id) });
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.complaints.count() });
    },
  });
}
