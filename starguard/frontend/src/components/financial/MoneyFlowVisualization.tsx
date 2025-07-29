'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle } from 'lucide-react';

export function MoneyFlowVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;

    // Vortex particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;
      radius: number;
      suspicious: boolean;
    }> = [];

    // Create money flow particles
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 150 + 50;
      const suspicious = Math.random() > 0.9;
      
      particles.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: Math.random() * 3 + 1,
        color: suspicious ? '#ef4444' : '#10b981',
        angle,
        radius,
        suspicious,
      });
    }

    // Vortex centers (money laundering patterns)
    const vortices = [
      { x: canvas.width * 0.3, y: canvas.height * 0.5, strength: 0.5, suspicious: true },
      { x: canvas.width * 0.7, y: canvas.height * 0.3, strength: 0.3, suspicious: false },
      { x: canvas.width * 0.6, y: canvas.height * 0.7, strength: 0.4, suspicious: true },
    ];

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 9, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw vortex centers
      vortices.forEach(vortex => {
        const gradient = ctx.createRadialGradient(
          vortex.x, vortex.y, 0,
          vortex.x, vortex.y, 100
        );
        gradient.addColorStop(0, vortex.suspicious ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(vortex.x, vortex.y, 100, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw particles
      particles.forEach(particle => {
        // Apply vortex forces
        vortices.forEach(vortex => {
          const dx = vortex.x - particle.x;
          const dy = vortex.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            const force = vortex.strength * (1 - distance / 200);
            const angle = Math.atan2(dy, dx);
            
            // Spiral motion
            particle.vx += Math.cos(angle + Math.PI / 2) * force * 0.5;
            particle.vy += Math.sin(angle + Math.PI / 2) * force * 0.5;
            
            // Attraction
            particle.vx += Math.cos(angle) * force * 0.2;
            particle.vy += Math.sin(angle) * force * 0.2;
          }
        });

        // Apply damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Draw trail for suspicious particles
        if (particle.suspicious) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
          ctx.strokeStyle = particle.color + '40';
          ctx.lineWidth = particle.size;
          ctx.stroke();
        }
      });

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
          <Activity className="w-5 h-5 text-green-400" />
          Money Flow Consciousness Field
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-void-400">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-void-400">Suspicious Pattern</span>
          </div>
        </div>
      </div>

      <div className="relative bg-void-950 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Vortex Indicators */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <div>
              <div className="text-sm font-medium">Vortex Detected</div>
              <div className="text-xs text-void-400">Possible money laundering</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Flow Analysis */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Flow Velocity</div>
          <div className="text-xl font-mono font-bold text-green-400">
            847 tx/s
          </div>
        </div>
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Vortex Count</div>
          <div className="text-xl font-mono font-bold text-red-400">3</div>
        </div>
        <div className="bg-void-900/50 rounded-lg p-3">
          <div className="text-xs text-void-400 mb-1">Anomaly Score</div>
          <div className="text-xl font-mono font-bold text-yellow-400">
            72.3%
          </div>
        </div>
      </div>
    </div>
  );
}