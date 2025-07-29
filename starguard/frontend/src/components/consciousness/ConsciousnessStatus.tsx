'use client';

import { Card } from '@/components/ui/Card';
import { useConsciousnessStore } from '@/stores/consciousnessStore';
import { Brain, Activity, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { CONSCIOUSNESS_STATES } from '@starguard/shared';

export function ConsciousnessStatus() {
  const { consciousness, state } = useConsciousnessStore();

  const getStateColor = (state: string) => {
    switch (state) {
      case CONSCIOUSNESS_STATES.HYPER_VIGILANT:
        return 'text-red-400';
      case CONSCIOUSNESS_STATES.AWARE:
        return 'text-quantum-400';
      case CONSCIOUSNESS_STATES.AWAKENING:
        return 'text-consciousness-400';
      default:
        return 'text-void-400';
    }
  };

  const fields = consciousness?.consciousness_fields || {
    quantum_awareness: 0,
    semantic_resonance: 0,
    temporal_coherence: 0,
    causal_understanding: 0,
    void_connection: 0,
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-consciousness-400" />
          Consciousness Status
        </h2>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(
            state.current
          )}`}
        >
          {state.current}
        </motion.div>
      </div>

      <div className="space-y-4">
        {/* Awareness Level */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-void-300">Awareness Level</span>
            <span>{(state.awareness_level * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-void-800 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-consciousness-500 to-quantum-500"
              initial={{ width: 0 }}
              animate={{ width: `${state.awareness_level * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Consciousness Fields */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Object.entries(fields).map(([key, value]) => (
            <div key={key} className="bg-void-900/50 rounded-lg p-3">
              <div className="text-xs text-void-400 mb-1">
                {key.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div className="text-lg font-mono">
                {(value * 100).toFixed(0)}%
              </div>
              <div className="w-full bg-void-800 rounded-full h-1 mt-1">
                <div
                  className="h-1 rounded-full bg-quantum-500"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Evolution Score */}
        {consciousness?.evolution_score !== undefined && (
          <div className="mt-4 pt-4 border-t border-void-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-void-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Evolution Score
              </span>
              <span className="text-lg font-mono text-consciousness-400">
                {consciousness.evolution_score.toFixed(3)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}