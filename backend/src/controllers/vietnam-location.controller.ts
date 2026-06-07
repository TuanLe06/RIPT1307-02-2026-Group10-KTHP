import { Request, Response } from 'express';

type VietnamProvince = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  phone_code?: number;
};

type VietnamWard = {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
};

type LocationOption = {
  value: string;
  label: string;
  code: number;
  name: string;
  division_type: string;
  codename: string;
};

const PROVINCES_OPEN_API_BASE_URL = 'https://provinces.open-api.vn/api/v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedProvinces: LocationOption[] | null = null;
let cachedProvincesAt = 0;
const cachedWardsByProvince = new Map<number, { data: LocationOption[]; cachedAt: number }>();

const normalizeSearch = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const toProvinceOption = (province: VietnamProvince): LocationOption => ({
  value: String(province.code),
  label: province.name,
  code: province.code,
  name: province.name,
  division_type: province.division_type,
  codename: province.codename,
});

const toWardOption = (ward: VietnamWard): LocationOption => ({
  value: String(ward.code),
  label: ward.name,
  code: ward.code,
  name: ward.name,
  division_type: ward.division_type,
  codename: ward.codename,
});

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Province Open API responded with ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const filterBySearch = <T extends { label: string; codename: string }>(
  options: T[],
  search: string
): T[] => {
  if (!search) return options;
  const normalizedSearch = search.toLocaleLowerCase('vi');
  return options.filter((option) => {
    const label = option.label.toLocaleLowerCase('vi');
    const codename = option.codename.toLocaleLowerCase('vi');
    return label.includes(normalizedSearch) || codename.includes(normalizedSearch);
  });
};

const getProvinceOptions = async (): Promise<LocationOption[]> => {
  const now = Date.now();
  if (cachedProvinces && now - cachedProvincesAt < CACHE_TTL_MS) {
    return cachedProvinces;
  }

  const provinces = await fetchJson<VietnamProvince[]>(`${PROVINCES_OPEN_API_BASE_URL}/p/`);
  cachedProvinces = provinces
    .map(toProvinceOption)
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  cachedProvincesAt = now;
  return cachedProvinces;
};

const getWardOptionsByProvince = async (provinceCode: number): Promise<LocationOption[]> => {
  const now = Date.now();
  const cached = cachedWardsByProvince.get(provinceCode);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const wards = await fetchJson<VietnamWard[]>(
    `${PROVINCES_OPEN_API_BASE_URL}/w/?province=${provinceCode}`
  );
  const options = wards
    .map(toWardOption)
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  cachedWardsByProvince.set(provinceCode, { data: options, cachedAt: now });
  return options;
};

export const listVietnamProvinces = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = normalizeSearch(req.query.search);
    const provinces = await getProvinceOptions();
    res.json({
      success: true,
      data: filterBySearch(provinces, search),
    });
  } catch (error) {
    console.error('Failed to fetch Vietnam provinces:', error);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch Vietnam provinces',
    });
  }
};

export const listVietnamWardsByProvince = async (req: Request, res: Response): Promise<void> => {
  const provinceCode = Number(req.params.provinceCode || req.query.province_code);
  if (!Number.isInteger(provinceCode) || provinceCode <= 0) {
    res.status(400).json({
      success: false,
      message: 'provinceCode must be a positive integer',
    });
    return;
  }

  try {
    const search = normalizeSearch(req.query.search);
    const wards = await getWardOptionsByProvince(provinceCode);
    res.json({
      success: true,
      data: filterBySearch(wards, search),
    });
  } catch (error) {
    console.error('Failed to fetch Vietnam wards:', error);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch Vietnam wards',
    });
  }
};
