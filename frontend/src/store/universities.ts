import { create } from 'zustand';
import { universityApi } from '../api/universities';
import type { University } from '../types/university';

interface UniversityStore {
  data: University[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  loadPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  deleteUniversity: (id: string) => Promise<void>;
}

export const useUniversityStore = create<UniversityStore>((set, get) => ({
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: true,
  loadPage: async (page: number) => {
    set({ loading: true, page });
    try {
      const res = await universityApi.getAll(page, get().pageSize);
      set({ data: res.data, total: res.pagination.total, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  setPageSize: async (size: number) => {
    set({ pageSize: size });
    await get().loadPage(1);
  },
  deleteUniversity: async (id: string) => {
    await universityApi.delete(id);
    const { page } = get();
    const res = await universityApi.getAll(page, get().pageSize);
    set({ data: res.data, total: res.pagination.total });
  },
}));

// Initial load
useUniversityStore.getState().loadPage(1);
