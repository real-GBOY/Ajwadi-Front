import { io, Socket } from 'socket.io-client';
import { Message, AttachmentRef } from './chatService';

// Get WebSocket URL from environment
const getWebSocketUrl = (): string => {
  // If VITE_WS_URL is explicitly set, use it
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  /**
   * Otherwise, derive it from the API base URL to avoid environment mismatches.
   * - If VITE_API_BASE_URL is absolute (e.g. http://localhost:5000/api) -> use http://localhost:5000
   * - If VITE_API_BASE_URL is relative (/api) -> use current origin (e.g. http://localhost:5173)
   *
   * Note: Socket.IO client expects an http(s) base URL (not ws(s)).
   */
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiBaseUrl && typeof apiBaseUrl === 'string') {
    const trimmed = apiBaseUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed.replace(/\/api\/?$/, '');
    }
  }

  // Fallback to same origin (works when API is proxied under /api in Vite)
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // Last resort fallback (should be overridden by env in most setups)
  return 'http://localhost:5000';
};

const WS_URL = getWebSocketUrl();
console.log('WebSocket URL:', WS_URL);

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        this.socket?.on('connect', () => resolve());
        this.socket?.on('connect_error', reject);
        return;
      }

      this.isConnecting = true;

      // Log token info (first 20 chars only for security)
      const tokenPreview = token ? `${token.substring(0, 20)}...` : 'No token';
      console.log('Connecting to WebSocket:', WS_URL);
      console.log('Token preview:', tokenPreview);
      
      // Some Socket.IO servers expect the token in different formats
      // Try sending it in auth object (most common)
      this.socket = io(WS_URL, {
        auth: {
          token, // Send raw token (server should handle validation)
        },
        // Also try in headers as fallback
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        // Add timeout for connection
        timeout: 20000,
      });

      let authenticationResolved = false;

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        // Don't resolve yet - wait for authentication
        // Authentication happens after connection in Socket.IO
      });

      // Listen for successful authentication (if server sends this event)
      this.socket.on('authenticated', () => {
        console.log('Socket authenticated successfully');
        this.isConnecting = false;
        authenticationResolved = true;
        if (!authenticationResolved) {
          resolve();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Check if it's an authentication error
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data as { code?: string; message?: string };
          if (errorData?.code === 'UNAUTHORIZED') {
            console.error('Authentication failed during connection:', errorData);
            this.isConnecting = false;
            this.disconnect();
            authenticationResolved = true;
            reject(new Error(`Socket authentication failed: ${errorData.message || 'Invalid token'}`));
            return;
          }
        }
        this.isConnecting = false;
        authenticationResolved = true;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        // If we were waiting for authentication and got disconnected, reject
        if (!authenticationResolved && this.isConnecting) {
          this.isConnecting = false;
          authenticationResolved = true;
          reject(new Error(`Socket disconnected before authentication: ${reason}`));
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        // Handle authentication errors that occur after connection
        if (error && typeof error === 'object' && 'code' in error && error.code === 'UNAUTHORIZED') {
          const errorMessage = 'message' in error ? error.message : 'Invalid authentication token';
          console.error('Socket authentication failed:', errorMessage);
          console.warn('This might be because the Socket.IO server does not accept employee tokens.');
          console.warn('The server needs to be updated to accept employee JWT tokens for dashboard access.');
          // Disconnect on auth failure
          this.disconnect();
          // Reject if we haven't resolved yet
          if (!authenticationResolved && this.isConnecting) {
            this.isConnecting = false;
            authenticationResolved = true;
            reject(new Error(`Socket authentication failed: ${errorMessage}`));
          }
        }
      });

      // Listen for authentication errors specifically
      this.socket.on('exception', (error: { code?: string; message?: string }) => {
        if (error.code === 'UNAUTHORIZED' || error.message?.includes('Invalid authentication')) {
          console.error('Socket authentication failed:', error);
          this.disconnect();
          // Reject if we haven't resolved yet
          if (!authenticationResolved && this.isConnecting) {
            this.isConnecting = false;
            authenticationResolved = true;
            reject(new Error(`Socket authentication failed: ${error.message || 'Invalid token'}`));
          }
        }
      });

      // Set a timeout for authentication - if no error after 3 seconds, assume authenticated
      setTimeout(() => {
        if (!authenticationResolved && this.isConnecting && this.socket?.connected) {
          console.log('Socket connection established, assuming authenticated (no error received)');
          this.isConnecting = false;
          authenticationResolved = true;
          resolve();
        }
      }, 3000);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Join a conversation room
   */
  joinRoom(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('conversation:join', { conversationId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log('Joined conversation room:', conversationId);
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  /**
   * Leave a conversation room
   */
  leaveRoom(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        resolve(); // Already disconnected
        return;
      }

      this.socket.emit('conversation:leave', { conversationId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log('Left conversation room:', conversationId);
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to leave room'));
        }
      });
    });
  }

  /**
   * Send a message via Socket.IO
   */
  sendMessage(
    conversationId: string,
    content: string,
    options?: {
      /** Attachment refs only (externalFileId, label). Sent in metadata to avoid validation error on type/url. */
      attachmentRefs?: AttachmentRef[];
      replyTo?: string;
    }
  ): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const payload: {
        conversationId: string;
        content: string;
        metadata?: { attachments?: AttachmentRef[] };
        replyTo?: string;
      } = {
        conversationId,
        content: content || ' ',
        replyTo: options?.replyTo,
      };
      if (options?.attachmentRefs?.length) {
        payload.metadata = { attachments: options.attachmentRefs };
      }

      this.socket.emit(
        'message:send',
        payload,
        (response: {
          success: boolean;
          // Some servers use `data`, others use `message` for the payload
          data?: Omit<Message, 'id'> & { id?: string; _id?: string };
          message?: unknown;
          error?: string;
        }) => {
          const isRecord = (v: unknown): v is Record<string, unknown> =>
            typeof v === 'object' && v !== null;

          type AckMessage = Omit<Message, 'id'> & { id?: string; _id?: string };

          const isMessageLike = (v: unknown): v is AckMessage => {
            if (!isRecord(v)) return false;
            // Minimal shape check
            return (
              typeof v.conversationId === 'string' &&
              typeof v.senderId === 'string' &&
              typeof v.content === 'string' &&
              (typeof v.id === 'string' || typeof v._id === 'string')
            );
          };

          const payloadMessage: AckMessage | undefined =
            response.data ?? (isMessageLike(response.message) ? response.message : undefined);

          // Helpful debug logging (server sometimes returns success:true with `message` instead of `data`)
          console.log('Socket ACK message:send', {
            conversationId,
            success: response?.success,
            hasData: Boolean(response?.data),
            hasMessage: Boolean(response?.message),
            error: response?.error,
            response,
          });

          if (response?.success && payloadMessage) {
            // Normalize MongoDB `_id` to `id` if needed
            const id = payloadMessage.id ?? payloadMessage._id;
            if (!id) {
              reject(new Error(`Failed to send message (missing id in ack: ${JSON.stringify(response)})`));
              return;
            }
            const normalized: Message = { ...payloadMessage, id } as Message;
            resolve(normalized);
            return;
          }

          // Provide richer error context for debugging
          const msg =
            response?.error ||
            (response
              ? `Failed to send message (ack: ${JSON.stringify(response)})`
              : 'Failed to send message');
          reject(new Error(msg));
        }
      );
    });
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (message: Message) => void): void {
    this.socket?.on('message:new', callback);
  }

  /**
   * Remove message listener
   */
  offMessage(callback: (message: Message) => void): void {
    this.socket?.off('message:new', callback);
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: { conversationId: string; userId: string; isTyping: boolean }) => void): void {
    this.socket?.on('user:typing', callback);
  }

  /**
   * Remove typing listener
   */
  offTyping(callback: (data: { conversationId: string; userId: string; isTyping: boolean }) => void): void {
    this.socket?.off('user:typing', callback);
  }

  /**
   * Send typing indicator
   */
  startTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing:start', { conversationId });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing:stop', { conversationId });
    }
  }

  /**
   * Mark conversation as read
   */
  markAsRead(conversationId: string, upToMessageId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'conversation:read',
        { conversationId, upToMessageId },
        (response: { success: boolean; error?: string }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to mark as read'));
          }
        }
      );
    });
  }

  /**
   * Generic event listener
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: unknown[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
