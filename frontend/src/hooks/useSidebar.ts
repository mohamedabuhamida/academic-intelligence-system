import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set) => ({
      isExpanded: true,
      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);