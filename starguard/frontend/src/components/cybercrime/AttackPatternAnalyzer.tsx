'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, AlertTriangle, BarChart3 } from 'lucide-react';

export function AttackPatternAnalyzer() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const patterns = [
    {
      id: 'apt-lazarus',
      name: 'APT Lazarus Variant',
      confidence: 0.89,
      indicators: ['PowerShell obfuscation', 'Living off the land', 'Cryptocurrency targeting'],
      risk: 'critical',
      detections: 47,
    },
    {
      id: 'ransomware-lockbit',
      name: 'LockBit 3.0 Pattern',
      confidence: 0.76,
      indicators: ['Double extortion', 'StealBit exfiltration', 'Automated encryption'],
      risk: 'high',
      detections: 23,
    },
    {
      id: 'phishing-campaign',
      name: 'Spear Phishing Campaign',
      confidence: 0.92,
      indicators: ['CEO fraud attempts', 'Domain spoofing', 'Urgency tactics'],
      risk: 'high',
      detections: 156,
    },
    {
      id: 'cryptojacking',
      name: 'Cryptojacking Cluster',
      confidence: 0.68,
      indicators: ['CPU spike patterns', 'Mining pool connections', 'Browser-based mining'],
      risk: 'medium',
      detections: 89,
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-quantum-400" />
          Detected Attack Patterns
        </h3>
        <button className="text-sm text-quantum-400 hover:text-quantum-300 transition-colors">
          Export Analysis
        </button>
      </div>

      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <motion.div
            key={pattern.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-void-900/50 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPattern === pattern.id ? 'ring-2 ring-quantum-500' : ''
            }`}
            onClick={() => setSelectedPattern(
              selectedPattern === pattern.id ? null : pattern.id
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{pattern.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(pattern.risk)}`}>
                    {pattern.risk.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-void-400">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{pattern.detections} detections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{(pattern.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-void-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${pattern.confidence * 176} 176`}
                      className="text-quantum-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPattern === pattern.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-void-800"
              >
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Behavioral Indicators
                </h5>
                <ul className="space-y-1">
                  {pattern.indicators.map((indicator, i) => (
                    <li key={i} className="text-sm text-void-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-quantum-500 rounded-full" />
                      {indicator}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-quantum-500/20 text-quantum-400 rounded hover:bg-quantum-500/30 transition-colors">
                    View Details
                  </button>
                  <button className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                    Block Pattern
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}