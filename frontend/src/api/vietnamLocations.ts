import apiClient from './client';

export type VietnamLocationOption = {
  value: string;
  label: string;
  code: number;
  name: string;
  division_type: string;
  codename: string;
};

type VietnamLocationResponse = {
  success: boolean;
  data: VietnamLocationOption[];
};

export const vietnamLocationApi = {
  listProvinces: async (search?: string): Promise<VietnamLocationResponse> => {
    const response = await apiClient.get<VietnamLocationResponse>('/vietnam-locations/provinces', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  listCities: async (search?: string): Promise<VietnamLocationResponse> => {
    const response = await apiClient.get<VietnamLocationResponse>('/vietnam-locations/cities', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  listWardsByProvince: async (
    provinceCode: string | number,
    search?: string
  ): Promise<VietnamLocationResponse> => {
    const response = await apiClient.get<VietnamLocationResponse>(
      `/vietnam-locations/provinces/${provinceCode}/wards`,
      {
        params: search ? { search } : undefined,
      }
    );
    return response.data;
  },
};
