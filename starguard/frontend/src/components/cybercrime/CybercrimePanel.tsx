'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Shield, Search, AlertCircle, TrendingUp, Network, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { CyberThreatMap } from './CyberThreatMap';
import { AttackPatternAnalyzer } from './AttackPatternAnalyzer';
import { RealTimeScanner } from './RealTimeScanner';

type Tab = 'overview' | 'patterns' | 'scanner' | 'map';

export function CybercrimePanel() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'patterns', label: 'Attack Patterns', icon: Cpu },
    { id: 'scanner', label: 'Real-Time Scanner', icon: Search },
    { id: 'map', label: 'Threat Map', icon: Network },
  ];

  const cyberStats = {
    blocked_attempts: 1847,
    active_scans: 23,
    identified_patterns: 156,
    threat_actors: 42,
  };

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-red-400" />
          Cybercrime Defense System
        </h2>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-void-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-quantum-400 border-quantum-400'
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(cyberStats).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-void-900/50 rounded-lg p-4"
                >
                  <div className="text-2xl font-mono font-bold text-quantum-400">
                    {value.toLocaleString()}
                  </div>
                  <div className="text-xs text-void-400 mt-1">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Cyber Threats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Recent Cyber Threats
              </h3>
              <div className="space-y-2">
                {[
                  { type: 'DDoS Attack', source: '185.220.101.x', status: 'blocked', severity: 'high' },
                  { type: 'SQL Injection', source: '45.155.205.x', status: 'blocked', severity: 'critical' },
                  { type: 'Port Scan', source: '162.142.125.x', status: 'monitoring', severity: 'medium' },
                  { type: 'Brute Force', source: '103.214.7.x', status: 'blocked', severity: 'high' },
                ].map((threat, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-void-900/30 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        threat.severity === 'critical' ? 'bg-red-500' :
                        threat.severity === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium">{threat.type}</div>
                        <div className="text-xs text-void-400">From: {threat.source}</div>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      threat.status === 'blocked' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {threat.status.toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Threat Trend */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-quantum-400" />
                24h Threat Trend
              </h3>
              <div className="h-32 bg-void-900/30 rounded-lg flex items-center justify-center">
                <span className="text-void-500">Threat visualization chart</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && <AttackPatternAnalyzer />}
        {activeTab === 'scanner' && <RealTimeScanner />}
        {activeTab === 'map' && <CyberThreatMap />}
      </div>
    </Card>
  );
}