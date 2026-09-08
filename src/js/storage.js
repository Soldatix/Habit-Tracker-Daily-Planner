const STORAGE_KEY = 'appsandgames.habitPlanner.v1';

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

export function normalizeState(value) {
  const fallback = createDefaultState();
  if (!value || typeof value !== 'object') return fallback;
  return {
    schemaVersion: 1,
    settings: {
      language: ['hr', 'en', 'de', 'it', 'es'].includes(value.settings?.language) ? value.settings.language : 'hr',
      theme: ['light', 'dark', 'system'].includes(value.settings?.theme) ? value.settings.theme : 'system',
    },
    habits: Array.isArray(value.habits) ? value.habits.filter(Boolean) : [],
    completions: value.completions && typeof value.completions === 'object' ? value.completions : {},
    tasks: Array.isArray(value.tasks) ? value.tasks.filter(Boolean) : [],
  };
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
