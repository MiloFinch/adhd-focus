export const formatTimeMMSS = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export const dateKey = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const subtractDays = (days: number): Date => {
  const target = new Date();
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() - days);
  return target;
};

export const dayLabel = (value: Date): string =>
  value.toLocaleDateString('pl-PL', { weekday: 'short' }).replace('.', '');
