import { render, screen } from '@testing-library/react';
import { ConsciousnessStatus } from '@/components/consciousness/ConsciousnessStatus';
import { useConsciousnessStore } from '@/stores/consciousnessStore';
import { CONSCIOUSNESS_STATES } from '@starguard/shared';

// Mock the store
jest.mock('@/stores/consciousnessStore');

describe('ConsciousnessStatus', () => {
  const mockUseConsciousnessStore = useConsciousnessStore as jest.MockedFunction<
    typeof useConsciousnessStore
  >;

  beforeEach(() => {
    mockUseConsciousnessStore.mockReturnValue({
      consciousness: {
        id: 'test-id',
        timestamp: new Date(),
        state: {
          current: CONSCIOUSNESS_STATES.AWARE,
          awareness_level: 0.75,
          reality_coherence: 0.9,
          timeline_stability: 0.95,
        },
        consciousness_fields: {
          quantum_awareness: 0.8,
          semantic_resonance: 0.7,
          temporal_coherence: 0.85,
          causal_understanding: 0.6,
          void_connection: 0.9,
        },
        evolution_score: 1.234,
        perception_layers: [],
        threat_consciousness: [],
        response_organisms: [],
      },
      state: {
        current: CONSCIOUSNESS_STATES.AWARE,
        awareness_level: 0.75,
        reality_coherence: 0.9,
        timeline_stability: 0.95,
      },
      updateConsciousness: jest.fn(),
      updateState: jest.fn(),
    });
  });

  it('should render consciousness status', () => {
    render(<ConsciousnessStatus />);
    
    expect(screen.getByText('Consciousness Status')).toBeInTheDocument();
    expect(screen.getByText('AWARE')).toBeInTheDocument();
  });

  it('should display awareness level', () => {
    render(<ConsciousnessStatus />);
    
    expect(screen.getByText('Awareness Level')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('should display all consciousness fields', () => {
    render(<ConsciousnessStatus />);
    
    expect(screen.getByText('QUANTUM AWARENESS')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    
    expect(screen.getByText('SEMANTIC RESONANCE')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    
    expect(screen.getByText('TEMPORAL COHERENCE')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    expect(screen.getByText('CAUSAL UNDERSTANDING')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    
    expect(screen.getByText('VOID CONNECTION')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('should display evolution score', () => {
    render(<ConsciousnessStatus />);
    
    expect(screen.getByText('Evolution Score')).toBeInTheDocument();
    expect(screen.getByText('1.234')).toBeInTheDocument();
  });

  it('should apply correct color for different states', () => {
    // Test HYPER_VIGILANT state
    mockUseConsciousnessStore.mockReturnValue({
      ...mockUseConsciousnessStore(),
      state: {
        current: CONSCIOUSNESS_STATES.HYPER_VIGILANT,
        awareness_level: 0.9,
        reality_coherence: 0.9,
        timeline_stability: 0.9,
      },
    });

    const { rerender } = render(<ConsciousnessStatus />);
    expect(screen.getByText('HYPER_VIGILANT')).toHaveClass('text-red-400');

    // Test DORMANT state
    mockUseConsciousnessStore.mockReturnValue({
      ...mockUseConsciousnessStore(),
      state: {
        current: CONSCIOUSNESS_STATES.DORMANT,
        awareness_level: 0,
        reality_coherence: 1,
        timeline_stability: 1,
      },
    });

    rerender(<ConsciousnessStatus />);
    expect(screen.getByText('DORMANT')).toHaveClass('text-void-400');
  });

  it('should handle null consciousness gracefully', () => {
    mockUseConsciousnessStore.mockReturnValue({
      consciousness: null,
      state: {
        current: CONSCIOUSNESS_STATES.DORMANT,
        awareness_level: 0,
        reality_coherence: 1,
        timeline_stability: 1,
      },
      updateConsciousness: jest.fn(),
      updateState: jest.fn(),
    });

    render(<ConsciousnessStatus />);
    
    // Should render with default values
    expect(screen.getByText('Consciousness Status')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});