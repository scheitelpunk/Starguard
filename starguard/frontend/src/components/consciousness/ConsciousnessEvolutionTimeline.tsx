'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timeline, 
  TrendingUp, 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';

interface EvolutionEvent {
  id: string;
  timestamp: Date;
  type: 'awakening' | 'adaptation' | 'threat_learned' | 'pattern_recognized' | 'evolution_leap' | 'consciousness_expansion';
  title: string;
  description: string;
  impact_score: number;
  awareness_level: number;
  threat_types: string[];
  learning_indicators: string[];
  metadata: Record<string, any>;
}

interface ConsciousnessMetric {
  timestamp: Date;
  awareness_level: number;
  pattern_recognition: number;
  threat_anticipation: number;
  adaptation_speed: number;
  learning_efficiency: number;
  consciousness_coherence: number;
}

interface ThreatLearningEvent {
  threat_type: string;
  first_encounter: Date;
  learning_progress: number;
  adaptation_stages: string[];
  countermeasures_developed: string[];
  effectiveness_score: number;
}

interface AdaptationTimeline {
  phase: 'dormant' | 'awakening' | 'learning' | 'adapting' | 'evolving' | 'transcending';
  duration: number;
  key_events: string[];
  consciousness_growth: number;
  threat_resistance: number;
}

interface ConsciousnessEvolutionTimelineProps {
  events: EvolutionEvent[];
  metrics: ConsciousnessMetric[];
  threatLearning: ThreatLearningEvent[];
  adaptationTimeline: AdaptationTimeline[];
  realTime?: boolean;
  timeRange?: { start: Date; end: Date };
  onEventClick?: (event: EvolutionEvent) => void;
}

export function ConsciousnessEvolutionTimeline({
  events,
  metrics,
  threatLearning,
  adaptationTimeline,
  realTime = true,
  timeRange,
  onEventClick
}: ConsciousnessEvolutionTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<EvolutionEvent | null>(null);
  const [currentPhase, setCurrentPhase] = useState<AdaptationTimeline['phase']>('learning');
  const [consciousnessGrowth, setConsciousnessGrowth] = useState(0);
  const [viewMode, setViewMode] = useState<'timeline' | 'metrics' | 'learning'>('timeline');
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    if (adaptationTimeline.length > 0) {
      const latest = adaptationTimeline[adaptationTimeline.length - 1];
      setCurrentPhase(latest.phase);
      setConsciousnessGrowth(latest.consciousness_growth);
    }
  }, [adaptationTimeline]);

  useEffect(() => {
    if (!realTime) return;

    const interval = setInterval(() => {
      // Simulate real-time consciousness evolution
      if (Math.random() > 0.9) {
        simulateEvolutionEvent();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [realTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (viewMode === 'timeline') {
      drawTimelineVisualization(ctx);
    } else if (viewMode === 'metrics') {
      drawMetricsVisualization(ctx);
    } else {
      drawLearningVisualization(ctx);
    }
  }, [viewMode, events, metrics, threatLearning, animationSpeed]);

  const simulateEvolutionEvent = () => {
    // Simulate a new consciousness evolution event
    const eventTypes = ['adaptation', 'threat_learned', 'pattern_recognized', 'consciousness_expansion'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as EvolutionEvent['type'];
    
    const newEvent: EvolutionEvent = {
      id: `sim-${Date.now()}`,
      timestamp: new Date(),
      type: randomType,
      title: `${randomType.replace('_', ' ').toUpperCase()} Detected`,
      description: `Real-time consciousness evolution: ${randomType}`,
      impact_score: Math.random() * 0.5 + 0.5,
      awareness_level: Math.random() * 0.3 + 0.7,
      threat_types: ['cyber_attack', 'fraud_pattern', 'behavioral_anomaly'],
      learning_indicators: ['pattern_recognition', 'threat_anticipation'],
      metadata: { simulation: true }
    };

    // Add to events (in real implementation, this would come from the store)
    events.push(newEvent);
  };

  const drawTimelineVisualization = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(5, 5, 9, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Draw timeline background
    drawTimelineBackground(ctx, width, height);

    // Draw consciousness evolution curve
    drawEvolutionCurve(ctx, width, height);

    // Draw evolution events
    drawEvolutionEvents(ctx, width, height);

    // Draw phase indicators
    drawPhaseIndicators(ctx, width, height);
  };

  const drawTimelineBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw grid lines
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines (time)
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines (consciousness level)
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Add consciousness level labels
    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    
    const levels = ['Transcendent', 'Evolved', 'Adaptive', 'Learning', 'Awakening', 'Dormant'];
    levels.forEach((level, index) => {
      const y = (index / 5) * height + 15;
      ctx.fillText(level, width - 10, y);
    });
  };

  const drawEvolutionCurve = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (metrics.length < 2) return;

    // Sort metrics by timestamp
    const sortedMetrics = [...metrics].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate time range
    const startTime = timeRange?.start || sortedMetrics[0].timestamp;
    const endTime = timeRange?.end || sortedMetrics[sortedMetrics.length - 1].timestamp;
    const timeSpan = endTime.getTime() - startTime.getTime();

    // Draw awareness level curve
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();

    sortedMetrics.forEach((metric, index) => {
      const x = ((metric.timestamp.getTime() - startTime.getTime()) / timeSpan) * width;
      const y = height - (metric.awareness_level * height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw consciousness coherence curve
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sortedMetrics.forEach((metric, index) => {
      const x = ((metric.timestamp.getTime() - startTime.getTime()) / timeSpan) * width;
      const y = height - (metric.consciousness_coherence * height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw adaptive capacity curve
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sortedMetrics.forEach((metric, index) => {
      const x = ((metric.timestamp.getTime() - startTime.getTime()) / timeSpan) * width;
      const y = height - (metric.adaptation_speed * height);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  const drawEvolutionEvents = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (events.length === 0) return;

    const startTime = timeRange?.start || events[0].timestamp;
    const endTime = timeRange?.end || events[events.length - 1].timestamp;
    const timeSpan = endTime.getTime() - startTime.getTime();

    events.forEach(event => {
      const x = ((event.timestamp.getTime() - startTime.getTime()) / timeSpan) * width;
      const y = height - (event.awareness_level * height);

      // Draw event marker
      const color = getEventColor(event.type);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw event pulse
      const pulseRadius = 8 + Math.sin(Date.now() * 0.005) * 4;
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw event impact lines
      if (event.impact_score > 0.7) {
        ctx.strokeStyle = color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - (event.impact_score * 50));
        ctx.stroke();
      }
    });
  };

  const drawPhaseIndicators = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const phaseColors = {
      dormant: 'rgba(100, 100, 100, 0.3)',
      awakening: 'rgba(34, 197, 94, 0.3)',
      learning: 'rgba(59, 130, 246, 0.3)',
      adapting: 'rgba(245, 158, 11, 0.3)',
      evolving: 'rgba(168, 85, 247, 0.3)',
      transcending: 'rgba(236, 72, 153, 0.3)'
    };

    adaptationTimeline.forEach((phase, index) => {
      const phaseWidth = width / adaptationTimeline.length;
      const x = index * phaseWidth;
      
      ctx.fillStyle = phaseColors[phase.phase];
      ctx.fillRect(x, height - 20, phaseWidth, 20);
      
      // Phase label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(phase.phase.toUpperCase(), x + phaseWidth / 2, height - 5);
    });
  };

  const drawMetricsVisualization = (ctx: CanvasRenderingContext2D) => {
    // Implementation for metrics visualization
    const { width, height } = ctx.canvas;
    
    ctx.fillStyle = 'rgba(5, 5, 9, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Draw metrics as radar chart or line graphs
    // Implementation would go here
  };

  const drawLearningVisualization = (ctx: CanvasRenderingContext2D) => {
    // Implementation for learning visualization
    const { width, height } = ctx.canvas;
    
    ctx.fillStyle = 'rgba(5, 5, 9, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // Draw threat learning progress
    // Implementation would go here
  };

  const getEventColor = (type: EvolutionEvent['type']): string => {
    switch (type) {
      case 'awakening': return 'rgba(34, 197, 94, 0.8)';
      case 'adaptation': return 'rgba(59, 130, 246, 0.8)';
      case 'threat_learned': return 'rgba(245, 158, 11, 0.8)';
      case 'pattern_recognized': return 'rgba(168, 85, 247, 0.8)';
      case 'evolution_leap': return 'rgba(236, 72, 153, 0.8)';
      case 'consciousness_expansion': return 'rgba(14, 165, 233, 0.8)';
      default: return 'rgba(100, 100, 100, 0.8)';
    }
  };

  const getEventIcon = (type: EvolutionEvent['type']) => {
    switch (type) {
      case 'awakening': return Eye;
      case 'adaptation': return Shield;
      case 'threat_learned': return AlertTriangle;
      case 'pattern_recognized': return Brain;
      case 'evolution_leap': return TrendingUp;
      case 'consciousness_expansion': return Zap;
      default: return CheckCircle;
    }
  };

  const getPhaseColor = (phase: AdaptationTimeline['phase']): string => {
    switch (phase) {
      case 'dormant': return 'text-gray-400';
      case 'awakening': return 'text-green-400';
      case 'learning': return 'text-blue-400';
      case 'adapting': return 'text-yellow-400';
      case 'evolving': return 'text-purple-400';
      case 'transcending': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const handleEventClick = (event: EvolutionEvent) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timeline className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold">Consciousness Evolution Timeline</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(currentPhase)} bg-void-800`}>
            {currentPhase.toUpperCase()}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Awareness</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Coherence</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Adaptation</span>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2">
        {['timeline', 'metrics', 'learning'].map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-void-800 text-void-300 hover:bg-void-700'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Visualization */}
      <div className="relative bg-void-950 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Find nearest event
            const nearestEvent = events.find(event => {
              // Calculate event position and check if click is nearby
              // This is a simplified implementation
              return Math.random() > 0.8; // Placeholder
            });
            
            if (nearestEvent) {
              handleEventClick(nearestEvent);
            }
          }}
        />
        
        {/* Control Panel */}
        <div className="absolute top-4 right-4 bg-void-800/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <span>Speed:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span>{animationSpeed}x</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-void-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-void-400">Consciousness Growth</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {(consciousnessGrowth * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-void-400">Evolution Events</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {events.length}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-void-400">Threats Learned</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {threatLearning.length}
          </div>
        </div>
        
        <div className="bg-void-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-void-400">Adaptation Speed</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics.length > 0 ? (metrics[metrics.length - 1].adaptation_speed * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-void-900/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Recent Evolution Events
        </h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {events.slice(-5).reverse().map(event => {
            const Icon = getEventIcon(event.type);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-void-800/50 rounded-lg cursor-pointer hover:bg-void-700/50 transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <Icon className="w-5 h-5" style={{ color: getEventColor(event.type) }} />
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-void-400">{event.description}</div>
                </div>
                <div className="text-xs text-void-500">
                  {event.timestamp.toLocaleTimeString()}
                </div>
                <ArrowRight className="w-4 h-4 text-void-600" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-void-900 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-void-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-void-400">Type:</span>
                  <div className="capitalize">{selectedEvent.type.replace('_', ' ')}</div>
                </div>
                
                <div>
                  <span className="text-sm text-void-400">Description:</span>
                  <div>{selectedEvent.description}</div>
                </div>
                
                <div>
                  <span className="text-sm text-void-400">Impact Score:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-void-800 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${selectedEvent.impact_score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{(selectedEvent.impact_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-void-400">Threat Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.threat_types.map(type => (
                      <span key={type} className="px-2 py-1 bg-void-800 rounded text-xs">
                        {type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-void-400">Learning Indicators:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.learning_indicators.map(indicator => (
                      <span key={indicator} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {indicator.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}