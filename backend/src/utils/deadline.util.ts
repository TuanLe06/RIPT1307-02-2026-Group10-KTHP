const parseDDMMYYYY = (dateStr: string): Date | null => {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const formatDateVN = (date: Date): string => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

export interface DeadlineConfig {
  startDate: Date;
  endDate: Date;
}

export interface DeadlineInfo {
  start_date: string;
  end_date: string;
  days_remaining: number | null;
  status: 'before' | 'during' | 'after';
  message: string;
}

const parseEnvDate = (key: string, fallback: string): Date => {
  const val = process.env[key];
  const parsed = val ? parseDDMMYYYY(val) : null;
  if (!parsed) {
    const fallbackParsed = parseDDMMYYYY(fallback);
    if (!fallbackParsed) throw new Error(`Invalid fallback date: ${fallback}`);
    return fallbackParsed;
  }
  return parsed;
};

export const getDeadlineConfig = (): DeadlineConfig => {
  const startDate = parseEnvDate('APPLICATION_START_DATE', '02/07/2025');
  const endDate = parseEnvDate('APPLICATION_END_DATE', '12/07/2025');
  return { startDate, endDate };
};

export const getDeadlineStatus = (): DeadlineInfo => {
  const { startDate, endDate } = getDeadlineConfig();
  const now = new Date();

  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  let status: DeadlineInfo['status'];
  let daysRemaining: number | null;

  if (now < start) {
    status = 'before';
    daysRemaining = null;
  } else if (now > end) {
    status = 'after';
    daysRemaining = null;
  } else {
    status = 'during';
    const diff = end.getTime() - now.getTime();
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const message = (() => {
    switch (status) {
      case 'before':
        return `Kỳ tuyển sinh chưa bắt đầu. Thời gian đăng ký từ ${formatDateVN(startDate)} đến ${formatDateVN(endDate)}`;
      case 'during':
        if (daysRemaining !== null && daysRemaining > 0) {
          return `Còn ${daysRemaining} ngày để hoàn thành hồ sơ đăng ký xét tuyển (hạn: ${formatDateVN(endDate)})`;
        }
        return `Hôm nay là hạn cuối đăng ký xét tuyển (${formatDateVN(endDate)})`;
      case 'after':
        return `Đã hết hạn đăng ký xét tuyển (kết thúc từ ${formatDateVN(endDate)})`;
    }
  })();

  return {
    start_date: formatDateVN(startDate),
    end_date: formatDateVN(endDate),
    days_remaining: daysRemaining,
    status,
    message,
  };
};

export const isWithinDeadline = (): boolean => {
  const info = getDeadlineStatus();
  return info.status === 'during';
};
