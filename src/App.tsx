import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import Navigation from './components/Navigation';
import LoadingIndicator from './components/LoadingIndicator';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import Zones from './pages/Zones';
import Parties from './pages/Parties';
import Safety from './pages/Safety';
import Reports from './pages/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isLoading, loadingText } = useLoading();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-light">
      <Navigation />
      <div style={{ marginLeft: '16rem' }} className="d-none d-lg-block">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      <div className="d-lg-none">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      {isLoading && (
        <LoadingIndicator 
          fullScreen 
          text={loadingText} 
          size="lg" 
          variant="pink" 
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admission" element={
            <ProtectedRoute>
              <Admission />
            </ProtectedRoute>
          } />
          <Route path="/zones" element={
            <ProtectedRoute>
              <Zones />
            </ProtectedRoute>
          } />
          <Route path="/parties" element={
            <ProtectedRoute>
              <Parties />
            </ProtectedRoute>
          } />
          <Route path="/safety" element={
            <ProtectedRoute>
              <Safety />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;