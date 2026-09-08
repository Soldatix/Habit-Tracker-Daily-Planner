export function createTask({ title, date, time, priority, notes }) {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    date,
    time: time || '',
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    notes: notes?.trim() || '',
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export function tasksForDate(state, dateKey) {
  const weight = { high: 0, medium: 1, low: 2 };
  return state.tasks
    .filter((task) => task.date === dateKey)
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.time || '99:99').localeCompare(b.time || '99:99') || weight[a.priority] - weight[b.priority]);
}

export function toggleTask(state, taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (task) task.done = !task.done;
}

export function deleteTask(state, taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
}
