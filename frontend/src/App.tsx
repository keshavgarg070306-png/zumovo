import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateSignalPage from './pages/CreateSignalPage';
import SignalDetailPage from './pages/SignalDetailPage';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main className={`main-content ${isAuthenticated ? 'has-navbar' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateSignalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signals/:id"
              element={
                <ProtectedRoute>
                  <SignalDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#00ff88',
                secondary: '#111827',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff3366',
                secondary: '#111827',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
