import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, Image, File, Loader2, User, Users, Download, Play } from 'lucide-react';
import {
  useGetConversationById,
  useGetMessages,
} from '../hooks/chat/useChat';
import { Message, Attachment, normalizeMessageForDisplay } from '../services/chatService';
import apiClient from '../config/axios';
import endPoints from '../config/endPoints';
import axios from 'axios';
import { getCurrentUserId } from '../utils/getCurrentUserId';
import Loader from '../designSystem/Loader';
import { useChatSocket } from '../hooks/chat/useChatSocket';
import socketService from '../services/socketService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  conversationName?: string;
  participantName?: string;
  participantId?: string;
}

export default function ChatModal({
  isOpen,
  onClose,
  conversationId,
  conversationName,
  participantName,
  participantId,
}: ChatModalProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Socket connection
  const { isConnected } = useChatSocket();

  // Get conversation details
  const { data: conversation, isLoading: conversationLoading } = useGetConversationById(conversationId);
  
  // Get initial messages from API (only once when conversation opens)
  const { data: messagesData, isLoading: messagesLoading } = useGetMessages(conversationId, {
    limit: 50,
  });
  
  // Socket-only sending (no API fallback)
  
  type UiMessage = Message & {
    /** Client-only status for optimistic UX */
    localStatus?: 'sending' | 'sent' | 'failed';
    localError?: string;
  };

  const sortMessagesAsc = useCallback((msgs: UiMessage[]) => {
    return [...msgs].sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      if (at !== bt) return at - bt;
      return String(a.id).localeCompare(String(b.id));
    });
  }, []);

  const getStableMessageKey = useCallback((message: Message) => {
    const attachmentsKey = (message.attachments || [])
      .map((a) => a.externalFileId || a.url || a.label || '')
      .join(',');
    return `${message.senderId}|${message.content}|${attachmentsKey}`;
  }, []);

  // Local messages state for real-time updates + optimistic sending
  const [messages, setMessages] = useState<UiMessage[]>([]);
  
  // Initialize messages from API
  useEffect(() => {
    const initialMessages = messagesData?.messages ?? messagesData?.data;
    if (initialMessages && Array.isArray(initialMessages)) {
      setMessages(sortMessagesAsc(initialMessages as UiMessage[]));
    }
  }, [messagesData?.messages, messagesData?.data, sortMessagesAsc]);

  const currentUserId = getCurrentUserId();

  // Dedupe incoming messages in case server emits duplicates with different ids
  const seenMessageKeysRef = useRef<Set<string>>(new Set());

  // Join conversation room when modal opens and conversationId is available
  useEffect(() => {
    if (isOpen && conversationId && isConnected) {
      socketService.joinRoom(conversationId).catch((error) => {
        console.error('Failed to join room:', error);
      });
    }

    return () => {
      if (conversationId && isConnected) {
        socketService.leaveRoom(conversationId).catch((error) => {
          console.error('Failed to leave room:', error);
        });
      }
    };
  }, [isOpen, conversationId, isConnected]);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!isConnected || !conversationId) return;

    const handleNewMessage = (message: Message & { _id?: string; metadata?: { attachments?: Array<{ externalFileId: string; label?: string; url?: string; type?: string }> } }) => {
      // Normalize: _id -> id, and attachments from metadata.attachments (so images with url show)
      const normalizedMessage = normalizeMessageForDisplay(message);

      const stableKey = getStableMessageKey(normalizedMessage);

      // Only add if it's for this conversation and doesn't already exist
      if (normalizedMessage.conversationId === conversationId) {
        setMessages((prev: UiMessage[]) => {
          const idKey = normalizedMessage.id;

          // If we have an optimistic message waiting, replace it instead of adding a new one.
          const optimisticIdx = prev.findIndex(
            (m) =>
              m.localStatus === 'sending' &&
              getStableMessageKey(m) === stableKey
          );

          if (optimisticIdx >= 0) {
            const next = [...prev];
            next[optimisticIdx] = { ...normalizedMessage, localStatus: 'sent' };
            seenMessageKeysRef.current.add(idKey);
            seenMessageKeysRef.current.add(stableKey);
            return sortMessagesAsc(next);
          }

          const alreadySeen =
            seenMessageKeysRef.current.has(idKey) || seenMessageKeysRef.current.has(stableKey);

          if (!alreadySeen) {
            seenMessageKeysRef.current.add(idKey);
            seenMessageKeysRef.current.add(stableKey);
            if (seenMessageKeysRef.current.size > 500) {
              seenMessageKeysRef.current = new Set([idKey, stableKey]);
            }
          }

          if (alreadySeen || prev.some((msg: UiMessage) => msg.id === idKey)) {
            return prev;
          }

          return sortMessagesAsc([...prev, { ...normalizedMessage, localStatus: 'sent' }]);
        });
      }
    };

    socketService.onMessage(handleNewMessage);

    return () => {
      socketService.offMessage(handleNewMessage);
    };
  }, [isConnected, conversationId, sortMessagesAsc, getStableMessageKey]);

  // Scroll to bottom when new messages arrive
  const didInitialScrollRef = useRef(false);
  useEffect(() => {
    if (messagesEndRef.current) {
      const behavior: ScrollBehavior = didInitialScrollRef.current ? 'smooth' : 'auto';
      messagesEndRef.current.scrollIntoView({ behavior });
      didInitialScrollRef.current = true;
    }
  }, [messages.length]);

  // Mark conversation as read when viewing (debounced to avoid multiple requests)
  const lastMessageIdRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (conversationId && messages.length > 0 && isConnected) {
      const lastMessage = messages[messages.length - 1];
      const isTempMessage = typeof lastMessage.id === 'string' && lastMessage.id.startsWith('temp-');
      const isFromMe = !!currentUserId && lastMessage.senderId === currentUserId;

      // Never mark optimistic/temp messages as read, and don't mark your own messages as read.
      if (isTempMessage || isFromMe) {
        return;
      }

      // Only mark as read if this is a new message we haven't seen before
      if (lastMessage && lastMessage.id !== lastMessageIdRef.current && !lastMessage.read) {
        lastMessageIdRef.current = lastMessage.id;
        
        // Clear any pending mark as read
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
        
        // Debounce mark as read to avoid multiple requests (wait 2 seconds)
        markAsReadTimeoutRef.current = setTimeout(() => {
          socketService.markAsRead(conversationId, lastMessage.id).catch((error) => {
            console.error('Failed to mark as read:', error);
          });
        }, 2000);
      }
    }
    
    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length, isConnected]); // Only depend on messages.length to avoid re-running on every message change

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessageText('');
      setSelectedFiles([]);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    console.log('handleSendMessage called', {
      conversationId,
      messageText: messageText.trim(),
      selectedFiles: selectedFiles.length,
      isConnected,
      uploadingFiles,
    });

    if (!conversationId) {
      console.error('No conversation ID - cannot send message');
      alert('خطأ: لا يوجد معرف محادثة. يرجى الانتظار حتى يتم إنشاء المحادثة.');
      return;
    }

    if (!messageText.trim() && selectedFiles.length === 0) {
      console.warn('No message text or files');
      return;
    }

    if (!isConnected) {
      console.error('Socket not connected');
      alert('غير متصل بالخادم. يرجى المحاولة مرة أخرى بعد الاتصال.');
      return;
    }

    if (isSending || uploadingFiles) {
      console.warn('Already sending message');
      return;
    }

    try {
      setIsSending(true);
      setUploadingFiles(true);
      let attachments: Attachment[] = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          let fileType: 'image' | 'file' | 'audio' | 'video' = 'file';
          
          // Determine file type
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
            fileType = 'image';
          } else if (['mp4', 'avi', 'mov', 'webm'].includes(fileExtension)) {
            fileType = 'video';
          } else if (['mp3', 'wav', 'm4a', 'ogg'].includes(fileExtension)) {
            fileType = 'audio';
          }

          // Get upload URL from backend
          const fileTypeForUpload = fileType === 'file' ? 'document' : fileType;
          const uploadUrlResponse = await apiClient.post(endPoints.s3.getUploadUrl, {
            fileName: file.name,
            fileType: fileTypeForUpload,
            filePurpose: 'message',
          });

          const { uploadUrl, file: fileData } = uploadUrlResponse.data.data;

          // Upload file to S3
          await axios.put(uploadUrl, file, {
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          // Normalize URL: spaces in file names break img src (blue square). Use encoded URL for display.
          const url = typeof fileData.url === 'string' ? fileData.url.replace(/ /g, '%20') : fileData.url;

          return {
            externalFileId: fileData.id,
            type: fileType,
            url,
            label: file.name,
          } as Attachment;
        });

        attachments = await Promise.all(uploadPromises);
      }

      // Send message via Socket.IO
      console.log('Sending message via Socket.IO', {
        conversationId,
        content: messageText.trim(),
        attachmentsCount: attachments.length,
      });

      // Ensure at least content or attachments is present
      if (!messageText.trim() && attachments.length === 0) {
        console.error('Cannot send message: no content or attachments');
        alert('يرجى إدخال رسالة أو إرفاق ملف');
        setUploadingFiles(false);
        setIsSending(false);
        return;
      }

      // Optimistic update: show temp message as "sending"
      const tempId = `temp-${Date.now()}`;
      const optimisticCreatedAt = new Date().toISOString();
      const optimistic: UiMessage = {
        id: tempId,
        conversationId,
        senderId: currentUserId || 'me',
        content: messageText.trim() || ' ',
        attachments: attachments.length > 0 ? attachments : undefined,
        read: false,
        createdAt: optimisticCreatedAt,
        updatedAt: optimisticCreatedAt,
        localStatus: 'sending',
      };

      setMessages((prev) => sortMessagesAsc([...prev, optimistic]));

      // Send attachment refs with url (and type) in message metadata so backend and UI have direct URL
      const attachmentRefs = attachments.map((a) => ({
        externalFileId: a.externalFileId,
        label: a.label,
        url: a.url,
        type: a.type,
      }));

      try {
        const sentMessage = await socketService.sendMessage(conversationId, optimistic.content, {
          attachmentRefs: attachmentRefs.length ? attachmentRefs : undefined,
        });

        const normalizedSent = normalizeMessageForDisplay(sentMessage as Message & { _id?: string; metadata?: { attachments?: Array<{ externalFileId: string; label?: string; url?: string; type?: string }> } });
        const stableKey = getStableMessageKey(normalizedSent);
        seenMessageKeysRef.current.add(normalizedSent.id);
        seenMessageKeysRef.current.add(stableKey);

        // Prefer our full attachment data (url/type) when we have it; otherwise use normalized metadata.attachments
        const mergedAttachments =
          normalizedSent.attachments?.length && attachments.length
            ? normalizedSent.attachments.map((serverAtt) => {
                const full = attachments.find((a) => a.externalFileId === serverAtt.externalFileId);
                return full ?? serverAtt;
              })
            : normalizedSent.attachments ?? optimistic.attachments;

        const messageToShow: UiMessage = {
          ...normalizedSent,
          attachments: mergedAttachments?.length ? mergedAttachments : undefined,
          localStatus: 'sent',
        };

        // Replace temp message with real one
        setMessages((prev) =>
          sortMessagesAsc(
            prev.map((m) => (m.id === tempId ? messageToShow : m))
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Mark message as failed (so user knows it didn't send)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? ({ ...m, localStatus: 'failed', localError: msg } as UiMessage) : m
          )
        );
        throw err;
      }

      setMessageText('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      alert(`خطأ في إرسال الرسالة: ${errorMessage}`);
    } finally {
      setUploadingFiles(false);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) {
      return 'أنت';
    }
    if (senderId === participantId) {
      return participantName || 'مستخدم';
    }
    // Try to get from conversation participants
    const participant = conversation?.participants.find((p) => p.externalUserId === senderId);
    return participant ? 'مستخدم' : 'مستخدم';
  };

  const getSenderAvatar = (senderId: string) => {
    const isCurrentUser = senderId === currentUserId;
    
    if (isCurrentUser) {
      // Employee image URL
      const employeeImageUrl = 'https://i.postimg.cc/QdmF6X75/apple-touch-icon.png';
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
          <img
            src={employeeImageUrl}
            alt="Employee"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center hidden">
            <User className="w-5 h-5" style={{ color: 'var(--c-primary)' }} />
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-blue-600" />
      </div>
    );
  };

  const isFromCurrentUser = (senderId: string) => senderId === currentUserId;

  /** S3 URLs with spaces in filename break img src; normalize for display. */
  const safeAttachmentUrl = (url: string | undefined) =>
    url && typeof url === 'string' ? url.replace(/ /g, '%20') : url || '';

  const renderAttachment = (attachment: Attachment) => {
    const src = safeAttachmentUrl(attachment.url);
    if (attachment.type === 'image') {
      if (!src) {
        return (
          <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-text-sub">
            {attachment.label || 'صورة'}
          </div>
        );
      }
      return (
        <div className="mt-2">
          <img
            src={src}
            alt={attachment.label || 'صورة'}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.open(src, '_blank')}
          />
        </div>
      );
    }

    if (attachment.type === 'video') {
      return (
        <div className="mt-2">
          <video
            src={src}
            controls
            className="max-w-xs rounded-lg"
            style={{ maxHeight: '300px' }}
          />
        </div>
      );
    }

    if (attachment.type === 'audio') {
      return (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Play className="w-5 h-5" style={{ color: 'var(--c-primary)' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-strong">{attachment.label || 'ملف صوتي'}</p>
            {attachment.metadata?.duration && (
              <p className="text-xs text-text-sub">{attachment.metadata.duration} ثانية</p>
            )}
          </div>
          <a
            href={src}
            download
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-text-sub" />
          </a>
        </div>
      );
    }

    // File attachment
    return (
      <div className="mt-2 p-3 bg-gray-100 rounded-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <File className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-strong truncate">
            {attachment.label || 'ملف'}
          </p>
          <p className="text-xs text-text-sub">مرفق</p>
        </div>
        <a
          href={src}
          download
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <Download className="w-4 h-4 text-text-sub" />
        </a>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      dir="rtl">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-strong">
                {conversationName || 'المحادثة'}
              </h2>
              {participantName && (
                <p className="text-xs text-text-sub">مع {participantName}</p>
              )}
              {!isConnected && (
                <p className="text-xs text-red-500">غير متصل</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-sub" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {!conversationId ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader />
                <p className="text-text-sub mt-4">جاري إنشاء المحادثة...</p>
              </div>
            </div>
          ) : conversationLoading || messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-text-sub">لا توجد رسائل بعد. ابدأ المحادثة!</p>
            </div>
          ) : (
            messages.map((message: Message) => {
              const displayMessage = normalizeMessageForDisplay(message as Message & { _id?: string; metadata?: { attachments?: Array<{ externalFileId: string; label?: string; url?: string; type?: string }> } });
              const isCurrentUserMessage = isFromCurrentUser(displayMessage.senderId);

              return (
                <div
                  key={displayMessage.id}
                  className={`flex items-start gap-3 ${isCurrentUserMessage ? 'flex-row-reverse' : ''}`}>
                  {getSenderAvatar(displayMessage.senderId)}
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isCurrentUserMessage ? 'items-end' : 'items-start'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-strong">
                        {getSenderName(displayMessage.senderId)}
                      </span>
                      <span className="text-xs text-text-sub">
                        {new Date(displayMessage.createdAt).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isCurrentUserMessage
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border text-text-strong'
                      }`}>
                      {displayMessage.content && displayMessage.content.trim() && (
                        <p className="text-sm whitespace-pre-wrap">{displayMessage.content}</p>
                      )}
                      {displayMessage.attachments && displayMessage.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {displayMessage.attachments.map((attachment, idx) => (
                            <div key={idx}>{renderAttachment(attachment)}</div>
                          ))}
                        </div>
                      )}
                      {message.isEdited && (
                        <span className="text-xs opacity-70 mt-1 block">(تم التعديل)</span>
                      )}
                    </div>
                    {displayMessage.read && (
                      <span className="text-xs text-text-sub mt-1">✓ مقروء</span>
                    )}
                    {'localStatus' in displayMessage && displayMessage.senderId === currentUserId && (displayMessage as UiMessage).localStatus === 'sending' && (
                      <span className="text-xs text-text-sub mt-1">جاري الإرسال...</span>
                    )}
                    {'localStatus' in displayMessage && displayMessage.senderId === currentUserId && (displayMessage as UiMessage).localStatus === 'failed' && (
                      <span className="text-xs text-red-600 mt-1">فشل الإرسال</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-gray-50">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-lg">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 text-blue-600" />
                  ) : (
                    <File className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-xs text-text-strong truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-0.5 hover:bg-gray-100 rounded">
                    <X className="w-3 h-3 text-text-sub" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border bg-white">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles || !isConnected}
              className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Paperclip className="w-5 h-5 text-text-sub" />
            </button>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={!conversationId ? 'جاري إنشاء المحادثة...' : !isConnected ? 'غير متصل...' : 'اكتب رسالة...'}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-text-strong placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={2}
              disabled={!conversationId || !isConnected || isSending || uploadingFiles}
            />
            <button
              onClick={handleSendMessage}
              disabled={
                !conversationId ||
                !isConnected ||
                (!messageText.trim() && selectedFiles.length === 0) ||
                isSending ||
                uploadingFiles
              }
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                backgroundColor: 'var(--c-primary)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--c-primary)';
                }
              }}>
              {(isSending || uploadingFiles) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>إرسال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
