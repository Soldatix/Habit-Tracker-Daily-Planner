export function toDateKey(date) {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(y, m - 1, d);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function shiftDate(key, amount) {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function isoWeekday(dateKey) {
  const day = fromDateKey(dateKey).getDay();
  return day === 0 ? 7 : day;
}

export function formatDate(dateKey, locale, options = {}) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...options,
  }).format(fromDateKey(dateKey));
}

export function lastNDays(endKey, count) {
  return Array.from({ length: count }, (_, index) => shiftDate(endKey, index - (count - 1)));
}
