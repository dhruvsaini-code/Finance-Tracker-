import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Authentication views
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Core Secured views
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

// Layout grids and controls
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CommandPalette } from './components/ui/CommandPalette';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initialize auth credentials from storage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Command palette hotkey handler (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      
      {/* Toast popup alerts container */}
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* Command shortcut palette modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      <Router>
        <Routes>
          
          {/* Public Authentication Pathways */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Private Core Dashboards (Protected & Wrapped in Layout Frame) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Budgets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/savings"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Savings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Analytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <AIInsights />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback navigation to Root */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
      
    </QueryClientProvider>
  );
};

export default App;
