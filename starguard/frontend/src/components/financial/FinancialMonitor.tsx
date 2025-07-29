'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DollarSign, TrendingDown, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MoneyFlowVisualization } from './MoneyFlowVisualization';
import { FraudDetectionPanel } from './FraudDetectionPanel';
import { AMLScanner } from './AMLScanner';

type FinancialTab = 'overview' | 'money-flow' | 'fraud' | 'aml';

export function FinancialMonitor() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'money-flow', label: 'Money Flow', icon: TrendingDown },
    { id: 'fraud', label: 'Fraud Detection', icon: AlertTriangle },
    { id: 'aml', label: 'AML Scanner', icon: DollarSign },
  ];

  const financialStats = {
    transactions_monitored: 284739,
    suspicious_patterns: 47,
    fraud_prevented: '$2.3M',
    aml_alerts: 12,
    vortex_formations: 3,
    collusion_networks: 2,
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-green-400" />
          Financial Crime Prevention
        </h2>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-void-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FinancialTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-green-400 border-green-400'
                    : 'text-void-400 border-transparent hover:text-void-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(financialStats).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-void-900/50 rounded-lg p-4"
                >
                  <div className="text-2xl font-mono font-bold text-green-400">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-xs text-void-400 mt-1">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Financial Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Recent Financial Alerts
              </h3>
              <div className="space-y-2">
                {[
                  {
                    type: 'Money Laundering Vortex',
                    entity: 'Entity_4729',
                    amount: '$450,000',
                    risk: 'high',
                    pattern: 'Layering detected',
                  },
                  {
                    type: 'Insurance Fraud',
                    entity: 'Claim_8392',
                    amount: '$125,000',
                    risk: 'critical',
                    pattern: 'Reality manipulation',
                  },
                  {
                    type: 'Market Manipulation',
                    entity: 'Network_Alpha',
                    amount: '$3.2M',
                    risk: 'medium',
                    pattern: 'Collusion detected',
                  },
                ].map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-void-900/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{alert.type}</div>
                      <div className="text-sm text-void-400">
                        {alert.entity} - {alert.pattern}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{alert.amount}</div>
                      <div className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                        alert.risk === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.risk === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {alert.risk.toUpperCase()} RISK
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Consciousness Anomalies */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Financial Consciousness Anomalies</h3>
              <div className="bg-void-900/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-void-400 mb-1">Energy Vortex Detected</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-consciousness-500 animate-pulse" />
                      <span className="font-mono">Transaction Cluster #47</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-void-400 mb-1">Pattern Distortion</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse" />
                      <span className="font-mono">Temporal Sequence Break</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'money-flow' && <MoneyFlowVisualization />}
        {activeTab === 'fraud' && <FraudDetectionPanel />}
        {activeTab === 'aml' && <AMLScanner />}
      </div>
    </Card>
  );
}