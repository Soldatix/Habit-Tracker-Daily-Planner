import { dayCompletion } from './habits.js';
import { tasksForDate } from './planner.js';
import { lastNDays } from './dates.js';

export function getSevenDayStats(state, endDateKey) {
  const days = lastNDays(endDateKey, 7).map((dateKey) => {
    const habits = dayCompletion(state, dateKey);
    const tasks = tasksForDate(state, dateKey);
    const taskCompleted = tasks.filter((task) => task.done).length;
    const scheduled = habits.scheduled + tasks.length;
    const completed = habits.completed + taskCompleted;

    return {
      dateKey,
      habitScheduled: habits.scheduled,
      habitCompleted: habits.completed,
      taskScheduled: tasks.length,
      taskCompleted,
      scheduled,
      completed,
      rate: scheduled ? completed / scheduled : 0,
      hasPlan: scheduled > 0,
    };
  });

  const totalHabitScheduled = days.reduce((sum, day) => sum + day.habitScheduled, 0);
  const totalHabitCompleted = days.reduce((sum, day) => sum + day.habitCompleted, 0);
  const totalTaskScheduled = days.reduce((sum, day) => sum + day.taskScheduled, 0);
  const totalTaskCompleted = days.reduce((sum, day) => sum + day.taskCompleted, 0);
  const totalScheduled = totalHabitScheduled + totalTaskScheduled;
  const totalCompleted = totalHabitCompleted + totalTaskCompleted;

  const bestDay = days.reduce((winner, day) => {
    if (!day.hasPlan) return winner;
    if (!winner || day.rate > winner.rate || (day.rate === winner.rate && day.completed > winner.completed)) return day;
    return winner;
  }, null);

  return {
    days,
    totalHabitScheduled,
    totalHabitCompleted,
    totalTaskScheduled,
    totalTaskCompleted,
    totalScheduled,
    totalCompleted,
    rate: totalScheduled ? totalCompleted / totalScheduled : 0,
    bestDay,
  };
}
