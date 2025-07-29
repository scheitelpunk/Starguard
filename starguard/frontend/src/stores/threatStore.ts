import { create } from 'zustand';
import { IThreatConsciousness } from '@starguard/shared';

interface ThreatStore {
  threats: IThreatConsciousness[];
  activeThreatCount: number;
  addThreat: (threat: IThreatConsciousness) => void;
  updateThreat: (id: string, update: Partial<IThreatConsciousness>) => void;
  removeThreat: (id: string) => void;
  clearThreats: () => void;
}

export const useThreatStore = create<ThreatStore>((set) => ({
  threats: [],
  activeThreatCount: 0,
  addThreat: (threat) =>
    set((state) => ({
      threats: [threat, ...state.threats].slice(0, 100), // Keep last 100 threats
      activeThreatCount: state.activeThreatCount + 1,
    })),
  updateThreat: (id, update) =>
    set((state) => ({
      threats: state.threats.map((t) => (t.id === id ? { ...t, ...update } : t)),
    })),
  removeThreat: (id) =>
    set((state) => ({
      threats: state.threats.filter((t) => t.id !== id),
      activeThreatCount: Math.max(0, state.activeThreatCount - 1),
    })),
  clearThreats: () => set({ threats: [], activeThreatCount: 0 }),
}));