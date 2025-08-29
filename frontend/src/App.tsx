import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Store
import { useSecurityStore } from './store/securityStore';
import { useWebSocketStore } from './store/websocketStore';

// Components
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const QuantumField = React.lazy(() => import('./pages/QuantumField'));
const ThreatMonitor = React.lazy(() => import('./pages/ThreatMonitor'));
const BiometricAuth = React.lazy(() => import('./pages/BiometricAuth'));
const ConsciousnessMetrics = React.lazy(() => import('./pages/ConsciousnessMetrics'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Styles
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const { 
    connectionStatus, 
    lastEvent, 
    initializeConnections,
    disconnect 
  } = useWebSocketStore();
  
  const { 
    isAuthenticated, 
    authenticationLevel,
    initializeSecurity 
  } = useSecurityStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize security systems
        await initializeSecurity();
        
        // Initialize WebSocket connections
        await initializeConnections();
        
        // Check for existing authentication
        const storedAuth = localStorage.getItem('starguard_auth');
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          if (authData.expiresAt > Date.now()) {
            setCurrentUser(authData.user);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsInitialized(true); // Still show app with error state
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center\">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className=\"text-center\"
        >
          <LoadingSpinner size=\"xl\" />
          <h2 className=\"text-2xl font-bold text-white mt-6 mb-2\">
            Initializing STARGUARD
          </h2>
          <p className=\"text-blue-300\">
            Quantum security systems coming online...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className=\"h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden\">
            {/* Connection Status Indicator */}
            <ConnectionStatusIndicator status={connectionStatus} />
            
            <div className=\"flex h-full\">
              {/* Sidebar */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                className=\"w-64 flex-shrink-0\"
              >
                <Sidebar />
              </motion.div>

              {/* Main Content */}
              <div className=\"flex-1 flex flex-col min-w-0\">
                {/* Top Bar */}
                <TopBar user={currentUser} />

                {/* Page Content */}
                <main className=\"flex-1 p-6 overflow-auto\">
                  <Suspense 
                    fallback={
                      <div className=\"flex items-center justify-center h-full\">
                        <LoadingSpinner />
                      </div>
                    }
                  >
                    <AnimatePresence mode=\"wait\">
                      <Routes>
                        <Route path=\"/\" element={<Navigate to=\"/dashboard\" replace />} />
                        <Route path=\"/dashboard\" element={<Dashboard />} />
                        <Route path=\"/quantum-field\" element={<QuantumField />} />
                        <Route path=\"/threats\" element={<ThreatMonitor />} />
                        <Route path=\"/biometric\" element={<BiometricAuth />} />
                        <Route path=\"/consciousness\" element={<ConsciousnessMetrics />} />
                        <Route path=\"/settings\" element={<Settings />} />
                      </Routes>
                    </AnimatePresence>
                  </Suspense>
                </main>
              </div>
            </div>

            {/* Global Notifications */}
            <Toaster 
              position=\"top-right\"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155'
                }
              }}
            />

            {/* Security Event Overlay */}
            <SecurityEventOverlay />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Connection Status Indicator Component
const ConnectionStatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className=\"fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-slate-700\"
    >
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
      <span className=\"text-xs text-white capitalize\">{status}</span>
    </motion.div>
  );
};

// Security Event Overlay Component
const SecurityEventOverlay: React.FC = () => {
  const { lastEvent } = useWebSocketStore();
  const [showEvent, setShowEvent] = useState(false);

  useEffect(() => {
    if (lastEvent && lastEvent.type === 'security_event') {
      setShowEvent(true);
      const timer = setTimeout(() => setShowEvent(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  if (!showEvent || !lastEvent) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className=\"fixed bottom-6 right-6 z-50 max-w-sm\"
      >
        <div className={`p-4 rounded-lg border-2 backdrop-blur-sm ${getSeverityColor(lastEvent.data.severity)}`}>
          <div className=\"flex items-center justify-between mb-2\">
            <h4 className=\"font-semibold text-white\">Security Event</h4>
            <button
              onClick={() => setShowEvent(false)}
              className=\"text-gray-400 hover:text-white transition-colors\"
            >
              ×
            </button>
          </div>
          
          <div className=\"space-y-1 text-sm\">
            <div className=\"flex justify-between\">
              <span className=\"text-gray-300\">Type:</span>
              <span className=\"text-white\">{lastEvent.data.type}</span>
            </div>
            <div className=\"flex justify-between\">
              <span className=\"text-gray-300\">Severity:</span>
              <span className={`capitalize font-medium ${
                lastEvent.data.severity === 'critical' ? 'text-red-400' :
                lastEvent.data.severity === 'high' ? 'text-orange-400' :
                lastEvent.data.severity === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {lastEvent.data.severity}
              </span>
            </div>
            <div className=\"flex justify-between\">
              <span className=\"text-gray-300\">Confidence:</span>
              <span className=\"text-white\">{Math.round(lastEvent.data.confidence * 100)}%</span>
            </div>
          </div>

          <div className=\"mt-3 pt-3 border-t border-gray-600\">
            <p className=\"text-xs text-gray-300\">
              {new Date(lastEvent.data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default App;