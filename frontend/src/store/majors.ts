import { create } from 'zustand';
import { majorApi } from '../api/majors';
import { universityApi } from '../api/universities';
import type { Major, University } from '../types/university';

interface MajorStore {
  data: Major[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  universities: University[];
  selectedUniCode: string;
  selectedUniId: string;
  init: () => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
  selectUniversity: (code: string) => Promise<void>;
  remove: (majorId: string) => Promise<void>;
}

export const useMajorStore = create<MajorStore>((set, get) => ({
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: true,
  universities: [],
  selectedUniCode: '',
  selectedUniId: '',
  init: async () => {
    try {
      const res = await universityApi.getAll(1, 100);
      if (res.data.length > 0) {
        const first = res.data[0];
        set({ universities: res.data, selectedUniCode: first.code, selectedUniId: first.id });
        await get().loadPage(1);
      } else {
        set({ universities: res.data, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
  loadPage: async (page: number) => {
    const { selectedUniCode } = get();
    if (!selectedUniCode) return;
    set({ loading: true, page });
    try {
      const res = await majorApi.getByUniversity(selectedUniCode, page, get().pageSize);
      set({ data: res.data, total: res.pagination.total, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  setPageSize: async (size: number) => {
    set({ pageSize: size });
    await get().loadPage(1);
  },
  selectUniversity: async (code: string) => {
    const { universities } = get();
    const uni = universities.find((u) => u.code === code);
    set({ selectedUniCode: code, selectedUniId: uni?.id ?? '', loading: true });
    try {
      const res = await majorApi.getByUniversity(code, 1, get().pageSize);
      set({ data: res.data, total: res.pagination.total, page: 1, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  remove: async (majorId: string) => {
    const { selectedUniId, page } = get();
    await majorApi.delete(selectedUniId, majorId);
    const res = await majorApi.getByUniversity(get().selectedUniCode, page, get().pageSize);
    set({ data: res.data, total: res.pagination.total });
  },
}));
