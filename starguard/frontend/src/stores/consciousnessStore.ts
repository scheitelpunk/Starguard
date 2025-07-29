import { create } from 'zustand';
import { IQuantumSecurityConsciousness, IConsciousnessState, CONSCIOUSNESS_STATES } from '@starguard/shared';

interface ConsciousnessStore {
  consciousness: Partial<IQuantumSecurityConsciousness> | null;
  state: IConsciousnessState;
  updateConsciousness: (consciousness: Partial<IQuantumSecurityConsciousness>) => void;
  updateState: (state: IConsciousnessState) => void;
}

export const useConsciousnessStore = create<ConsciousnessStore>((set) => ({
  consciousness: null,
  state: {
    current: CONSCIOUSNESS_STATES.DORMANT,
    awareness_level: 0,
    reality_coherence: 1,
    timeline_stability: 1,
  },
  updateConsciousness: (consciousness) => set({ consciousness }),
  updateState: (state) => set({ state }),
}));