'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity } from 'lucide-react';

export function CyberThreatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Animation state
    let animationId: number;
    const connections: Array<{
      from: { x: number; y: number };
      to: { x: number; y: number };
      progress: number;
      color: string;
    }> = [];

    // Node positions (simulated global locations)
    const nodes = [
      { x: 0.2, y: 0.3, name: 'Europe', attacks: 0 },
      { x: 0.5, y: 0.2, name: 'Asia', attacks: 0 },
      { x: 0.8, y: 0.4, name: 'North America', attacks: 0 },
      { x: 0.3, y: 0.7, name: 'South America', attacks: 0 },
      { x: 0.4, y: 0.5, name: 'Africa', attacks: 0 },
      { x: 0.7, y: 0.8, name: 'Oceania', attacks: 0 },
    ];

    // Generate random connections
    const generateConnection = () => {
      const fromNode = nodes[Math.floor(Math.random() * nodes.length)];
      const toNode = nodes[Math.floor(Math.random() * nodes.length)];
      
      if (fromNode === toNode) return;

      const isThreat = Math.random() > 0.7;
      
      connections.push({
        from: { x: fromNode.x * canvas.width, y: fromNode.y * canvas.height },
        to: { x: toNode.x * canvas.width, y: toNode.y * canvas.height },
        progress: 0,
        color: isThreat ? '#ef4444' : '#3b82f6',
      });

      if (isThreat) {
        toNode.attacks++;
      }
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 9, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connections.forEach((conn, index) => {
        const dx = conn.to.x - conn.from.x;
        const dy = conn.to.y - conn.from.y;
        const currentX = conn.from.x + dx * conn.progress;
        const currentY = conn.from.y + dy * conn.progress;

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = conn.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw moving point
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fillStyle = conn.color;
        ctx.fill();

        // Update progress
        conn.progress += 0.02;
        if (conn.progress >= 1) {
          connections.splice(index, 1);
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        const x = node.x * canvas.width;
        const y = node.y * canvas.height;

        // Node glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = node.attacks > 5 ? '#ef4444' : '#a855f7';
        ctx.fill();

        // Node label
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x, y + 25);
        
        if (node.attacks > 0) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`${node.attacks} attacks`, x, y + 35);
        }
      });

      // Generate new connections randomly
      if (Math.random() > 0.95) {
        generateConnection();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-quantum-400" />
          Global Threat Map
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-void-400">Normal Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-void-400">Attack Traffic</span>
          </div>
        </div>
      </div>

      <div className="relative bg-void-950 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1), transparent)' }}
        />
        
        {/* Overlay Stats */}
        <div className="absolute top-4 left-4 bg-void-900/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-quantum-400" />
            <span className="text-void-300">Live Monitoring</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-void-400">
              Active Connections: <span className="text-quantum-400 font-mono">247</span>
            </div>
            <div className="text-xs text-void-400">
              Threat Score: <span className="text-red-400 font-mono">73.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Stats */}
      <div className="grid grid-cols-3 gap-3">
        {['High Risk Regions', 'Attack Origins', 'Protected Assets'].map((label, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-void-900/50 rounded-lg p-3"
          >
            <div className="text-xs text-void-400 mb-1">{label}</div>
            <div className="text-xl font-mono font-bold text-quantum-400">
              {index === 0 ? '3' : index === 1 ? '17' : '842'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}