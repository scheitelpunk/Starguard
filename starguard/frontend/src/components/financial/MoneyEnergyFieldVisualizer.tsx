'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, TrendingUp, MapPin, Users, Zap } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  type: 'normal' | 'suspicious' | 'layering' | 'smurfing';
  location?: { lat: number; lng: number };
  currency: string;
  metadata?: Record<string, any>;
}

interface MoneyVortex {
  id: string;
  x: number;
  y: number;
  strength: number;
  type: 'layering' | 'smurfing' | 'offshore' | 'structuring';
  suspicious: boolean;
  participants: string[];
  totalAmount: number;
  transactions: Transaction[];
}

interface EnergyParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  energy: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
  transaction: Transaction;
}

interface OffshorePortal {
  id: string;
  x: number;
  y: number;
  size: number;
  activity: number;
  jurisdiction: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MoneyEnergyFieldProps {
  transactions: Transaction[];
  onVortexDetected: (vortex: MoneyVortex) => void;
  realTime: boolean;
  width?: number;
  height?: number;
}

export function MoneyEnergyFieldVisualizer({
  transactions,
  onVortexDetected,
  realTime = true,
  width = 800,
  height = 600
}: MoneyEnergyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vortices, setVortices] = useState<MoneyVortex[]>([]);
  const [particles, setParticles] = useState<EnergyParticle[]>([]);
  const [offshorePortals, setOffshorePortals] = useState<OffshorePortal[]>([]);
  const [energyField, setEnergyField] = useState<number[][]>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
  const [fieldMetrics, setFieldMetrics] = useState({
    totalEnergy: 0,
    vortexCount: 0,
    anomalyScore: 0,
    layeringDetected: false,
    smurfingNetworks: 0,
    offshoreActivity: 0
  });

  useEffect(() => {
    initializeEnergyField();
    generateInitialParticles();
    generateOffshorePortals();
    
    if (realTime) {
      const interval = setInterval(() => {
        updateEnergyField();
        detectVortices();
        detectPatterns();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [transactions, realTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let animationId: number;

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(5, 5, 9, 0.03)';
      ctx.fillRect(0, 0, width, height);

      // Draw energy field background
      drawEnergyField(ctx);

      // Draw offshore portals
      drawOffshorePortals(ctx);

      // Draw vortices
      drawMoneyVortices(ctx);

      // Update and draw particles
      updateParticles();
      drawParticles(ctx);

      // Draw connections between related transactions
      drawTransactionConnections(ctx);

      // Draw pattern overlays
      drawPatternOverlays(ctx);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [particles, vortices, offshorePortals, energyField, width, height]);

  const initializeEnergyField = () => {
    const fieldSize = 50;
    const field: number[][] = [];
    
    for (let i = 0; i < fieldSize; i++) {
      field[i] = [];
      for (let j = 0; j < fieldSize; j++) {
        field[i][j] = Math.random() * 0.1;
      }
    }
    
    setEnergyField(field);
  };

  const generateInitialParticles = () => {
    const newParticles: EnergyParticle[] = [];
    
    transactions.forEach((transaction, index) => {
      const particle: EnergyParticle = {
        id: `particle-${transaction.id}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.log(transaction.amount / 1000) + 2,
        color: getTransactionColor(transaction.type),
        energy: Math.log(transaction.amount) / 10,
        trail: [],
        transaction
      };
      
      newParticles.push(particle);
    });
    
    setParticles(newParticles);
  };

  const generateOffshorePortals = () => {
    const portals: OffshorePortal[] = [
      {
        id: 'cayman-portal',
        x: width * 0.8,
        y: height * 0.3,
        size: 40,
        activity: 0.7,
        jurisdiction: 'Cayman Islands',
        riskLevel: 'high'
      },
      {
        id: 'swiss-portal',
        x: width * 0.2,
        y: height * 0.6,
        size: 35,
        activity: 0.5,
        jurisdiction: 'Switzerland',
        riskLevel: 'medium'
      },
      {
        id: 'singapore-portal',
        x: width * 0.6,
        y: height * 0.8,
        size: 30,
        activity: 0.3,
        jurisdiction: 'Singapore',
        riskLevel: 'low'
      }
    ];
    
    setOffshorePortals(portals);
  };

  const updateEnergyField = () => {
    const newField = [...energyField];
    
    // Update field based on transaction activity
    particles.forEach(particle => {
      const fieldX = Math.floor((particle.x / width) * newField.length);
      const fieldY = Math.floor((particle.y / height) * newField[0].length);
      
      if (fieldX >= 0 && fieldX < newField.length && fieldY >= 0 && fieldY < newField[0].length) {
        newField[fieldX][fieldY] += particle.energy * 0.1;
      }
    });
    
    // Apply energy decay
    for (let i = 0; i < newField.length; i++) {
      for (let j = 0; j < newField[0].length; j++) {
        newField[i][j] *= 0.95;
      }
    }
    
    setEnergyField(newField);
  };

  const detectVortices = () => {
    const newVortices: MoneyVortex[] = [];
    
    // Detect layering patterns
    const layeringVortices = detectLayeringPatterns();
    newVortices.push(...layeringVortices);
    
    // Detect smurfing networks
    const smurfingVortices = detectSmurfingNetworks();
    newVortices.push(...smurfingVortices);
    
    // Detect offshore activity
    const offshoreVortices = detectOffshoreActivity();
    newVortices.push(...offshoreVortices);
    
    setVortices(newVortices);
    
    // Notify about new vortices
    newVortices.forEach(vortex => {
      if (vortex.suspicious) {
        onVortexDetected(vortex);
      }
    });
  };

  const detectLayeringPatterns = (): MoneyVortex[] => {
    const vortices: MoneyVortex[] = [];
    
    // Group transactions by time windows
    const timeWindows = groupTransactionsByTimeWindow(transactions, 3600000); // 1 hour windows
    
    timeWindows.forEach((windowTransactions, index) => {
      if (windowTransactions.length > 10) { // High activity window
        const avgX = windowTransactions.reduce((sum, t) => sum + Math.random() * width, 0) / windowTransactions.length;
        const avgY = windowTransactions.reduce((sum, t) => sum + Math.random() * height, 0) / windowTransactions.length;
        
        const vortex: MoneyVortex = {
          id: `layering-${index}`,
          x: avgX,
          y: avgY,
          strength: windowTransactions.length / 50,
          type: 'layering',
          suspicious: windowTransactions.some(t => t.type === 'suspicious'),
          participants: [...new Set(windowTransactions.flatMap(t => [t.from, t.to]))],
          totalAmount: windowTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: windowTransactions
        };
        
        vortices.push(vortex);
      }
    });
    
    return vortices;
  };

  const detectSmurfingNetworks = (): MoneyVortex[] => {
    const vortices: MoneyVortex[] = [];
    
    // Detect small, frequent transactions from multiple sources
    const accountActivity = groupTransactionsByAccount(transactions);
    
    Object.entries(accountActivity).forEach(([account, txs], index) => {
      const smallTransactions = txs.filter(t => t.amount < 10000);
      
      if (smallTransactions.length > 20) { // Potential smurfing
        const vortex: MoneyVortex = {
          id: `smurfing-${index}`,
          x: Math.random() * width,
          y: Math.random() * height,
          strength: smallTransactions.length / 100,
          type: 'smurfing',
          suspicious: true,
          participants: [account, ...new Set(smallTransactions.map(t => t.to))],
          totalAmount: smallTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: smallTransactions
        };
        
        vortices.push(vortex);
      }
    });
    
    return vortices;
  };

  const detectOffshoreActivity = (): MoneyVortex[] => {
    const vortices: MoneyVortex[] = [];
    
    // Detect transactions involving offshore jurisdictions
    const offshoreTransactions = transactions.filter(t => 
      t.metadata?.jurisdiction && 
      ['cayman', 'bermuda', 'bvi', 'panama'].some(offshore => 
        t.metadata.jurisdiction.toLowerCase().includes(offshore)
      )
    );
    
    if (offshoreTransactions.length > 0) {
      const vortex: MoneyVortex = {
        id: 'offshore-activity',
        x: width * 0.8,
        y: height * 0.3,
        strength: offshoreTransactions.length / 20,
        type: 'offshore',
        suspicious: true,
        participants: [...new Set(offshoreTransactions.flatMap(t => [t.from, t.to]))],
        totalAmount: offshoreTransactions.reduce((sum, t) => sum + t.amount, 0),
        transactions: offshoreTransactions
      };
      
      vortices.push(vortex);
    }
    
    return vortices;
  };

  const detectPatterns = () => {
    const patterns: string[] = [];
    
    if (vortices.some(v => v.type === 'layering')) {
      patterns.push('layering_detected');
    }
    
    if (vortices.some(v => v.type === 'smurfing')) {
      patterns.push('smurfing_network');
    }
    
    if (vortices.some(v => v.type === 'offshore')) {
      patterns.push('offshore_activity');
    }
    
    // Update metrics
    setFieldMetrics({
      totalEnergy: particles.reduce((sum, p) => sum + p.energy, 0),
      vortexCount: vortices.length,
      anomalyScore: Math.min(100, (vortices.filter(v => v.suspicious).length / vortices.length) * 100),
      layeringDetected: patterns.includes('layering_detected'),
      smurfingNetworks: vortices.filter(v => v.type === 'smurfing').length,
      offshoreActivity: vortices.filter(v => v.type === 'offshore').length
    });
    
    setDetectedPatterns(patterns);
  };

  const updateParticles = () => {
    setParticles(prevParticles => 
      prevParticles.map(particle => {
        // Apply vortex forces
        let newVx = particle.vx;
        let newVy = particle.vy;
        
        vortices.forEach(vortex => {
          const dx = vortex.x - particle.x;
          const dy = vortex.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const force = vortex.strength * (1 - distance / 150);
            const angle = Math.atan2(dy, dx);
            
            // Spiral motion
            newVx += Math.cos(angle + Math.PI / 2) * force * 0.5;
            newVy += Math.sin(angle + Math.PI / 2) * force * 0.5;
            
            // Attraction
            newVx += Math.cos(angle) * force * 0.3;
            newVy += Math.sin(angle) * force * 0.3;
          }
        });
        
        // Apply damping
        newVx *= 0.98;
        newVy *= 0.98;
        
        // Update position
        const newX = particle.x + newVx;
        const newY = particle.y + newVy;
        
        // Boundary wrapping
        const wrappedX = newX < 0 ? width : newX > width ? 0 : newX;
        const wrappedY = newY < 0 ? height : newY > height ? 0 : newY;
        
        // Update trail
        const newTrail = [...particle.trail, { x: particle.x, y: particle.y, alpha: 1 }];
        if (newTrail.length > 20) {
          newTrail.shift();
        }
        
        // Decay trail alpha
        newTrail.forEach((point, index) => {
          point.alpha = index / newTrail.length;
        });
        
        return {
          ...particle,
          x: wrappedX,
          y: wrappedY,
          vx: newVx,
          vy: newVy,
          trail: newTrail
        };
      })
    );
  };

  const drawEnergyField = (ctx: CanvasRenderingContext2D) => {
    const fieldSize = energyField.length;
    const cellWidth = width / fieldSize;
    const cellHeight = height / fieldSize;
    
    for (let i = 0; i < fieldSize; i++) {
      for (let j = 0; j < fieldSize; j++) {
        const energy = energyField[i][j];
        if (energy > 0.1) {
          const alpha = Math.min(0.3, energy);
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  };

  const drawOffshorePortals = (ctx: CanvasRenderingContext2D) => {
    offshorePortals.forEach(portal => {
      const pulseSize = portal.size + Math.sin(Date.now() * 0.003) * 5;
      
      // Portal glow
      const gradient = ctx.createRadialGradient(
        portal.x, portal.y, 0,
        portal.x, portal.y, pulseSize
      );
      
      const color = portal.riskLevel === 'high' ? '239, 68, 68' : 
                   portal.riskLevel === 'medium' ? '245, 158, 11' : '16, 185, 129';
      
      gradient.addColorStop(0, `rgba(${color}, 0.6)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Portal ring
      ctx.strokeStyle = `rgba(${color}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, portal.size, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const drawMoneyVortices = (ctx: CanvasRenderingContext2D) => {
    vortices.forEach(vortex => {
      const gradient = ctx.createRadialGradient(
        vortex.x, vortex.y, 0,
        vortex.x, vortex.y, vortex.strength * 100
      );
      
      const color = vortex.suspicious ? '239, 68, 68' : '16, 185, 129';
      gradient.addColorStop(0, `rgba(${color}, 0.4)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(vortex.x, vortex.y, vortex.strength * 100, 0, Math.PI * 2);
      ctx.fill();
      
      // Vortex spiral
      ctx.strokeStyle = `rgba(${color}, 0.6)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const angle = (Date.now() * 0.001 + i * (Math.PI * 2) / 5) % (Math.PI * 2);
        const radius = vortex.strength * 60;
        
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, radius - i * 10, angle, angle + Math.PI / 3);
        ctx.stroke();
      }
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      // Draw trail
      particle.trail.forEach((point, index) => {
        if (index > 0) {
          const prevPoint = particle.trail[index - 1];
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = particle.color + Math.floor(point.alpha * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = particle.size * point.alpha;
          ctx.stroke();
        }
      });
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      
      // Draw energy glow for high-energy particles
      if (particle.energy > 0.5) {
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        glowGradient.addColorStop(0, particle.color + '40');
        glowGradient.addColorStop(1, particle.color + '00');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const drawTransactionConnections = (ctx: CanvasRenderingContext2D) => {
    // Draw connections between related transactions
    particles.forEach(particle1 => {
      particles.forEach(particle2 => {
        if (particle1.id !== particle2.id && 
            (particle1.transaction.from === particle2.transaction.to || 
             particle1.transaction.to === particle2.transaction.from)) {
          
          const distance = Math.sqrt(
            Math.pow(particle1.x - particle2.x, 2) + 
            Math.pow(particle1.y - particle2.y, 2)
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle1.x, particle1.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.strokeStyle = `rgba(100, 100, 100, ${0.3 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
    });
  };

  const drawPatternOverlays = (ctx: CanvasRenderingContext2D) => {
    // Draw pattern recognition overlays
    if (detectedPatterns.includes('layering_detected')) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.fillRect(0, 0, width, height);
    }
    
    if (detectedPatterns.includes('smurfing_network')) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(10, 10, width - 20, height - 20);
      ctx.setLineDash([]);
    }
  };

  const getTransactionColor = (type: Transaction['type']): string => {
    switch (type) {
      case 'suspicious': return '#ef4444';
      case 'layering': return '#f59e0b';
      case 'smurfing': return '#ec4899';
      default: return '#10b981';
    }
  };

  const groupTransactionsByTimeWindow = (transactions: Transaction[], windowSize: number) => {
    const windows = new Map<number, Transaction[]>();
    
    transactions.forEach(transaction => {
      const window = Math.floor(transaction.timestamp.getTime() / windowSize);
      if (!windows.has(window)) {
        windows.set(window, []);
      }
      windows.get(window)!.push(transaction);
    });
    
    return Array.from(windows.values());
  };

  const groupTransactionsByAccount = (transactions: Transaction[]) => {
    const accounts = new Map<string, Transaction[]>();
    
    transactions.forEach(transaction => {
      if (!accounts.has(transaction.from)) {
        accounts.set(transaction.from, []);
      }
      accounts.get(transaction.from)!.push(transaction);
    });
    
    return Object.fromEntries(accounts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          Money Energy Field Visualizer
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-void-400">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-void-400">Layering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full" />
            <span className="text-void-400">Smurfing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-void-400">Suspicious</span>
          </div>
        </div>
      </div>

      <div className="relative bg-void-950 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
        
        {/* Pattern Alerts */}
        {detectedPatterns.length > 0 && (
          <div className="absolute top-4 right-4 space-y-2">
            {detectedPatterns.map((pattern, index) => (
              <motion.div
                key={pattern}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-sm font-medium">
                    {pattern.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-void-400">Pattern detected</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Offshore Portal Info */}
        {offshorePortals.map(portal => (
          <div
            key={portal.id}
            className="absolute bg-void-800/90 backdrop-blur-sm rounded-lg p-2 text-xs"
            style={{
              left: `${(portal.x / width) * 100}%`,
              top: `${(portal.y / height) * 100 - 10}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-medium">{portal.jurisdiction}</div>
            <div className="text-void-400">Activity: {(portal.activity * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>

      {/* Field Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Total Energy</div>
          <div className="text-lg font-mono font-bold text-blue-400">
            {fieldMetrics.totalEnergy.toFixed(1)}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Vortex Count</div>
          <div className="text-lg font-mono font-bold text-purple-400">
            {fieldMetrics.vortexCount}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Anomaly Score</div>
          <div className="text-lg font-mono font-bold text-red-400">
            {fieldMetrics.anomalyScore.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Layering</div>
          <div className="text-lg font-mono font-bold text-yellow-400">
            {fieldMetrics.layeringDetected ? 'ACTIVE' : 'CLEAR'}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Smurfing</div>
          <div className="text-lg font-mono font-bold text-pink-400">
            {fieldMetrics.smurfingNetworks}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Offshore</div>
          <div className="text-lg font-mono font-bold text-orange-400">
            {fieldMetrics.offshoreActivity}
          </div>
        </div>
      </div>

      {/* Active Vortices */}
      {vortices.length > 0 && (
        <div className="bg-void-900/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Active Money Vortices
          </h4>
          <div className="space-y-2">
            {vortices.map(vortex => (
              <div key={vortex.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    vortex.type === 'layering' ? 'bg-yellow-500' :
                    vortex.type === 'smurfing' ? 'bg-pink-500' :
                    vortex.type === 'offshore' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <span className="capitalize">{vortex.type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-void-400">
                  <span>{vortex.participants.length} participants</span>
                  <span>${vortex.totalAmount.toLocaleString()}</span>
                  <span>Strength: {(vortex.strength * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}