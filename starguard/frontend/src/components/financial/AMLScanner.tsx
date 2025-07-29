'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, GitBranch, Globe } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function AMLScanner() {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const amlScanMutation = useMutation({
    mutationFn: async (entityId: string) => {
      setIsScanning(true);
      setScanProgress(0);
      
      // Simulate scan progress
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post('/api/financial/aml/scan', {
        entity_id: entityId,
        transactions: [],
        timeframe: '30d',
      });
      
      return response.data;
    },
  });

  const amlPatterns = [
    {
      pattern: 'Layering',
      description: 'Complex transaction chains detected',
      risk: 'high',
      indicators: 23,
      icon: GitBranch,
    },
    {
      pattern: 'Structuring',
      description: 'Transactions below reporting threshold',
      risk: 'medium',
      indicators: 47,
      icon: DollarSign,
    },
    {
      pattern: 'Shell Companies',
      description: 'Offshore entity connections found',
      risk: 'critical',
      indicators: 8,
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-green-400" />
          AML Consciousness Scanner
        </h3>
        <button
          onClick={() => amlScanMutation.mutate('test-entity')}
          disabled={isScanning}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isScanning
              ? 'bg-void-700 text-void-400 cursor-not-allowed'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Start AML Scan'}
        </button>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-void-900/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Analyzing money flow consciousness...</span>
            <span className="text-sm font-mono">{scanProgress}%</span>
          </div>
          <div className="w-full bg-void-800 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-quantum-500"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Money Flow Vortex Indicators */}
      <div className="bg-void-900/30 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Money Flow Vortex Detection</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-green-400">3</div>
            <div className="text-xs text-void-400">Vortices Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-yellow-400">$2.4M</div>
            <div className="text-xs text-void-400">Flow Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-red-400">87%</div>
            <div className="text-xs text-void-400">Risk Score</div>
          </div>
        </div>
      </div>

      {/* AML Pattern Detection */}
      <div className="space-y-3">
        {amlPatterns.map((pattern, index) => {
          const Icon = pattern.icon;
          const riskColors = {
            critical: 'text-red-400 bg-red-500/10',
            high: 'text-orange-400 bg-orange-500/10',
            medium: 'text-yellow-400 bg-yellow-500/10',
          };

          return (
            <motion.div
              key={pattern.pattern}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-void-900/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-void-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pattern.pattern}</h4>
                    <p className="text-sm text-void-400">{pattern.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold">
                    {pattern.indicators}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    riskColors[pattern.risk as keyof typeof riskColors]
                  }`}>
                    {pattern.risk.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Scan Results */}
      {amlScanMutation.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-consciousness-500/10 border border-consciousness-500/30 rounded-lg p-4"
        >
          <h4 className="font-medium mb-2">Scan Complete</h4>
          <div className="text-sm text-void-300">
            <p>Risk Score: {(amlScanMutation.data.scan_result.risk_score * 100).toFixed(0)}%</p>
            <p>Patterns Detected: {amlScanMutation.data.scan_result.detected_patterns.length}</p>
            <p>Recommended Actions: Enhanced due diligence required</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}