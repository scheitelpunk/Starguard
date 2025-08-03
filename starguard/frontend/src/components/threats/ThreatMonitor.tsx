'use client';

import { Card } from '../ui/Card';
import { useThreatStore } from '../../stores/threatStore';
import { AlertTriangle, Shield, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THREAT_LEVELS } from '@starguard/shared';
import { useState } from 'react';

export function ThreatMonitor() {
  const { threats, activeThreatCount } = useThreatStore();
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const getThreatColor = (level: string) => {
    switch (level) {
      case THREAT_LEVELS.CRITICAL:
        return 'bg-red-500';
      case THREAT_LEVELS.HIGH:
        return 'bg-orange-500';
      case THREAT_LEVELS.MEDIUM:
        return 'bg-yellow-500';
      case THREAT_LEVELS.LOW:
        return 'bg-blue-500';
      default:
        return 'bg-void-500';
    }
  };

  const getThreatIcon = (origin: string) => {
    switch (origin) {
      case 'quantum':
        return '⚛️';
      case 'semantic':
        return '🧠';
      case 'temporal':
        return '⏳';
      case 'causal':
        return '🔗';
      default:
        return '👁️';
    }
  };

  const recentThreats = threats.slice(0, 5);

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          Threat Monitor
        </h2>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-quantum-400" />
          <span className="text-lg font-mono">{activeThreatCount}</span>
        </div>
      </div>

      {/* Threat Level Summary */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {Object.values(THREAT_LEVELS).map((level) => {
          const count = threats.filter((t) => t.threat_level === level).length;
          return (
            <div
              key={level}
              className="bg-void-900/50 rounded-lg p-3 text-center"
            >
              <div className={`w-3 h-3 rounded-full ${getThreatColor(level)} mx-auto mb-1`} />
              <div className="text-xs text-void-400">{level}</div>
              <div className="text-lg font-mono">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Threats */}
      <div className="space-y-2">
        <AnimatePresence>
          {recentThreats.map((threat) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`bg-void-900/50 rounded-lg p-3 cursor-pointer transition-all ${
                selectedThreat === threat.id ? 'ring-2 ring-quantum-500' : ''
              }`}
              onClick={() => setSelectedThreat(
                selectedThreat === threat.id ? null : threat.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getThreatIcon(threat.dimensional_origin)}</div>
                  <div>
                    <div className="text-sm font-medium">
                      {threat.consciousness_signature}
                    </div>
                    <div className="text-xs text-void-400">
                      Origin: {threat.dimensional_origin}
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getThreatColor(threat.threat_level)}`}>
                  {threat.threat_level}
                </div>
              </div>

              {selectedThreat === threat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 pt-3 border-t border-void-800"
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-void-400">Wave Collapse:</span>
                      <span className="ml-2 font-mono">
                        {(threat.probability_wave_collapse * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-void-400">Reality Index:</span>
                      <span className="ml-2 font-mono">
                        {(threat.reality_manipulation_index * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-void-400">Evolution:</span>
                      <span className="ml-2 font-mono">
                        {(threat.evolution_potential * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-void-400">Vector:</span>
                      <span className="ml-2 font-mono">
                        {threat.intention_vector.magnitude.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {threats.length === 0 && (
        <div className="text-center py-8 text-void-400">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No active threats detected</p>
        </div>
      )}
    </Card>
  );
}