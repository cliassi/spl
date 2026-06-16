import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.js';
import { LockersPage } from './routes/lockers/LockersPage.js';
import { StorePackagePage } from './routes/packages/StorePackagePage.js';
import { RetrievePackagePage } from './routes/packages/RetrievePackagePage.js';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LockersPage />} />
            <Route path="/packages/store" element={<StorePackagePage />} />
            <Route path="/packages/retrieval" element={<RetrievePackagePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
