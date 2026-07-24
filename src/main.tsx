import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
// Import i18n config after React imports to ensure React is loaded first
import './config/i18n';
// Initialize colors from colors.ts
import { initializeColors } from './config/colors';
import { ChatSocketProvider } from './contexts/ChatSocketProvider';

// Initialize colors with light theme by default
initializeColors('light');

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ChatSocketProvider>
          <App />
        </ChatSocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
