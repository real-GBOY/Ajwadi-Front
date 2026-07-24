import { useContext } from 'react';
import { ChatSocketContext } from '../../contexts/ChatSocketProvider';

export function useChatSocket() {
  const context = useContext(ChatSocketContext);
  if (context === undefined) {
    throw new Error('useChatSocket must be used within ChatSocketProvider');
  }
  return context;
}
