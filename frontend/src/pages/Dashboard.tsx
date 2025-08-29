import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Server, 
  Eye,
  Brain,
  Lock,
  Cpu,
  Network
} from 'lucide-react';

// Components
import ThreatHeatmap from '../components/dashboard/ThreatHeatmap';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import SecurityTimeline from '../components/dashboard/SecurityTimeline';
import SystemHealthIndicator from '../components/dashboard/SystemHealthIndicator';
import RealTimeAlerts from '../components/dashboard/RealTimeAlerts';
import QuantumFieldMiniView from '../components/dashboard/QuantumFieldMiniView';
import ConsciousnessMeter from '../components/dashboard/ConsciousnessMeter';

// Hooks and Services
import { useRealTimeData, useConnectionStatus } from '../store/websocketStore';
import { useSecurityStore } from '../store/securityStore';
import { useDashboardData } from '../hooks/useDashboardData';

// Types
interface DashboardMetrics {
  threats: {
    total: number;
    critical: number;
    resolved: number;
    activeScans: number;
  };
  quantumField: {
    stability: number;
    nodes: number;
    coherence: number;
    threatLevel: number;
  };
  consciousness: {
    level: number;
    learning: boolean;
    alertsGenerated: number;
    adaptationScore: number;
  };
  biometrics: {
    activeSessions: number;
    successRate: number;
    anomalousAttempts: number;
  };
  system: {
    uptime: number;
    performance: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

const Dashboard: React.FC = () => {
  // State
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Store hooks
  const { isConnected } = useConnectionStatus();
  const { 
    latestQuantumField, 
    latestConsciousness, 
    recentSecurityEvents, 
    sendMessage 
  } = useRealTimeData();
  
  const { isAuthenticated, authenticationLevel } = useSecurityStore();
  
  // Data fetching
  const { 
    dashboardMetrics, 
    systemHealth, 
    threats, 
    isLoading, 
    error,
    refetch 
  } = useDashboardData(timeRange, autoRefresh);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Computed values
  const threatLevel = useMemo(() => {
    if (!dashboardMetrics) return 'low';
    
    const criticalThreats = dashboardMetrics.threats.critical;
    const totalThreats = dashboardMetrics.threats.total;
    
    if (criticalThreats > 5) return 'critical';
    if (criticalThreats > 2 || totalThreats > 20) return 'high';
    if (totalThreats > 10) return 'medium';
    return 'low';
  }, [dashboardMetrics]);

  const systemStatus = useMemo(() => {
    if (!systemHealth) return 'unknown';
    
    if (systemHealth.overall < 0.7) return 'degraded';
    if (systemHealth.overall < 0.9) return 'warning';
    return 'optimal';
  }, [systemHealth]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={refetch} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=\"space-y-6\"
    >
      {/* Header Section */}
      <div className=\"flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4\">
        <div>
          <h1 className=\"text-3xl font-bold text-white mb-2\">Security Operations Center</h1>
          <p className=\"text-gray-300\">
            Real-time quantum security monitoring and threat intelligence
          </p>
        </div>
        
        <div className=\"flex items-center gap-3\">
          {/* Connection Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
            isConnected 
              ? 'bg-green-900/30 border-green-600 text-green-300' 
              : 'bg-red-900/30 border-red-600 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className=\"text-sm font-medium\">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className=\"bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-sm\"
          >
            <option value=\"1h\">Last Hour</option>
            <option value=\"24h\">Last 24 Hours</option>
            <option value=\"7d\">Last 7 Days</option>
            <option value=\"30d\">Last 30 Days</option>
          </select>
          
          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              autoRefresh
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-700 border-slate-600 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Auto-refresh {autoRefresh ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      <SystemStatusBanner 
        threatLevel={threatLevel}
        systemStatus={systemStatus}
        isConnected={isConnected}
        authLevel={authenticationLevel}
      />

      {/* Key Metrics Cards */}
      {dashboardMetrics && (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
          <MetricCard
            title=\"Active Threats\"
            value={dashboardMetrics.threats.total}
            change={`${dashboardMetrics.threats.critical} critical`}
            icon={AlertTriangle}
            color=\"red\"
            onClick={() => setSelectedMetric('threats')}
          />
          
          <MetricCard
            title=\"Quantum Stability\"
            value={`${Math.round(dashboardMetrics.quantumField.stability * 100)}%`}
            change={`${dashboardMetrics.quantumField.nodes} nodes`}
            icon={Zap}
            color=\"blue\"
            onClick={() => setSelectedMetric('quantum')}
          />
          
          <MetricCard
            title=\"Consciousness Level\"
            value={`${Math.round(dashboardMetrics.consciousness.level * 100)}%`}
            change={dashboardMetrics.consciousness.learning ? 'Learning Active' : 'Static'}
            icon={Brain}
            color=\"purple\"
            onClick={() => setSelectedMetric('consciousness')}
          />
          
          <MetricCard
            title=\"Biometric Auth\"
            value={`${Math.round(dashboardMetrics.biometrics.successRate * 100)}%`}
            change={`${dashboardMetrics.biometrics.activeSessions} active`}
            icon={Lock}
            color=\"green\"
            onClick={() => setSelectedMetric('biometric')}
          />
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Left Column - Primary Visualizations */}
        <div className=\"lg:col-span-2 space-y-6\">
          {/* Threat Heatmap */}
          <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
            <div className=\"flex items-center justify-between mb-4\">
              <h3 className=\"text-lg font-semibold text-white\">Global Threat Map</h3>
              <button className=\"text-blue-400 hover:text-blue-300 text-sm\">
                View Full Map →
              </button>
            </div>
            <ThreatHeatmap threats={threats} timeRange={timeRange} />
          </div>

          {/* Quantum Field Mini View */}
          {latestQuantumField && (
            <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
              <div className=\"flex items-center justify-between mb-4\">
                <h3 className=\"text-lg font-semibold text-white\">Quantum Field Status</h3>
                <button className=\"text-blue-400 hover:text-blue-300 text-sm\">
                  Full Visualization →
                </button>
              </div>
              <QuantumFieldMiniView data={latestQuantumField} />
            </div>
          )}

          {/* Security Timeline */}
          <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
            <h3 className=\"text-lg font-semibold text-white mb-4\">Recent Security Events</h3>
            <SecurityTimeline events={recentSecurityEvents} />
          </div>
        </div>

        {/* Right Column - Metrics and Alerts */}
        <div className=\"space-y-6\">
          {/* Real-time Alerts */}
          <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
            <h3 className=\"text-lg font-semibold text-white mb-4\">Live Alerts</h3>
            <RealTimeAlerts events={recentSecurityEvents.slice(0, 5)} />
          </div>

          {/* Consciousness Meter */}
          {latestConsciousness && (
            <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
              <h3 className=\"text-lg font-semibold text-white mb-4\">AI Consciousness</h3>
              <ConsciousnessMeter data={latestConsciousness} />
            </div>
          )}

          {/* System Health */}
          {systemHealth && (
            <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
              <h3 className=\"text-lg font-semibold text-white mb-4\">System Health</h3>
              <SystemHealthIndicator health={systemHealth} />
            </div>
          )}

          {/* Performance Metrics */}
          {dashboardMetrics && (
            <div className=\"bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6\">
              <h3 className=\"text-lg font-semibold text-white mb-4\">System Performance</h3>
              <div className=\"space-y-3\">
                <PerformanceBar
                  label=\"CPU Usage\"
                  value={dashboardMetrics.system.cpuUsage}
                  max={100}
                  unit=\"%\"
                  color=\"blue\"
                />
                <PerformanceBar
                  label=\"Memory\"
                  value={dashboardMetrics.system.memoryUsage}
                  max={100}
                  unit=\"%\"
                  color=\"green\"
                />
                <PerformanceBar
                  label=\"Performance\"
                  value={dashboardMetrics.system.performance}
                  max={100}
                  unit=\"%\"
                  color=\"purple\"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics (when metric is selected) */}
      {selectedMetric && (
        <DetailedMetricsModal
          metric={selectedMetric}
          data={dashboardMetrics}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </motion.div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<any>;
  color: 'red' | 'blue' | 'purple' | 'green';
  onClick?: () => void;
}> = ({ title, value, change, icon: Icon, color, onClick }) => {
  const colorClasses = {
    red: 'text-red-400 bg-red-900/20 border-red-700',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-700',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-700',
    green: 'text-green-400 bg-green-900/20 border-green-700'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 cursor-pointer transition-all hover:border-slate-600 ${
        onClick ? 'hover:shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className=\"flex items-center justify-between mb-4\">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className=\"w-6 h-6\" />
        </div>
        <TrendingUp className=\"w-4 h-4 text-gray-400\" />
      </div>
      
      <div className=\"mb-2\">
        <div className=\"text-2xl font-bold text-white\">{value}</div>
        <div className=\"text-sm text-gray-400\">{title}</div>
      </div>
      
      <div className={`text-sm ${colorClasses[color].split(' ')[0]}`}>
        {change}
      </div>
    </motion.div>
  );
};

const SystemStatusBanner: React.FC<{
  threatLevel: string;
  systemStatus: string;
  isConnected: boolean;
  authLevel: number;
}> = ({ threatLevel, systemStatus, isConnected, authLevel }) => {
  const getBannerColor = () => {
    if (threatLevel === 'critical') return 'bg-red-900/30 border-red-600';
    if (threatLevel === 'high' || systemStatus === 'degraded') return 'bg-orange-900/30 border-orange-600';
    if (threatLevel === 'medium' || systemStatus === 'warning') return 'bg-yellow-900/30 border-yellow-600';
    return 'bg-green-900/30 border-green-600';
  };

  const getStatusText = () => {
    if (threatLevel === 'critical') return 'CRITICAL THREATS DETECTED';
    if (threatLevel === 'high') return 'HIGH THREAT LEVEL';
    if (systemStatus === 'degraded') return 'SYSTEM PERFORMANCE DEGRADED';
    if (!isConnected) return 'REAL-TIME CONNECTION OFFLINE';
    return 'ALL SYSTEMS OPERATIONAL';
  };

  return (
    <div className={`p-4 rounded-lg border ${getBannerColor()}`}>
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center space-x-4\">
          <Shield className=\"w-6 h-6\" />
          <div>
            <div className=\"font-semibold text-white\">{getStatusText()}</div>
            <div className=\"text-sm text-gray-300\">
              Auth Level: {authLevel}/5 • System: {systemStatus} • Connection: {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        
        <div className=\"flex items-center space-x-2\">
          <div className=\"text-right\">
            <div className=\"text-sm text-gray-300\">Threat Level</div>
            <div className=\"font-semibold text-white capitalize\">{threatLevel}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceBar: React.FC<{
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}> = ({ label, value, max, unit, color }) => {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div>
      <div className=\"flex justify-between text-sm text-gray-300 mb-1\">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <div className=\"w-full bg-slate-700 rounded-full h-2\">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: \"easeOut\" }}
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
        />
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => {
  return (
    <div className=\"space-y-6 animate-pulse\">
      <div className=\"h-8 bg-slate-700 rounded w-1/3\" />
      <div className=\"grid grid-cols-4 gap-6\">
        {[...Array(4)].map((_, i) => (
          <div key={i} className=\"h-32 bg-slate-700 rounded-lg\" />
        ))}
      </div>
      <div className=\"grid grid-cols-3 gap-6\">
        <div className=\"col-span-2 h-96 bg-slate-700 rounded-lg\" />
        <div className=\"h-96 bg-slate-700 rounded-lg\" />
      </div>
    </div>
  );
};

const DashboardError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className=\"flex items-center justify-center h-64 bg-slate-800/50 rounded-lg border border-slate-700\">
      <div className=\"text-center\">
        <AlertTriangle className=\"w-16 h-16 text-red-400 mx-auto mb-4\" />
        <h3 className=\"text-xl font-semibold text-white mb-2\">Dashboard Error</h3>
        <p className=\"text-gray-300 mb-4\">{error}</p>
        <button
          onClick={onRetry}
          className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors\"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

const DetailedMetricsModal: React.FC<{
  metric: string;
  data: DashboardMetrics | null;
  onClose: () => void;
}> = ({ metric, data, onClose }) => {
  // Implementation would show detailed metrics for the selected category
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className=\"fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4\"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className=\"bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto\"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=\"flex items-center justify-between mb-6\">
          <h2 className=\"text-xl font-bold text-white capitalize\">{metric} Details</h2>
          <button
            onClick={onClose}
            className=\"text-gray-400 hover:text-white transition-colors\"
          >
            ×
          </button>
        </div>
        
        <div className=\"text-gray-300\">
          Detailed metrics for {metric} would be displayed here.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;