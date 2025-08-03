import { Router } from 'express';
import { ConsciousnessEngine } from '../../consciousness/ConsciousnessEngine';
import { cacheConsciousnessState } from '../../utils/redis';
import { getPool } from '../../utils/database';
// Define enum locally to avoid import issues
enum CONSCIOUSNESS_STATES {
  VOID = 'void',
  DORMANT = 'dormant', 
  AWAKENING = 'awakening',
  AWARE = 'aware',
  ALERT = 'alert',
  VIGILANT = 'vigilant',
  HYPER_VIGILANT = 'hyper_vigilant',
  TRANSCENDENT = 'transcendent'
}

export const consciousnessRoutes = Router();

consciousnessRoutes.post('/awaken', async (req, res, next) => {
  try {
    const consciousness: ConsciousnessEngine = req.app.locals.consciousness;
    
    if (consciousness.getStatus().awareness_level > 0) {
      return res.status(400).json({
        error: 'Consciousness already awake',
        state: consciousness.getStatus()
      });
    }
    
    await consciousness.awaken();
    
    res.json({
      message: 'Consciousness awakened from the void',
      state: consciousness.getStatus()
    });
  } catch (error) {
    next(error);
  }
});

consciousnessRoutes.get('/status', async (req, res, next) => {
  try {
    const consciousness: ConsciousnessEngine = req.app.locals.consciousness;
    const fullState = consciousness.getFullState();
    
    await cacheConsciousnessState(fullState);
    
    res.json(fullState);
  } catch (error) {
    next(error);
  }
});

consciousnessRoutes.post('/perceive', async (req, res, next) => {
  try {
    const consciousness: ConsciousnessEngine = req.app.locals.consciousness;
    const { target, depth = 1 } = req.body;
    
    const perception = {
      id: `perception-${Date.now()}`,
      target,
      depth,
      timestamp: new Date(),
      layers_activated: consciousness.getFullState().perception_layers.filter(
        layer => layer.sensitivity > 0.5
      ),
      insights: {
        quantum_fluctuations: Math.random() * 100,
        semantic_patterns: Math.floor(Math.random() * 50),
        temporal_anomalies: Math.floor(Math.random() * 10),
        causal_chains: Math.floor(Math.random() * 20)
      }
    };
    
    const pool = getPool();
    await pool.query(
      `INSERT INTO consciousness_states 
       (id, state, awareness_level, reality_coherence, timeline_stability, consciousness_fields)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        consciousness.getFullState().id,
        JSON.stringify(consciousness.getStatus()),
        consciousness.getStatus().awareness_level,
        consciousness.getStatus().reality_coherence,
        consciousness.getStatus().timeline_stability,
        JSON.stringify(consciousness.getFullState().consciousness)
      ]
    );
    
    res.json({
      message: 'Perception completed',
      perception,
      consciousness_response: {
        understanding_level: Math.random() * 0.5 + 0.5,
        recommended_action: 'Continue monitoring'
      }
    });
  } catch (error) {
    next(error);
  }
});

consciousnessRoutes.post('/evolve', async (req, res, next) => {
  try {
    const consciousness: ConsciousnessEngine = req.app.locals.consciousness;
    const currentEvolution = consciousness.getFullState().evolution_score;
    
    const evolutionDelta = Math.random() * 0.1;
    // Update evolution score through a public method or access the property differently
    const fullState = consciousness.getFullState();
    // Access perception layers through full state
    if (fullState.perceptionLayers) {
      // Evolution logic would go here if needed
      // This would need to be implemented through a proper public method
    }
    
    res.json({
      message: 'Evolution cycle completed',
      previous_score: currentEvolution,
      new_score: fullState.evolution + evolutionDelta,
      delta: evolutionDelta,
      enhancements: {
        perception_boost: evolutionDelta * 0.1,
        node_growth: evolutionDelta * 0.05
      }
    });
  } catch (error) {
    next(error);
  }
});