/** @format */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chatService, {
  Conversation,
  Message,
  MessageListResponse,
  CreateConversationRequest,
  SendMessageRequest,
} from '@/services/chatService';

const chatKeys = {
  conversations: {
    all: ['chat', 'conversations'] as const,
    lists: () => [...chatKeys.conversations.all, 'list'] as const,
    list: (params?: any) => [...chatKeys.conversations.lists(), params] as const,
    details: () => [...chatKeys.conversations.all, 'detail'] as const,
    detail: (id: string | null) => [...chatKeys.conversations.details(), id] as const,
  },
  messages: {
    all: ['chat', 'messages'] as const,
    lists: () => [...chatKeys.messages.all, 'list'] as const,
    list: (conversationId: string | null, params?: any) =>
      [...chatKeys.messages.lists(), conversationId, params] as const,
  },
};

/**
 * Find or create a direct conversation between users
 */
export function useFindOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation<
    Conversation,
    Error,
    { participantIds: string[]; currentUserId?: string; name?: string; metadata?: any }
  >({
    mutationFn: ({ participantIds, currentUserId, name, metadata }) =>
      chatService.findOrCreateDirectConversation(participantIds, {
        currentUserId,
        name,
        metadata,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(chatKeys.conversations.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations.lists() });
    },
  });
}

/**
 * Get conversation by ID
 */
export function useGetConversationById(id: string | null) {
  return useQuery<Conversation>({
    queryKey: chatKeys.conversations.detail(id),
    queryFn: () => chatService.getConversationById(id!),
    enabled: !!id,
  });
}

/**
 * Get messages for a conversation
 */
export function useGetMessages(
  conversationId: string | null,
  params?: {
    limit?: number;
    before?: string;
    after?: string;
    includeDeleted?: boolean;
  }
) {
  return useQuery<MessageListResponse>({
    queryKey: chatKeys.messages.list(conversationId, params),
    queryFn: () => chatService.getMessages(conversationId!, params),
    enabled: !!conversationId,
    refetchInterval: false, // Disable automatic polling - only refetch manually
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Only refetch when component mounts
  });
}

/**
 * Send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, { conversationId: string; data: SendMessageRequest }>({
    mutationFn: ({ conversationId, data }) => chatService.sendMessage(conversationId, data),
    onSuccess: (newMessage, variables) => {
      console.log('Message sent, updating cache for conversation:', variables.conversationId);
      console.log('New message:', newMessage);
      
      // Optimistically update the cache with the new message
      const queryKey = chatKeys.messages.list(variables.conversationId);
      const previousData = queryClient.getQueryData<MessageListResponse>(queryKey);
      
      console.log('Previous cache data:', previousData);
      
      // Get messages array (could be in messages or data field)
      const existingMessages = previousData?.messages || previousData?.data || [];
      
      if (previousData && existingMessages.length >= 0) {
        // Check if message already exists to avoid duplicates
        const messageExists = existingMessages.some((msg: Message) => msg.id === newMessage.id);
        
        if (!messageExists) {
          // Add the new message to the existing messages
          const updatedMessages = {
            ...previousData,
            messages: [...existingMessages, newMessage],
            // Remove data field if it exists, use messages instead
            data: undefined,
          };
          console.log('Updating cache with new message, total messages:', updatedMessages.messages.length);
          queryClient.setQueryData(queryKey, updatedMessages);
        } else {
          console.log('Message already exists in cache, skipping');
        }
      } else {
        // If no previous data, invalidate to fetch fresh data
        console.log('No previous cache data, invalidating to fetch');
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages.list(variables.conversationId),
        });
      }
    },
  });
}

/**
 * Mark conversation as read
 */
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { conversationId: string; upToMessageId?: string }>({
    mutationFn: ({ conversationId, upToMessageId }) =>
      chatService.markConversationAsRead(conversationId, upToMessageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages.list(variables.conversationId),
      });
    },
  });
}
