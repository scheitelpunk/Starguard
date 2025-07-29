'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, User, CreditCard } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function FraudDetectionPanel() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const fraudCases = [
    {
      id: 'fraud-001',
      type: 'Identity Theft',
      entity: 'User_8472',
      amount: '$15,420',
      glitches: ['Identity fluctuation', 'Behavioral anomaly'],
      probability: 0.89,
      status: 'investigating',
    },
    {
      id: 'fraud-002',
      type: 'Insurance Fraud',
      entity: 'Claim_3928',
      amount: '$247,000',
      glitches: ['Reality version mismatch', 'Timeline inconsistency'],
      probability: 0.94,
      status: 'blocked',
    },
    {
      id: 'fraud-003',
      type: 'Payment Card Fraud',
      entity: 'Card_****7829',
      amount: '$3,847',
      glitches: ['Location impossibility', 'Device mismatch'],
      probability: 0.72,
      status: 'monitoring',
    },
  ];

  const checkFraudMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await axios.post('/api/financial/fraud/check', {
        transaction: { id: transactionId },
        historical_data: {},
        entity_profile: {},
      });
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return 'bg-red-500/20 text-red-400';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-400';
      case 'monitoring': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-void-500/20 text-void-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Fraud Detection System
        </h3>
        <button
          onClick={() => checkFraudMutation.mutate('test-transaction')}
          className="text-sm px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
        >
          Run Fraud Check
        </button>
      </div>

      {/* Consciousness Glitch Indicators */}
      <div className="bg-void-900/30 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Consciousness Glitch Detection</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-consciousness-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-consciousness-400" />
            </div>
            <div>
              <div className="text-xs text-void-400">Identity Fluctuations</div>
              <div className="font-mono">23 detected</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-quantum-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-quantum-400" />
            </div>
            <div>
              <div className="text-xs text-void-400">Reality Manipulations</div>
              <div className="font-mono">7 detected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Cases */}
      <div className="space-y-3">
        {fraudCases.map((fraudCase, index) => (
          <motion.div
            key={fraudCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-void-900/50 rounded-lg p-4 cursor-pointer transition-all ${
              selectedCase === fraudCase.id ? 'ring-2 ring-orange-500' : ''
            }`}
            onClick={() => setSelectedCase(
              selectedCase === fraudCase.id ? null : fraudCase.id
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <div>
                    <h4 className="font-medium">{fraudCase.type}</h4>
                    <div className="text-sm text-void-400">{fraudCase.entity}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">{fraudCase.amount}</div>
                <div className={`text-xs px-2 py-1 rounded inline-block mt-1 ${getStatusColor(fraudCase.status)}`}>
                  {fraudCase.status.toUpperCase()}
                </div>
              </div>
            </div>

            {selectedCase === fraudCase.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-void-800"
              >
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Fraud Probability</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-void-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${fraudCase.probability * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">
                        {(fraudCase.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Consciousness Glitches</div>
                    <div className="space-y-1">
                      {fraudCase.glitches.map((glitch, i) => (
                        <div key={i} className="text-sm text-void-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          {glitch}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                      Verify Identity
                    </button>
                    <button className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                      Block Transaction
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}