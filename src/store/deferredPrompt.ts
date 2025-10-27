import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeferredPromptStore {
    deferredPrompt: any;    
    setDeferredPrompt: (deferredPrompt: any) => void;
}

export const useDeferredPromptStore = create<DeferredPromptStore>()(
    persist(
      (set) => ({
        deferredPrompt: null,
        setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
      }),
      {
        name: 'deferredPrompt',
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) => !['deferredPrompt'].includes(key)),
          ),
      }
    )
  );