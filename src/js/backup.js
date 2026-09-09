import { normalizeState } from './storage.js';

export function exportBackup(state) {
  const payload = {
    app: 'Apps & Games Habit Tracker / Daily Planner',
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `habit-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function importBackup(file) {
  if (!file || typeof file.text !== 'function') throw new Error('INVALID_BACKUP');

  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('INVALID_BACKUP');
  if (payload.backupVersion !== 1 || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
    throw new Error('INVALID_BACKUP');
  }

  return normalizeState(payload.data, { strict: true });
}
