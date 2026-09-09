export const STORAGE_KEY = 'appsandgames.habitPlanner.v1';

const LANGUAGES = new Set(['hr', 'en', 'de', 'it', 'es']);
const THEMES = new Set(['light', 'dark', 'system']);
const PRIORITIES = new Set(['low', 'medium', 'high']);
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function createDefaultState() {
  return {
    schemaVersion: 1,
    settings: { language: 'hr', theme: 'system' },
    habits: [],
    completions: {},
    tasks: [],
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidTimestamp(value) {
  return typeof value === 'string' && value.length <= 64 && Number.isFinite(Date.parse(value));
}

function invalid(strict) {
  if (strict) throw new Error('INVALID_BACKUP');
  return null;
}

function normalizeHabit(value, strict) {
  if (!isPlainObject(value)) return invalid(strict);
  if (typeof value.id !== 'string' || !SAFE_ID_RE.test(value.id)) return invalid(strict);
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 60) return invalid(strict);
  if (typeof value.emoji !== 'string' || value.emoji.length > 32) return invalid(strict);
  if (!Array.isArray(value.days) || !value.days.length) return invalid(strict);

  const days = [...new Set(value.days)];
  if (days.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) return invalid(strict);
  if (value.createdAt != null && !isValidTimestamp(value.createdAt)) return invalid(strict);

  return {
    id: value.id,
    name: value.name.trim(),
    emoji: value.emoji.trim() || '✓',
    days: days.sort((a, b) => a - b),
    createdAt: value.createdAt || null,
  };
}

function normalizeTask(value, strict) {
  if (!isPlainObject(value)) return invalid(strict);
  if (typeof value.id !== 'string' || !SAFE_ID_RE.test(value.id)) return invalid(strict);
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > 100) return invalid(strict);
  if (!isValidDateKey(value.date)) return invalid(strict);
  if (typeof value.time !== 'string' || (value.time && !TIME_RE.test(value.time))) return invalid(strict);
  if (!PRIORITIES.has(value.priority)) return invalid(strict);
  if (typeof value.notes !== 'string' || value.notes.length > 300) return invalid(strict);
  if (typeof value.done !== 'boolean') return invalid(strict);
  if (value.createdAt != null && !isValidTimestamp(value.createdAt)) return invalid(strict);

  return {
    id: value.id,
    title: value.title.trim(),
    date: value.date,
    time: value.time,
    priority: value.priority,
    notes: value.notes.trim(),
    done: value.done,
    createdAt: value.createdAt || null,
  };
}

function normalizeCompletions(value, validHabitIds, strict) {
  if (!isPlainObject(value)) return strict ? invalid(true) : {};
  const result = {};

  for (const [habitId, dates] of Object.entries(value)) {
    if (!SAFE_ID_RE.test(habitId) || !validHabitIds.has(habitId) || !isPlainObject(dates)) {
      if (strict) invalid(true);
      continue;
    }

    const normalizedDates = {};
    for (const [dateKey, done] of Object.entries(dates)) {
      if (!isValidDateKey(dateKey) || done !== true) {
        if (strict) invalid(true);
        continue;
      }
      normalizedDates[dateKey] = true;
    }
    result[habitId] = normalizedDates;
  }

  return result;
}

export function normalizeState(value, { strict = false } = {}) {
  const fallback = createDefaultState();
  if (!isPlainObject(value)) {
    if (strict) throw new Error('INVALID_BACKUP');
    return fallback;
  }

  if (strict && value.schemaVersion !== 1) throw new Error('INVALID_BACKUP');
  if (strict && !isPlainObject(value.settings)) throw new Error('INVALID_BACKUP');
  if (strict && (!LANGUAGES.has(value.settings.language) || !THEMES.has(value.settings.theme))) throw new Error('INVALID_BACKUP');
  if (strict && (!Array.isArray(value.habits) || !Array.isArray(value.tasks) || !isPlainObject(value.completions))) throw new Error('INVALID_BACKUP');

  const settings = {
    language: LANGUAGES.has(value.settings?.language) ? value.settings.language : 'hr',
    theme: THEMES.has(value.settings?.theme) ? value.settings.theme : 'system',
  };

  const habits = [];
  const habitIds = new Set();
  for (const item of Array.isArray(value.habits) ? value.habits : []) {
    const habit = normalizeHabit(item, strict);
    if (!habit) continue;
    if (habitIds.has(habit.id)) {
      if (strict) throw new Error('INVALID_BACKUP');
      continue;
    }
    habitIds.add(habit.id);
    habits.push(habit);
  }

  const tasks = [];
  const taskIds = new Set();
  for (const item of Array.isArray(value.tasks) ? value.tasks : []) {
    const task = normalizeTask(item, strict);
    if (!task) continue;
    if (taskIds.has(task.id)) {
      if (strict) throw new Error('INVALID_BACKUP');
      continue;
    }
    taskIds.add(task.id);
    tasks.push(task);
  }

  return {
    schemaVersion: 1,
    settings,
    habits,
    completions: normalizeCompletions(value.completions ?? {}, habitIds, strict),
    tasks,
  };
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
