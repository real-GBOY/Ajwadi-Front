/** @format */

import apiClient from '@/config/axios';
import endPoints from '@/config/endPoints';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: Participant[];
  metadata?: {
    complaintId?: string;
    projectId?: string;
    proposalId?: string;
    participantType?: string;
    type?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  externalUserId: string;
  role: string;
  joinedAt: string;
}

// MongoDB response format (has _id instead of id)
interface MongoConversation extends Omit<Conversation, 'id'> {
  _id: string;
}

// MongoDB message format (has _id instead of id)
interface MongoMessage extends Omit<Message, 'id'> {
  _id: string;
}

/** API/socket can return attachment refs in message.metadata.attachments (with optional url/type). */
export interface MessageMetadataAttachment {
  externalFileId: string;
  label?: string;
  url?: string;
  type?: 'image' | 'file' | 'audio' | 'video';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Attachment[];
  replyTo?: string;
  reactions?: Reaction[];
  read: boolean;
  readAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  /** Backend stores attachment refs (and url/type) here; we normalize to attachments for display. */
  metadata?: { attachments?: MessageMetadataAttachment[] };
}

export interface Attachment {
  externalFileId: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  label?: string;
  metadata?: {
    duration?: number;
    format?: string;
    [key: string]: string | number | undefined;
  };
}

export interface Reaction {
  emoji: string;
  userId: string;
  count: number;
}

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  metadata?: {
    complaintId?: string;
    projectId?: string;
    proposalId?: string;
    participantType?: string;
    type?: string;
    [key: string]: string | undefined;
  };
}

/** Attachment ref for sending via socket (includes url so image displays; backend may accept in metadata). */
export interface AttachmentRef {
  externalFileId: string;
  label?: string;
  url?: string;
  type?: 'image' | 'file' | 'audio' | 'video';
}

export interface SendMessageRequest {
  content: string;
  /** @deprecated Prefer metadata.attachments so backend does not receive type/url */
  attachments?: Attachment[];
  /** Attachment refs in metadata (externalFileId only). Use this to avoid validation errors. */
  metadata?: {
    attachments?: AttachmentRef[];
  };
  replyTo?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  cursor?: string;
  hasMore: boolean;
}

export interface MessageListResponse {
  messages?: Message[];
  data?: Message[]; // API might return data instead of messages
  cursor?: string;
  hasMore?: boolean;
  pagination?: {
    hasMore: boolean;
    oldestId?: string;
    newestId?: string;
  };
}

const S3_MESSAGE_BASE = 'https://ajwadi.s3.eu-west-3.amazonaws.com/message';

function inferAttachmentType(label?: string, explicitType?: string): Attachment['type'] {
  if (explicitType === 'image' || explicitType === 'video' || explicitType === 'audio') return explicitType;
  const ext = (label || '').split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return 'audio';
  return 'file';
}

function metadataAttachmentToDisplay(m: MessageMetadataAttachment): Attachment {
  const type = inferAttachmentType(m.label, m.type as Attachment['type']);
  let url = m.url;
  if (!url && m.externalFileId && m.label) {
    url = `${S3_MESSAGE_BASE}/${m.externalFileId}-${encodeURIComponent(m.label)}`;
  }
  return {
    externalFileId: m.externalFileId,
    type,
    url: url || '',
    label: m.label,
  };
}

/**
 * Normalize a message for display: use id from _id if needed, and attachments from metadata.attachments.
 * Use for API responses and for socket message:new so images from metadata.attachments show correctly.
 */
export function normalizeMessageForDisplay(
  message: Message & { _id?: string; metadata?: { attachments?: MessageMetadataAttachment[] } }
): Message {
  const raw = message;
  const id = (raw._id && !raw.id ? raw._id : raw.id) as string;
  const metaList = raw.metadata?.attachments;
  let attachments: Attachment[] | undefined = raw.attachments as Attachment[] | undefined;
  if (metaList?.length) {
    attachments = metaList.map(metadataAttachmentToDisplay);
  }
  return {
    ...raw,
    id,
    attachments,
  } as Message;
}

class ChatService {
  /**
   * Normalize conversation response - convert _id to id
   */
  private normalizeConversation(conversation: Conversation | MongoConversation | null | undefined): Conversation {
    if (!conversation) {
      throw new Error('Conversation is null or undefined');
    }
    
    // If it has _id but no id, convert it
    if ('_id' in conversation && !('id' in conversation)) {
      const mongoConv = conversation as MongoConversation;
      return {
        ...mongoConv,
        id: mongoConv._id,
      } as Conversation;
    }
    
    // If it already has id, return as is
    if ('id' in conversation) {
      return conversation as Conversation;
    }
    
    throw new Error('Invalid conversation format');
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<Conversation | MongoConversation>(
      endPoints.chat.conversations.create,
      data
    );
    return this.normalizeConversation(response.data);
  }

  /**
   * Find or create a direct conversation between two users
   * First tries to find existing conversation, then creates if not found
   */
  async findOrCreateDirectConversation(
    participantIds: string[],
    options?: {
      currentUserId?: string;
      name?: string;
      metadata?: {
        complaintId?: string;
        projectId?: string;
        proposalId?: string;
        participantType?: string;
        type?: string;
        [key: string]: string | undefined;
      };
    }
  ): Promise<Conversation> {
    const { currentUserId, name, metadata } = options || {};
    
    // Ensure current user is ALWAYS included in participantIds (required by API)
    if (!currentUserId) {
      throw new Error('Current user ID is required to create a conversation');
    }
    
    // Ensure current user is included in participantIds (remove duplicates)
    const allParticipantIds = [...new Set([currentUserId, ...participantIds])];
    
    console.log('ChatService: Creating conversation with participants:', allParticipantIds);
    console.log('ChatService: Current user ID:', currentUserId);
    // First, try to find existing conversation
    try {
      const conversations = await this.getConversations({
        type: 'direct',
        limit: 50, // API limit is 50
      });

      // Find conversation with matching participants
      const existing = conversations.conversations.find((conv) => {
        const normalizedConv = this.normalizeConversation(conv);
        const convParticipantIds = normalizedConv.participants.map((p: Participant) => p.externalUserId).sort();
        const searchParticipantIds = [...allParticipantIds].sort();
        return (
          convParticipantIds.length === searchParticipantIds.length &&
          convParticipantIds.every((id: string, idx: number) => id === searchParticipantIds[idx])
        );
      });

      if (existing) {
        const normalized = this.normalizeConversation(existing);
        // Update metadata if provided
        if (metadata && Object.keys(metadata).length > 0) {
          // Note: The API might not support metadata updates, so we'll just return existing
          return normalized;
        }
        return normalized;
      }
    } catch (error) {
      // If finding fails, proceed to create
      console.warn('Failed to find existing conversation, creating new one:', error);
    }

    // Create new conversation
    const conversation = await this.createConversation({
      type: 'direct',
      participantIds: allParticipantIds,
      name,
      metadata,
    });
    
    return this.normalizeConversation(conversation);
  }

  /**
   * Get all conversations for the authenticated user
   */
  async getConversations(params?: {
    limit?: number;
    cursor?: string;
    type?: 'direct' | 'group';
  }): Promise<ConversationListResponse> {
    const response = await apiClient.get<ConversationListResponse & { conversations?: (Conversation | MongoConversation)[] }>(
      endPoints.chat.conversations.getAll,
      { params }
    );
    
    // Normalize all conversations
    const normalizedConversations = (response.data.conversations || []).map((conv: Conversation | MongoConversation) =>
      this.normalizeConversation(conv)
    );
    
    return {
      ...response.data,
      conversations: normalizedConversations,
    };
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation | MongoConversation>(endPoints.chat.conversations.getById(id));
    return this.normalizeConversation(response.data);
  }

  /**
   * Build display attachments from metadata.attachments (API puts refs + url/type there).
   */
  private buildAttachmentsFromMetadata(
    metadata?: Message['metadata'],
    fallbackAttachments?: Attachment[]
  ): Attachment[] | undefined {
    const metaList = metadata?.attachments;
    if (!metaList?.length) return fallbackAttachments?.length ? fallbackAttachments : undefined;
    return metaList.map(metadataAttachmentToDisplay);
  }

  /**
   * Normalize message response - convert _id to id, attachments from metadata.attachments
   */
  private normalizeMessage(message: Message | MongoMessage | null | undefined): Message {
    if (!message) {
      throw new Error('Message is null or undefined');
    }

    const raw = message as Message & { _id?: string; metadata?: Message['metadata'] };
    const id = raw._id && !raw.id ? raw._id : (raw.id as string);
    if (!id) throw new Error('Invalid message format');

    const attachments = this.buildAttachmentsFromMetadata(
      raw.metadata,
      Array.isArray(raw.attachments) ? raw.attachments : undefined
    );

    if ('_id' in message) {
      const mongoMsg = message as MongoMessage & { id?: string; metadata?: Message['metadata'] };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id: _, ...rest } = mongoMsg;
      return {
        ...rest,
        id,
        attachments,
      } as Message;
    }

    return {
      ...raw,
      id,
      attachments,
    } as Message;
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<Message> {
    const response = await apiClient.post<Message | MongoMessage>(
      endPoints.chat.messages.send(conversationId),
      data
    );
    return this.normalizeMessage(response.data);
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(
    conversationId: string,
    params?: {
      limit?: number;
      before?: string;
      after?: string;
      includeDeleted?: boolean;
    }
  ): Promise<MessageListResponse> {
    interface ApiResponse {
      messages?: (Message | MongoMessage)[];
      data?: (Message | MongoMessage)[];
      pagination?: {
        hasMore: boolean;
        oldestId?: string;
        newestId?: string;
      };
      hasMore?: boolean;
      cursor?: string;
    }
    
    const response = await apiClient.get<ApiResponse>(
      endPoints.chat.messages.getByConversation(conversationId),
      { params }
    );
    
    // API may return { data: [...] }, { messages: [...] }, or the array at top level
    const body = response.data as { messages?: unknown[]; data?: unknown[]; pagination?: ApiResponse['pagination']; hasMore?: boolean; cursor?: string } | unknown[];
    const messagesArray: (Message | MongoMessage)[] = Array.isArray(body)
      ? (body as (Message | MongoMessage)[])
      : ((body && typeof body === 'object' && (body.messages ?? body.data)) ?? []) as (Message | MongoMessage)[];
    const res = Array.isArray(body) ? null : (body as Record<string, unknown>);
    
    // Normalize all messages (including attachments from metadata.attachments)
    const normalizedMessages = messagesArray.map((msg) => this.normalizeMessage(msg));
    
    const result: MessageListResponse = {
      messages: normalizedMessages,
      hasMore: (res?.pagination as { hasMore?: boolean } | undefined)?.hasMore ?? (res?.hasMore as boolean) ?? false,
      cursor: res?.cursor as string | undefined,
      pagination: res?.pagination as MessageListResponse['pagination'],
    };
    
    return result;
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string, upToMessageId?: string): Promise<void> {
    await apiClient.put(endPoints.chat.conversations.markAsRead(conversationId), {
      upToMessageId,
    });
  }
}

export default new ChatService();
