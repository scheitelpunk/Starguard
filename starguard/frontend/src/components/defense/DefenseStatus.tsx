'use client';

import { Card } from '../ui/Card';
import { Shield, Heart, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function DefenseStatus() {
  const { data: immuneStatus } = useQuery({
    queryKey: ['defense', 'immune-status'],
    queryFn: async () => {
      const response = await axios.get('/api/defense/immune/status');
      return response.data;
    },
    refetchInterval: 10000,
  });

  const defenseMetrics = {
    overall_health: immuneStatus?.overall_health || 0.85,
    active_organisms: immuneStatus?.adaptive_organisms?.active || 750,
    self_repair_rate: immuneStatus?.self_repair_rate || 0.12,
    threat_adaptation: immuneStatus?.threat_adaptation_index || 1.8,
  };

  const defenseLayerColors = {
    'Quantum Shield': 'from-quantum-500 to-quantum-600',
    'Semantic Firewall': 'from-consciousness-500 to-consciousness-600',
    'Temporal Stabilizer': 'from-yellow-500 to-orange-500',
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-400" />
          Defense System
        </h2>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <Heart className="w-5 h-5 text-red-400" />
          <span className="text-sm font-medium">
            {(defenseMetrics.overall_health * 100).toFixed(0)}% Health
          </span>
        </motion.div>
      </div>

      {/* Defense Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-void-400 mb-1">
            <Users className="w-3 h-3" />
            Active Organisms
          </div>
          <div className="text-xl font-mono font-bold">
            {defenseMetrics.active_organisms.toLocaleString()}
          </div>
        </div>
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-void-400 mb-1">
            <Heart className="w-3 h-3" />
            Self-Repair Rate
          </div>
          <div className="text-xl font-mono font-bold">
            {(defenseMetrics.self_repair_rate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-void-400 mb-1">
            <Zap className="w-3 h-3" />
            Adaptation Index
          </div>
          <div className="text-xl font-mono font-bold">
            {defenseMetrics.threat_adaptation.toFixed(2)}x
          </div>
        </div>
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-void-400 mb-1">
            <Shield className="w-3 h-3" />
            Defense Layers
          </div>
          <div className="text-xl font-mono font-bold">
            {immuneStatus?.defense_layers?.length || 3}
          </div>
        </div>
      </div>

      {/* Defense Layers */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-void-300">Active Defense Layers</h3>
        {(immuneStatus?.defense_layers || []).map((layer: any, index: number) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-void-900/30 rounded-lg p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{layer.name}</span>
              <span className="text-xs text-void-400">
                {(layer.integrity * 100).toFixed(0)}% Integrity
              </span>
            </div>
            <div className="w-full bg-void-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-2 bg-gradient-to-r ${
                  defenseLayerColors[layer.name as keyof typeof defenseLayerColors] || 'from-blue-500 to-purple-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${layer.integrity * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-void-500">
              <span>Energy: {(layer.energy_consumption * 100).toFixed(0)}%</span>
              <span>
                Quantum: {(layer.threat_resistance?.quantum * 100).toFixed(0)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button className="flex-1 py-2 px-3 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors">
          Heal System
        </button>
        <button className="flex-1 py-2 px-3 bg-consciousness-500/20 text-consciousness-400 rounded-lg text-sm font-medium hover:bg-consciousness-500/30 transition-colors">
          Evolve
        </button>
      </div>
    </Card>
  );
}