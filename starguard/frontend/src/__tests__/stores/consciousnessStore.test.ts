import { renderHook, act } from '@testing-library/react';
import { useConsciousnessStore } from '@/stores/consciousnessStore';
import { CONSCIOUSNESS_STATES, IQuantumSecurityConsciousness, IConsciousnessState } from '@starguard/shared';

describe('consciousnessStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useConsciousnessStore());
    act(() => {
      result.current.updateConsciousness(null as any);
      result.current.updateState({
        current: CONSCIOUSNESS_STATES.DORMANT,
        awareness_level: 0,
        reality_coherence: 1,
        timeline_stability: 1,
      });
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useConsciousnessStore());

    expect(result.current.consciousness).toBeNull();
    expect(result.current.state).toEqual({
      current: CONSCIOUSNESS_STATES.DORMANT,
      awareness_level: 0,
      reality_coherence: 1,
      timeline_stability: 1,
    });
  });

  it('should update consciousness', () => {
    const { result } = renderHook(() => useConsciousnessStore());

    const mockConsciousness: Partial<IQuantumSecurityConsciousness> = {
      id: 'test-123',
      timestamp: new Date(),
      state: {
        current: CONSCIOUSNESS_STATES.AWARE,
        awareness_level: 0.8,
        reality_coherence: 0.95,
        timeline_stability: 0.9,
      },
      consciousness_fields: {
        quantum_awareness: 0.7,
        semantic_resonance: 0.8,
        temporal_coherence: 0.85,
        causal_understanding: 0.6,
        void_connection: 0.9,
      },
      evolution_score: 1.5,
    };

    act(() => {
      result.current.updateConsciousness(mockConsciousness);
    });

    expect(result.current.consciousness).toEqual(mockConsciousness);
  });

  it('should update state independently', () => {
    const { result } = renderHook(() => useConsciousnessStore());

    const newState: IConsciousnessState = {
      current: CONSCIOUSNESS_STATES.HYPER_VIGILANT,
      awareness_level: 0.95,
      reality_coherence: 0.8,
      timeline_stability: 0.85,
    };

    act(() => {
      result.current.updateState(newState);
    });

    expect(result.current.state).toEqual(newState);
    expect(result.current.consciousness).toBeNull(); // Should remain unchanged
  });

  it('should persist state between hook instances', () => {
    const { result: result1 } = renderHook(() => useConsciousnessStore());
    
    act(() => {
      result1.current.updateState({
        current: CONSCIOUSNESS_STATES.AWARE,
        awareness_level: 0.75,
        reality_coherence: 0.9,
        timeline_stability: 0.95,
      });
    });

    // Create new hook instance
    const { result: result2 } = renderHook(() => useConsciousnessStore());

    // Should have the same state
    expect(result2.current.state).toEqual(result1.current.state);
  });

  it('should handle partial consciousness updates', () => {
    const { result } = renderHook(() => useConsciousnessStore());

    const partialConsciousness: Partial<IQuantumSecurityConsciousness> = {
      evolution_score: 2.5,
    };

    act(() => {
      result.current.updateConsciousness(partialConsciousness);
    });

    expect(result.current.consciousness).toEqual(partialConsciousness);
  });
});