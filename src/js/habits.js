import { isoWeekday, lastNDays, toDateKey } from './dates.js';

export function createHabit({ name, emoji, days }) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    emoji: emoji?.trim() || '✓',
    days: [...days].sort((a, b) => a - b),
    createdAt: new Date().toISOString(),
  };
}

export function habitsForDate(state, dateKey) {
  const weekday = isoWeekday(dateKey);
  return state.habits.filter((habit) => {
    if (!Array.isArray(habit.days) || !habit.days.includes(weekday)) return false;
    if (!habit.createdAt) return true;
    const createdDateKey = toDateKey(new Date(habit.createdAt));
    return dateKey >= createdDateKey;
  });
}


export function isHabitDone(state, habitId, dateKey) {
  return Boolean(state.completions?.[habitId]?.[dateKey]);
}

export function toggleHabit(state, habitId, dateKey) {
  state.completions[habitId] ??= {};
  if (state.completions[habitId][dateKey]) delete state.completions[habitId][dateKey];
  else state.completions[habitId][dateKey] = true;
}

export function deleteHabit(state, habitId) {
  state.habits = state.habits.filter((habit) => habit.id !== habitId);
  delete state.completions[habitId];
}

export function dayCompletion(state, dateKey) {
  const scheduled = habitsForDate(state, dateKey);
  const completed = scheduled.filter((habit) => isHabitDone(state, habit.id, dateKey)).length;
  return { scheduled: scheduled.length, completed, rate: scheduled.length ? completed / scheduled.length : 0 };
}

export function calculateBestStreak(state, endDateKey, lookback = 365) {
  let current = 0;
  let best = 0;
  for (const dateKey of lastNDays(endDateKey, lookback)) {
    const { scheduled, completed } = dayCompletion(state, dateKey);
    if (scheduled > 0 && completed === scheduled) {
      current += 1;
      best = Math.max(best, current);
    } else if (scheduled > 0) {
      current = 0;
    }
  }
  return best;
}
