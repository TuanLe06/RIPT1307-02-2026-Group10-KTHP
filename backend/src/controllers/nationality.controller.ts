import { Request, Response } from 'express';

type RestCountry = {
  cca2?: string;
  name?: {
    common?: string;
  };
  translations?: {
    vie?: {
      common?: string;
    };
  };
};

export type NationalityOption = {
  value: string;
  label: string;
};

const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca2,translations';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedOptions: NationalityOption[] | null = null;
let cachedAt = 0;

const fallbackOptions: NationalityOption[] = [
  { value: 'VN', label: 'Việt Nam' },
];

const vietnameseRegionNames = new Intl.DisplayNames(['vi'], { type: 'region' });

const normalizeCountries = (countries: RestCountry[]): NationalityOption[] => {
  const options = countries
    .map((country) => {
      const value = country.cca2?.trim().toUpperCase();
      const label =
        (value ? vietnameseRegionNames.of(value)?.trim() : undefined) ||
        country.translations?.vie?.common?.trim() ||
        country.name?.common?.trim();

      if (!value || !label) return null;
      return { value, label };
    })
    .filter((option): option is NationalityOption => option !== null)
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));

  const vietnamIndex = options.findIndex((option) => option.value === 'VN');
  if (vietnamIndex > 0) {
    const [vietnam] = options.splice(vietnamIndex, 1);
    options.unshift(vietnam);
  }

  return options;
};

const getNationalities = async (): Promise<NationalityOption[]> => {
  const now = Date.now();
  if (cachedOptions && now - cachedAt < CACHE_TTL_MS) {
    return cachedOptions;
  }

  try {
    const response = await fetch(REST_COUNTRIES_URL);
    if (!response.ok) {
      throw new Error(`REST Countries responded with ${response.status}`);
    }

    const countries = (await response.json()) as RestCountry[];
    const options = normalizeCountries(countries);
    if (!options.length) {
      throw new Error('REST Countries returned no usable countries');
    }

    cachedOptions = options;
    cachedAt = now;
    return options;
  } catch (error) {
    if (cachedOptions) return cachedOptions;
    console.error('Failed to fetch nationalities:', error);
    return fallbackOptions;
  }
};

export const listNationalities = async (_req: Request, res: Response): Promise<void> => {
  const nationalities = await getNationalities();
  res.json({
    success: true,
    data: nationalities,
  });
};
