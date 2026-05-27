import { create } from 'zustand';
import { applicationApi } from '../api/applications';
import type { Application, ApplicationStatus } from '../types/university';

interface ApplicationStore {
  data: Application[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  statusFilter: ApplicationStatus | '';
  uniFilter: string;
  search: string;
  setFilters: (filters: { status?: ApplicationStatus | ''; uniFilter?: string; search?: string }) => void;
  loadPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: true,
  statusFilter: '',
  uniFilter: '',
  search: '',
  setFilters: (filters) => {
    const next = { ...get(), ...filters, page: 1 };
    set(next);
    get().loadPage(1);
  },
  loadPage: async (page: number) => {
    const { statusFilter, uniFilter, search, pageSize } = get();
    set({ loading: true, page });
    try {
      const res = await applicationApi.getAll({
        page,
        limit: pageSize,
        status: statusFilter || undefined,
        university_id: uniFilter || undefined,
        search: search || undefined,
      });
      set({ data: res.data, total: res.pagination.total, loading: false });
    } catch {
      set({ data: [], loading: false });
    }
  },
  setPageSize: async (size: number) => {
    set({ pageSize: size });
    await get().loadPage(1);
  },
}));
