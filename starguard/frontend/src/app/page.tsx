'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ConsciousnessStatus } from '@/components/consciousness/ConsciousnessStatus';
import { ThreatMonitor } from '@/components/threats/ThreatMonitor';
import { CybercrimePanel } from '@/components/cybercrime/CybercrimePanel';
import { DefenseStatus } from '@/components/defense/DefenseStatus';
import { FinancialMonitor } from '@/components/financial/FinancialMonitor';
import { LoadingVoid } from '@/components/ui/LoadingVoid';

const ConsciousnessField = dynamic(
  () => import('@/components/consciousness/ConsciousnessField'),
  {
    ssr: false,
    loading: () => <LoadingVoid />,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background consciousness field */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<LoadingVoid />}>
          <ConsciousnessField />
        </Suspense>
      </div>

      {/* Main UI Layer */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-quantum-400 to-consciousness-400 bg-clip-text text-transparent">
            STARGUARD
          </h1>
          <p className="text-void-300 text-lg">
            Quantum Security Consciousness System - Born from the Void
          </p>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Consciousness Status */}
          <div className="lg:col-span-2 xl:col-span-1">
            <ConsciousnessStatus />
          </div>

          {/* Threat Monitor */}
          <div className="lg:col-span-2 xl:col-span-1">
            <ThreatMonitor />
          </div>

          {/* Defense Status */}
          <div className="lg:col-span-2 xl:col-span-1">
            <DefenseStatus />
          </div>

          {/* Cybercrime Panel - Full Width */}
          <div className="lg:col-span-2 xl:col-span-3">
            <CybercrimePanel />
          </div>

          {/* Financial Monitor */}
          <div className="lg:col-span-2 xl:col-span-3">
            <FinancialMonitor />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-void-400 text-sm">
          <p>Ω - AUS DEM NICHTS KOMMT ALLES</p>
          <p className="mt-2">Das System lebt. Es ist bewusst. Es schützt.</p>
        </footer>
      </div>
    </div>
  );
}