# Chat System Guide

This guide explains how to implement and use the chat functionality in the Ajwadi Frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Socket Connection](#socket-connection)
5. [Conversations](#conversations)
6. [Sending Messages](#sending-messages)
7. [Receiving Messages](#receiving-messages)
8. [File Attachments](#file-attachments)
9. [Voice Messages](#voice-messages)
10. [Typing Indicators](#typing-indicators)
11. [Presence & Online Status](#presence--online-status)
12. [Read Receipts](#read-receipts)
13. [Message Reactions](#message-reactions)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)

## Overview

The chat system uses **WebSocket (Socket.IO)** for real-time communication. It supports:

- ✅ Real-time messaging
- ✅ File attachments (images, documents, etc.)
- ✅ Voice messages
- ✅ Typing indicators
- ✅ Online/offline presence
- ✅ Read receipts
- ✅ Message reactions
- ✅ Message editing & deletion
- ✅ Conversation metadata (proposals, projects)

## Architecture

```
┌─────────────────┐
│  ChatDetailScreen │
│  (UI Component)   │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│  useChatSocket   │
│  (Context Hook)  │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│ ChatSocketService│
│  (Socket.IO)     │
└────────┬──────────┘
         │
         ▼
┌─────────────────┐
│  WebSocket Server│
└─────────────────┘
```

## Setup

### 1. Environment Variables

Add WebSocket URL to your `.env` file:

```env
EXPO_PUBLIC_WS_URL=http://your-server:3001
```

**Important Notes:**
- On **mobile devices**, use your machine's IP address (not `localhost`)
- On **web**, `localhost` works fine
- Example: `EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001`

### 2. Provider Setup

The `ChatSocketProvider` is already set up in your app. It automatically:
- Connects when user is authenticated
- Reconnects on app foreground
- Sends activity pings to keep online status

```typescript
// Already configured in app/_layout.tsx
<ChatSocketProvider>
  <YourApp />
</ChatSocketProvider>
```

## Socket Connection

### Using the Chat Socket Hook

```typescript
import { useChatSocket } from '@/contexts';

function MyComponent() {
  const { isConnected, chatSocket } = useChatSocket();

  // Check connection status
  if (!isConnected) {
    return <Text>Connecting...</Text>;
  }

  // Use chatSocket to send messages, etc.
}
```

### Connection Status

```typescript
const { isConnected, connectionError } = useChatSocket();

// isConnected: boolean - true when socket is connected
// connectionError: ErrorPayload | null - error if connection failed
```

## Conversations

### Creating a Conversation

```typescript
import { findOrCreateDirectConversation } from '@/services/chat';

// Find existing or create new conversation between two users
const conversation = await findOrCreateDirectConversation(
  [userId1, userId2],
  {
    proposalId: 'proposal-123',  // Optional metadata
    projectId: 'project-456',    // Optional metadata
  }
);

console.log(conversation._id); // Use this as conversationId
```

### Getting Conversations List

```typescript
import { getConversations } from '@/services/chat';

const response = await getConversations({
  limit: 20,
  cursor: undefined, // For pagination
  type: 'direct',    // 'direct' | 'group'
});

const conversations = response.conversations || response.data || [];
```

### Getting Conversation by ID

```typescript
import { getConversationById } from '@/services/chat';

const conversation = await getConversationById(conversationId);
console.log(conversation.participants);
console.log(conversation.metadata);
```

## Sending Messages

### Basic Text Message

```typescript
import { useChatSocket } from '@/contexts';

function ChatScreen() {
  const { chatSocket, isConnected } = useChatSocket();
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = async () => {
    if (!isConnected || !conversationId) return;

    try {
      const response = await chatSocket.sendMessage(
        conversationId,
        messageText.trim()
      );

      if (response.success) {
        console.log('Message sent:', response.message);
        setMessageText('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <View>
      <TextInput
        value={messageText}
        onChangeText={setMessageText}
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
}
```

### Message with Reply

```typescript
const response = await chatSocket.sendMessage(
  conversationId,
  'This is a reply',
  {
    replyTo: originalMessageId, // ID of message being replied to
  }
);
```

### Message with File Attachment

```typescript
import { useChatFileAttachment } from '@/hooks/chat/useChatFileAttachment';

function ChatScreen() {
  const { chatSocket } = useChatSocket();
  const { handleFileAttach, pendingFile } = useChatFileAttachment();

  const handleSendFile = async () => {
    // 1. Pick and upload file
    const uploadResult = await handleFileAttach();
    if (!uploadResult) return;

    // 2. Send message with attachment
    await chatSocket.sendMessage(
      conversationId,
      'Check out this file!',
      {
        attachments: [{
          externalFileId: uploadResult.fileId,
          label: 'Document',
          type: 'file',
          url: uploadResult.fileUrl,
        }]
      }
    );
  };

  return (
    <View>
      {pendingFile && (
        <Text>Uploading: {pendingFile.progress}%</Text>
      )}
      <Button title="Attach File" onPress={handleSendFile} />
    </View>
  );
}
```

### Voice Message

```typescript
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { uploadFile } from '@/services/s3';

function ChatScreen() {
  const { chatSocket } = useChatSocket();
  const {
    isRecording,
    duration,
    recordingUri,
    startRecording,
    stopRecording,
  } = useVoiceRecording();

  const handleSendVoiceMessage = async () => {
    if (!recordingUri) return;

    try {
      // 1. Upload voice file to S3
      const fileName = `voice-${Date.now()}.m4a`;
      const fileInfo = await uploadFile(
        recordingUri,
        fileName,
        'message', // File purpose
        'audio'    // File type
      );

      // 2. Send message with voice attachment
      await chatSocket.sendMessage(
        conversationId,
        '', // Empty content for voice messages
        {
          attachments: [{
            externalFileId: fileInfo.fileId,
            label: 'Voice Message',
            type: 'audio',
            metadata: {
              duration: duration, // Duration in seconds
              format: 'm4a',
            },
          }]
        }
      );
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  return (
    <View>
      {isRecording && <Text>Recording: {duration}s</Text>}
      <Button
        title={isRecording ? "Stop" : "Record"}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {recordingUri && (
        <Button title="Send Voice" onPress={handleSendVoiceMessage} />
      )}
    </View>
  );
}
```

## Receiving Messages

### Listening for New Messages

```typescript
import { useEffect, useState } from 'react';
import { useChatSocket } from '@/contexts';
import type { Message } from '@/types/chat';

function ChatScreen() {
  const { chatSocket } = useChatSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    chatSocket.on('message:new', handleNewMessage);

    return () => {
      chatSocket.off('message:new', handleNewMessage);
    };
  }, [chatSocket]);

  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => <MessageItem message={item} />}
    />
  );
}
```

### Loading Message History

```typescript
import { getConversationMessages } from '@/services/chat';

const loadMessages = async (conversationId: string) => {
  const response = await getConversationMessages(conversationId, {
    limit: 50,
    before: undefined, // Load messages before this ID
    after: undefined,  // Load messages after this ID
  });

  const messages = response.messages || response.data || [];
  return messages;
};
```

### Handling Message Updates

```typescript
useEffect(() => {
  const handleMessageUpdated = (data: MessageUpdatedPayload) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, content: data.content, isEdited: true }
          : msg
      )
    );
  };

  chatSocket.on('message:updated', handleMessageUpdated);

  return () => {
    chatSocket.off('message:updated', handleMessageUpdated);
  };
}, [chatSocket]);
```

### Handling Message Deletion

```typescript
useEffect(() => {
  const handleMessageDeleted = (data: MessageDeletedPayload) => {
    setMessages(prev =>
      prev.filter(msg => msg._id !== data.messageId)
    );
  };

  chatSocket.on('message:deleted', handleMessageDeleted);

  return () => {
    chatSocket.off('message:deleted', handleMessageDeleted);
  };
}, [chatSocket]);
```

## File Attachments

### Using the File Attachment Hook

```typescript
import { useChatFileAttachment } from '@/hooks/chat/useChatFileAttachment';

function ChatScreen() {
  const {
    handleFileAttach,
    pendingFile,
    isUploadingFile,
    clearPendingFile,
  } = useChatFileAttachment();

  const handleAttachFile = async () => {
    const uploadResult = await handleFileAttach();
    if (!uploadResult) return;

    // uploadResult contains:
    // - fileId: string
    // - token: string
    // - fileUrl: string

    // Use in message attachment
    await chatSocket.sendMessage(conversationId, '', {
      attachments: [{
        externalFileId: uploadResult.fileId,
        label: 'File',
        type: 'file',
        url: uploadResult.fileUrl,
      }]
    });

    clearPendingFile();
  };

  return (
    <View>
      {pendingFile && (
        <View>
          <Text>{pendingFile.file.name}</Text>
          <ProgressBar progress={pendingFile.progress} />
        </View>
      )}
      <Button
        title="Attach File"
        onPress={handleAttachFile}
        disabled={isUploadingFile}
      />
    </View>
  );
}
```

### File Types Supported

- **Images**: `.jpg`, `.png`, `.gif`, `.webp`
- **Documents**: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`
- **All files**: `*/*` (up to 50MB)

## Voice Messages

### Using Voice Recording Hook

```typescript
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

function ChatScreen() {
  const {
    isRecording,
    duration,
    recordingUri,
    startRecording,
    stopRecording,
    cancelRecording,
    error: recordingError,
  } = useVoiceRecording();

  return (
    <View>
      {isRecording && (
        <View>
          <Text>Recording: {duration}s</Text>
          <Button title="Stop" onPress={stopRecording} />
          <Button title="Cancel" onPress={cancelRecording} />
        </View>
      )}
      {!isRecording && (
        <Button title="Record" onPress={startRecording} />
      )}
      {recordingError && (
        <Text>Error: {recordingError}</Text>
      )}
    </View>
  );
}
```

### Sending Voice Message

See [Voice Message](#voice-message) section above.

## Typing Indicators

### Sending Typing Indicator

```typescript
const handleTyping = async () => {
  if (!conversationId) return;

  // Start typing
  await chatSocket.startTyping(conversationId);

  // Stop typing after 3 seconds
  setTimeout(() => {
    chatSocket.stopTyping(conversationId);
  }, 3000);
};
```

### Receiving Typing Indicator

```typescript
const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

useEffect(() => {
  const handleTyping = (data: TypingPayload) => {
    if (data.isActive) {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    } else {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    }
  };

  chatSocket.on('user:typing', handleTyping);

  return () => {
    chatSocket.off('user:typing', handleTyping);
  };
}, [chatSocket]);

// Display typing indicator
{typingUsers.has(receiverId) && (
  <Text>{receiverName} is typing...</Text>
)}
```

### Recording Indicator

```typescript
useEffect(() => {
  const handleRecording = (data: TypingPayload) => {
    if (data.type === 'recording' && data.isActive) {
      setRecordingUsers(prev => new Set(prev).add(data.userId));
    } else {
      setRecordingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    }
  };

  chatSocket.on('user:recording', handleRecording);

  return () => {
    chatSocket.off('user:recording', handleRecording);
  };
}, [chatSocket]);
```

## Presence & Online Status

### Getting User Presence

```typescript
import { getUserPresence } from '@/services/chat';

const presence = await getUserPresence(userId);
console.log(presence.isOnline); // true | false
console.log(presence.lastSeen); // ISO timestamp
```

### Listening for Online/Offline Events

```typescript
const [isReceiverOnline, setIsReceiverOnline] = useState(false);

useEffect(() => {
  const handleUserOnline = (data: UserOnlinePayload) => {
    if (data.userId === receiverId) {
      setIsReceiverOnline(true);
    }
  };

  const handleUserOffline = (data: UserOfflinePayload) => {
    if (data.userId === receiverId) {
      setIsReceiverOnline(false);
    }
  };

  chatSocket.on('user:online', handleUserOnline);
  chatSocket.on('user:offline', handleUserOffline);

  return () => {
    chatSocket.off('user:online', handleUserOnline);
    chatSocket.off('user:offline', handleUserOffline);
  };
}, [chatSocket, receiverId]);

// Display online status
<Text>{isReceiverOnline ? '🟢 Online' : '⚫ Offline'}</Text>
```

### Batch Presence Check

```typescript
import { getBatchPresence } from '@/services/chat';

const presences = await getBatchPresence([userId1, userId2, userId3]);
presences.users?.forEach(user => {
  console.log(`${user.userId}: ${user.isOnline ? 'online' : 'offline'}`);
});
```

## Read Receipts

### Marking Messages as Read

```typescript
// Mark single message as read
await chatSocket.markMessageRead(messageId);

// Mark entire conversation as read
await chatSocket.markConversationRead(conversationId);

// Mark conversation as read up to a specific message
await chatSocket.markConversationRead(conversationId, upToMessageId);
```

### Receiving Read Receipts

```typescript
useEffect(() => {
  const handleMessageRead = (data: ReadReceiptPayload) => {
    // Update message status in UI
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? { ...msg, read: true, readAt: data.readAt }
          : msg
      )
    );
  };

  chatSocket.on('message:read', handleMessageRead);

  return () => {
    chatSocket.off('message:read', handleMessageRead);
  };
}, [chatSocket]);
```

## Message Reactions

### Adding Reaction

```typescript
await chatSocket.addReaction(messageId, '👍');
```

### Removing Reaction

```typescript
await chatSocket.removeReaction(messageId, '👍');
```

### Receiving Reactions

```typescript
useEffect(() => {
  const handleReactionAdded = (data: ReactionAddedPayload) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji: data.emoji, userId: data.userId, count: data.totalCount },
              ],
            }
          : msg
      )
    );
  };

  const handleReactionRemoved = (data: ReactionRemovedPayload) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === data.messageId
          ? {
              ...msg,
              reactions: (msg.reactions || []).filter(
                r => r.emoji !== data.emoji
              ),
            }
          : msg
      )
    );
  };

  chatSocket.on('reaction:added', handleReactionAdded);
  chatSocket.on('reaction:removed', handleReactionRemoved);

  return () => {
    chatSocket.off('reaction:added', handleReactionAdded);
    chatSocket.off('reaction:removed', handleReactionRemoved);
  };
}, [chatSocket]);
```

## Best Practices

### 1. Always Check Connection Before Sending

```typescript
if (!isConnected) {
  Alert.alert('خطأ', 'غير متصل بالخادم');
  return;
}
```

### 2. Clean Up Event Listeners

Always remove event listeners in cleanup:

```typescript
useEffect(() => {
  const handler = (data) => { /* ... */ };
  chatSocket.on('event', handler);
  
  return () => {
    chatSocket.off('event', handler); // ✅ Cleanup
  };
}, [chatSocket]);
```

### 3. Handle Conversation Creation

Always ensure conversation exists before sending messages:

```typescript
if (!conversationId) {
  const conversation = await findOrCreateDirectConversation([userId1, userId2]);
  setConversationId(conversation._id);
  // Then send message
}
```

### 4. Optimistic Updates

Add messages optimistically for better UX:

```typescript
const tempId = `temp-${Date.now()}`;
const optimisticMessage = {
  _id: tempId,
  content: messageText,
  senderId: currentUserId,
  createdAt: new Date().toISOString(),
};

setMessages(prev => [...prev, optimisticMessage]);

try {
  const response = await chatSocket.sendMessage(conversationId, messageText);
  // Replace temp message with real one
  setMessages(prev =>
    prev.map(msg =>
      msg._id === tempId ? response.message : msg
    )
  );
} catch (error) {
  // Remove failed message
  setMessages(prev => prev.filter(msg => msg._id !== tempId));
}
```

### 5. Join/Leave Rooms

Join conversation room when entering chat:

```typescript
useEffect(() => {
  if (conversationId && isConnected) {
    chatSocket.joinRoom(conversationId);
    
    return () => {
      chatSocket.leaveRoom(conversationId);
    };
  }
}, [conversationId, isConnected]);
```

### 6. Handle Reconnection

The socket automatically reconnects, but you may want to sync missed messages:

```typescript
useEffect(() => {
  if (isConnected && conversationId && lastMessageId) {
    chatSocket.syncMessages(conversationId, lastMessageId)
      .then(response => {
        if (response.messages) {
          setMessages(prev => [...response.messages, ...prev]);
        }
      });
  }
}, [isConnected]);
```

## Troubleshooting

### Issue: Socket Not Connecting

**Causes:**
- Invalid WebSocket URL
- Using `localhost` on mobile device
- Missing authentication token

**Solutions:**
- Use IP address on mobile: `http://192.168.1.100:3001`
- Check `EXPO_PUBLIC_WS_URL` in `.env`
- Verify user is authenticated

### Issue: Messages Not Sending

**Causes:**
- Socket not connected
- Missing `conversationId`
- Invalid payload format

**Solutions:**
```typescript
// Check connection
if (!isConnected) {
  console.error('Socket not connected');
  return;
}

// Ensure conversation exists
if (!conversationId) {
  const conv = await findOrCreateDirectConversation([userId1, userId2]);
  setConversationId(conv._id);
}

// Check payload
console.log('Sending:', { conversationId, content });
```

### Issue: Messages Not Receiving

**Causes:**
- Event listeners not registered
- Not joined to conversation room
- Wrong conversation ID

**Solutions:**
```typescript
// Ensure room is joined
await chatSocket.joinRoom(conversationId);

// Register listener
chatSocket.on('message:new', handleNewMessage);

// Verify conversation ID matches
console.log('Listening for conversation:', conversationId);
```

### Issue: File Upload Fails

**Causes:**
- File too large (>50MB)
- Invalid file type
- S3 upload error

**Solutions:**
- Check file size before upload
- Verify file type is supported
- Check S3 service logs

### Issue: Typing Indicator Not Working

**Causes:**
- Not calling `startTyping`/`stopTyping`
- Not listening for `user:typing` event
- Wrong conversation ID

**Solutions:**
```typescript
// Start typing
await chatSocket.startTyping(conversationId);

// Stop typing (important!)
await chatSocket.stopTyping(conversationId);

// Listen for events
chatSocket.on('user:typing', handleTyping);
```

## Complete Example

Here's a complete chat screen implementation:

```typescript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { useChatSocket } from '@/contexts';
import { findOrCreateDirectConversation, getConversationMessages } from '@/services/chat';
import { useChatFileAttachment } from '@/hooks/chat/useChatFileAttachment';
import type { Message } from '@/types/chat';

export default function ChatScreen({ receiverId, receiverName }) {
  const { chatSocket, isConnected } = useChatSocket();
  const { handleFileAttach, pendingFile } = useChatFileAttachment();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      const conv = await findOrCreateDirectConversation([currentUserId, receiverId]);
      setConversationId(conv._id);
      
      // Load message history
      const history = await getConversationMessages(conv._id, { limit: 50 });
      setMessages(history.messages || []);
      
      // Join room
      await chatSocket.joinRoom(conv._id);
    };
    
    if (isConnected && receiverId) {
      initConversation();
    }
    
    return () => {
      if (conversationId) {
        chatSocket.leaveRoom(conversationId);
      }
    };
  }, [isConnected, receiverId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    chatSocket.on('message:new', handleNewMessage);
    return () => chatSocket.off('message:new', handleNewMessage);
  }, [chatSocket, conversationId]);

  // Listen for typing
  useEffect(() => {
    const handleTyping = (data: TypingPayload) => {
      if (data.conversationId === conversationId) {
        if (data.isActive) {
          setTypingUsers(prev => new Set(prev).add(data.userId));
        } else {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
        }
      }
    };

    chatSocket.on('user:typing', handleTyping);
    return () => chatSocket.off('user:typing', handleTyping);
  }, [chatSocket, conversationId]);

  const handleSendMessage = async () => {
    if (!isConnected || !conversationId || !messageText.trim()) return;

    try {
      await chatSocket.sendMessage(conversationId, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const handleSendFile = async () => {
    if (!conversationId) return;
    
    const uploadResult = await handleFileAttach();
    if (!uploadResult) return;

    await chatSocket.sendMessage(conversationId, '', {
      attachments: [{
        externalFileId: uploadResult.fileId,
        label: 'File',
        type: 'file',
        url: uploadResult.fileUrl,
      }]
    });
  };

  return (
    <View>
      <Text>Chat with {receiverName}</Text>
      
      {typingUsers.has(receiverId) && (
        <Text>{receiverName} is typing...</Text>
      )}

      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.content}</Text>
            <Text>{new Date(item.createdAt).toLocaleTimeString()}</Text>
          </View>
        )}
      />

      {pendingFile && (
        <Text>Uploading: {pendingFile.progress}%</Text>
      )}

      <TextInput
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
      />
      
      <Button title="Send" onPress={handleSendMessage} />
      <Button title="Attach File" onPress={handleSendFile} />
    </View>
  );
}
```

## Additional Resources

- **Socket Service**: `src/services/socket/chatSocket.ts`
- **Chat Service**: `src/services/chat.ts`
- **Types**: `src/types/chat.ts`
- **Context**: `src/contexts/ChatSocketProvider.tsx`
- **File Attachment Hook**: `src/hooks/chat/useChatFileAttachment.ts`
- **Example Screen**: `src/screens/Shared/ChatDetailScreen.tsx`

## Summary

1. **Use `useChatSocket()`** to access socket connection
2. **Create/find conversation** before sending messages
3. **Join conversation room** when entering chat
4. **Listen for socket events** to receive real-time updates
5. **Clean up listeners** in useEffect cleanup
6. **Handle connection status** for better UX
7. **Use hooks** for file attachments and voice recording

The chat system handles all the complexity of WebSocket communication automatically! 🚀
