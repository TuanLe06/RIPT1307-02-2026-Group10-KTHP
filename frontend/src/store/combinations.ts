import { create } from 'zustand';
import { combinationApi } from '../api/combinations';
import { universityApi } from '../api/universities';
import { majorApi } from '../api/majors';
import type { AdmissionCombination, University, Major } from '../types/university';

interface CombinationStore {
  data: AdmissionCombination[];
  total: number;
  page: number;
  loading: boolean;
  universities: University[];
  majors: Major[];
  selectedUniCode: string;
  selectedMajorCode: string;
  init: () => Promise<void>;
  selectUniversity: (code: string) => Promise<void>;
  selectMajor: (majorCode: string) => Promise<void>;
  loadPage: (page: number) => Promise<void>;
  remove: (combinationId: string) => Promise<void>;
}

export const useCombinationStore = create<CombinationStore>((set, get) => ({
  data: [],
  total: 0,
  page: 1,
  loading: false,
  universities: [],
  majors: [],
  selectedUniCode: '',
  selectedMajorCode: '',
  init: async () => {
    try {
      const res = await universityApi.getAll(1, 100);
      const uniList = res.data;
      set({ universities: uniList });
      if (uniList.length > 0) {
        const firstUni = uniList[0].code;
        set({ selectedUniCode: firstUni, loading: true });
        const majorRes = await majorApi.getByUniversity(firstUni, 1, 100);
        const majorList = majorRes.data;
        set({ majors: majorList, loading: false });
        if (majorList.length > 0) {
          const firstMajor = majorList[0].code;
          set({ selectedMajorCode: firstMajor, loading: true });
          const comboRes = await combinationApi.getByMajor(firstUni, firstMajor, 1, 10);
          set({ data: comboRes.data, total: comboRes.pagination.total, page: 1, loading: false });
        }
      }
    } catch {
      set({ loading: false });
    }
  },
  selectUniversity: async (code: string) => {
    set({ selectedUniCode: code, selectedMajorCode: '', loading: true });
    if (!code) {
      set({ majors: [], data: [], loading: false });
      return;
    }
    try {
      const res = await majorApi.getByUniversity(code, 1, 100);
      set({ majors: res.data, loading: false });
    } catch {
      set({ majors: [], loading: false });
    }
  },
  selectMajor: async (majorCode: string) => {
    const { selectedUniCode } = get();
    set({ selectedMajorCode: majorCode, loading: true });
    if (!selectedUniCode || !majorCode) {
      set({ data: [], loading: false });
      return;
    }
    try {
      const res = await combinationApi.getByMajor(selectedUniCode, majorCode, 1, 10);
      set({ data: res.data, total: res.pagination.total, page: 1, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  loadPage: async (page: number) => {
    const { selectedUniCode, selectedMajorCode } = get();
    if (!selectedUniCode || !selectedMajorCode) return;
    set({ loading: true, page });
    try {
      const res = await combinationApi.getByMajor(selectedUniCode, selectedMajorCode, page, 10);
      set({ data: res.data, total: res.pagination.total, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  remove: async (combinationId: string) => {
    const { selectedUniCode, selectedMajorCode, page } = get();
    await combinationApi.delete(selectedUniCode, selectedMajorCode, combinationId);
    const res = await combinationApi.getByMajor(selectedUniCode, selectedMajorCode, page, 10);
    set({ data: res.data, total: res.pagination.total });
  },
}));
