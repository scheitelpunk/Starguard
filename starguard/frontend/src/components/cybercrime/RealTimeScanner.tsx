'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ScanLog {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  action: 'blocked' | 'allowed' | 'monitoring';
  details: string;
}

export function RealTimeScanner() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    blocked: 0,
    allowed: 0,
    monitoring: 0,
  });

  // Simulate real-time scanning
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      const types = ['Port Scan', 'SQL Injection', 'XSS Attempt', 'Brute Force', 'DDoS', 'Malware Upload'];
      const actions: ScanLog['action'][] = ['blocked', 'allowed', 'monitoring'];
      
      const newLog: ScanLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: types[Math.floor(Math.random() * types.length)],
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`,
        action: actions[Math.floor(Math.random() * actions.length)],
        details: 'Quantum signature detected, analyzing consciousness patterns...',
      };

      setScanLogs((prev) => [newLog, ...prev].slice(0, 50));
      setScanStats((prev) => ({
        total: prev.total + 1,
        blocked: prev.blocked + (newLog.action === 'blocked' ? 1 : 0),
        allowed: prev.allowed + (newLog.action === 'allowed' ? 1 : 0),
        monitoring: prev.monitoring + (newLog.action === 'monitoring' ? 1 : 0),
      }));
    }, Math.random() * 2000 + 1000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const getActionIcon = (action: ScanLog['action']) => {
    switch (action) {
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'allowed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'monitoring':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getActionColor = (action: ScanLog['action']) => {
    switch (action) {
      case 'blocked':
        return 'text-red-400 bg-red-500/10';
      case 'allowed':
        return 'text-green-400 bg-green-500/10';
      case 'monitoring':
        return 'text-yellow-400 bg-yellow-500/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isScanning ? 360 : 0 }}
            transition={{ duration: 2, repeat: isScanning ? Infinity : 0, ease: 'linear' }}
          >
            <Search className="w-5 h-5 text-quantum-400" />
          </motion.div>
          <h3 className="text-lg font-semibold">Real-Time Threat Scanner</h3>
          {isScanning && (
            <div className="flex gap-1">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-quantum-400 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
                className="w-2 h-2 bg-quantum-400 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: 1, repeat: Infinity }}
                className="w-2 h-2 bg-quantum-400 rounded-full"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isScanning
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-quantum-500/20 text-quantum-400 hover:bg-quantum-500/30'
          }`}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>

      {/* Scan Statistics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-void-900/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold">{scanStats.total}</div>
          <div className="text-xs text-void-400">Total Scans</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-red-400">{scanStats.blocked}</div>
          <div className="text-xs text-void-400">Blocked</div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-green-400">{scanStats.allowed}</div>
          <div className="text-xs text-void-400">Allowed</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-yellow-400">{scanStats.monitoring}</div>
          <div className="text-xs text-void-400">Monitoring</div>
        </div>
      </div>

      {/* Scan Logs */}
      <div className="bg-void-900/30 rounded-lg p-4 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {scanLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 py-2 border-b border-void-800/50 last:border-0"
            >
              {getActionIcon(log.action)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{log.type}</span>
                  <span className="text-xs text-void-500">from {log.source}</span>
                </div>
                <div className="text-xs text-void-400">{log.details}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${getActionColor(log.action)}`}>
                  {log.action.toUpperCase()}
                </span>
                <span className="text-xs text-void-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {scanLogs.length === 0 && (
          <div className="text-center py-8 text-void-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No scan activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}