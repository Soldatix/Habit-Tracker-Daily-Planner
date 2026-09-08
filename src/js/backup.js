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
  URL.revokeObjectURL(url);
}

export async function importBackup(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload || payload.backupVersion !== 1 || !payload.data) throw new Error('INVALID_BACKUP');
  return normalizeState(payload.data);
}
