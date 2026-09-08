import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/support.css';
import './styles/responsive.css';
import { translations, localeMap } from './data/translations.js';
import { loadState, saveState, clearState, createDefaultState } from './js/storage.js';
import { applyTheme, watchSystemTheme } from './js/theme.js';
import { toDateKey, shiftDate, formatDate, fromDateKey } from './js/dates.js';
import { createHabit, habitsForDate, isHabitDone, toggleHabit, deleteHabit, dayCompletion, calculateBestStreak } from './js/habits.js';
import { createTask, tasksForDate, toggleTask, deleteTask } from './js/planner.js';
import { exportBackup, importBackup } from './js/backup.js';
import { getSevenDayStats } from './js/stats.js';
import { renderSupportSection } from './js/support.js';

let state = loadState();
let selectedDate = toDateKey(new Date());
let activeTab = 'today';
let toastTimer;

const app = document.querySelector('#app');

function t(key) { return translations[state.settings.language]?.[key] ?? translations.en[key] ?? key; }
function locale() { return localeMap[state.settings.language] || 'en-GB'; }
function persist() { saveState(state); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function render() {
  document.documentElement.lang = state.settings.language;
  document.title = `${t('appName')} | Apps & Games`;
  applyTheme(state.settings.theme);

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-wrap">
          <div class="brand-mark" aria-hidden="true">✓</div>
          <div>
            <div class="eyebrow">Apps & Games</div>
            <h1>${t('appName')}</h1>
            <p>${t('tagline')}</p>
          </div>
        </div>
        <div class="top-actions">
          <label class="compact-control" title="${t('language')}">
            <span aria-hidden="true">🌐</span>
            <select id="languageSelect" aria-label="${t('language')}">
              ${[['hr','HR'],['en','EN'],['de','DE'],['it','IT'],['es','ES']].map(([value,label]) => `<option value="${value}" ${state.settings.language === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </label>
          <label class="compact-control" title="${t('theme')}">
            <span aria-hidden="true">◐</span>
            <select id="themeSelect" aria-label="${t('theme')}">
              <option value="system" ${state.settings.theme === 'system' ? 'selected' : ''}>${t('system')}</option>
              <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>${t('light')}</option>
              <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>${t('dark')}</option>
            </select>
          </label>
          <button class="icon-button" id="settingsButton" aria-label="${t('settings')}" title="${t('settings')}">⚙</button>
          <button class="icon-button" id="infoButton" aria-label="${t('info')}" title="${t('info')}">i</button>
        </div>
      </header>

      <nav class="tabs" aria-label="Primary">
        ${tabButton('today', '⌂', t('today'))}
        ${tabButton('habits', '✓', t('habits'))}
        ${tabButton('planner', '☷', t('planner'))}
        ${tabButton('stats', '▥', t('stats'))}
      </nav>

      <main>
        ${dateNavigator()}
        ${activeTab === 'today' ? todayView() : ''}
        ${activeTab === 'habits' ? habitsView() : ''}
        ${activeTab === 'planner' ? plannerView() : ''}
        ${activeTab === 'stats' ? statsView() : ''}
      </main>

      <footer>
        <span>Apps & Games · ${t('version')} 1.0.0</span>
        <span>•</span><span>🔒 ${t('localOnly')}</span>
        <span>•</span><button class="link-button" id="footerInfo">${t('info')}</button>
      </footer>
    </div>
    <div id="modalRoot"></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;
  bindEvents();
}

function tabButton(id, icon, label) {
  return `<button class="tab ${activeTab === id ? 'active' : ''}" data-tab="${id}" aria-current="${activeTab === id ? 'page' : 'false'}"><span>${icon}</span><span>${label}</span></button>`;
}

function dateNavigator() {
  return `<section class="date-bar card soft-card">
    <button class="icon-button subtle" data-shift-date="-1" aria-label="${t('previousDay')}">‹</button>
    <button class="date-label" id="dateLabel" title="${t('goToday')}">
      <span>${escapeHtml(formatDate(selectedDate, locale()))}</span>
      ${selectedDate === toDateKey(new Date()) ? `<small>${t('today')}</small>` : ''}
    </button>
    <button class="icon-button subtle" data-shift-date="1" aria-label="${t('nextDay')}">›</button>
  </section>`;
}

function summaryCards() {
  const habitProgress = dayCompletion(state, selectedDate);
  const tasks = tasksForDate(state, selectedDate);
  const taskDone = tasks.filter((task) => task.done).length;
  const streak = calculateBestStreak(state, selectedDate);
  return `<section class="summary-grid">
    ${metricCard('✓', `${habitProgress.completed}/${habitProgress.scheduled}`, t('habitsDone'), habitProgress.rate)}
    ${metricCard('☷', `${taskDone}/${tasks.length}`, t('tasksDone'), tasks.length ? taskDone / tasks.length : 0)}
    ${metricCard('🔥', `${streak}`, `${t('currentStreak')} · ${t('days')}`, Math.min(streak / 14, 1))}
  </section>`;
}

function metricCard(icon, value, label, progress) {
  const pct = Math.round(progress * 100);
  return `<article class="metric card">
    <div class="metric-icon">${icon}</div>
    <div class="metric-copy"><strong>${value}</strong><span>${label}</span></div>
    <div class="mini-progress" aria-label="${pct}%"><i style="width:${pct}%"></i></div>
  </article>`;
}

function todayView() {
  const habits = habitsForDate(state, selectedDate);
  const tasks = tasksForDate(state, selectedDate);
  const allPlanned = habits.length + tasks.length;
  const allDone = habits.filter((h) => isHabitDone(state, h.id, selectedDate)).length + tasks.filter((task) => task.done).length;
  return `
    ${summaryCards()}
    ${allPlanned > 0 && allDone === allPlanned ? `<div class="success-banner">✨ ${t('allDone')}</div>` : ''}
    <section class="content-grid">
      <article class="card panel">
        <div class="section-heading"><div><h2>${t('todayHabits')}</h2><p>${t('progressHint')}</p></div><button class="small-button" data-tab-jump="habits">+ ${t('addHabit')}</button></div>
        <div class="habit-list">${habits.length ? habits.map(habitRow).join('') : emptyState('◎', t('noHabitsToday'), t('addFirstHabit'), 'habits')}</div>
      </article>
      <article class="card panel">
        <div class="section-heading"><div><h2>${t('todayTasks')}</h2></div><button class="small-button" data-tab-jump="planner">+ ${t('addTask')}</button></div>
        <div class="task-list">${tasks.length ? tasks.map(taskRow).join('') : emptyState('☷', t('noTasksToday'), t('addFirstTask'), 'planner')}</div>
      </article>
    </section>`;
}

function habitRow(habit) {
  const done = isHabitDone(state, habit.id, selectedDate);
  return `<button class="habit-row ${done ? 'done' : ''}" data-habit-toggle="${habit.id}" aria-pressed="${done}">
    <span class="habit-emoji">${escapeHtml(habit.emoji)}</span>
    <span class="habit-name">${escapeHtml(habit.name)}</span>
    <span class="habit-check">${done ? '✓' : ''}</span>
  </button>`;
}

function taskRow(task) {
  return `<div class="task-row ${task.done ? 'done' : ''}">
    <button class="task-check" data-task-toggle="${task.id}" aria-label="${task.done ? t('cancel') : t('save')}" aria-pressed="${task.done}">${task.done ? '✓' : ''}</button>
    <div class="task-copy"><strong>${escapeHtml(task.title)}</strong><div class="task-meta">${task.time ? `<span>🕒 ${escapeHtml(task.time)}</span>` : ''}<span class="priority ${task.priority}">${t(task.priority)}</span></div>${task.notes ? `<p>${escapeHtml(task.notes)}</p>` : ''}</div>
    <button class="icon-button danger ghost" data-task-delete="${task.id}" title="${t('delete')}" aria-label="${t('delete')}">×</button>
  </div>`;
}

function emptyState(icon, message, action, target) {
  return `<div class="empty-state"><div>${icon}</div><p>${message}</p><button class="small-button" data-tab-jump="${target}">${action}</button></div>`;
}

function habitsView() {
  const dayLabels = ['mon','tue','wed','thu','fri','sat','sun'];
  return `<section class="content-grid habits-page">
    <article class="card panel form-panel">
      <div class="section-heading"><div><h2>${t('addHabit')}</h2></div></div>
      <form id="habitForm" class="stack-form">
        <label>${t('habitName')}<input name="name" maxlength="60" autocomplete="off" placeholder="${t('habitName')}" required /></label>
        <label>${t('emoji')}<input name="emoji" maxlength="4" value="✓" class="emoji-input" /></label>
        <fieldset><legend>${t('schedule')}</legend>
          <div class="preset-buttons">
            <button type="button" class="chip active" data-day-preset="daily">${t('everyDay')}</button>
            <button type="button" class="chip" data-day-preset="weekdays">${t('weekdays')}</button>
            <button type="button" class="chip" data-day-preset="weekends">${t('weekends')}</button>
          </div>
          <div class="day-picker">${dayLabels.map((key,index) => `<label><input type="checkbox" name="days" value="${index+1}" checked><span>${t(key)}</span></label>`).join('')}</div>
        </fieldset>
        <p class="form-error" id="habitError" aria-live="polite"></p>
        <button class="primary-button" type="submit">+ ${t('addHabit')}</button>
      </form>
    </article>
    <article class="card panel">
      <div class="section-heading"><div><h2>${t('activeHabits')}</h2><p>${state.habits.length}</p></div></div>
      <div class="manage-list">${state.habits.length ? state.habits.map(habitManageRow).join('') : emptyState('◎', t('noHabitsToday'), t('addHabit'), 'habits')}</div>
    </article>
  </section>`;
}

function habitManageRow(habit) {
  const labels = ['mon','tue','wed','thu','fri','sat','sun'];
  return `<div class="manage-row"><div class="manage-emoji">${escapeHtml(habit.emoji)}</div><div class="manage-copy"><strong>${escapeHtml(habit.name)}</strong><div class="weekday-pills">${habit.days.map((day) => `<span>${t(labels[day-1])}</span>`).join('')}</div></div><button class="icon-button danger ghost" data-habit-delete="${habit.id}" title="${t('delete')}" aria-label="${t('delete')}">×</button></div>`;
}

function plannerView() {
  const tasks = tasksForDate(state, selectedDate);
  return `<section class="content-grid planner-page">
    <article class="card panel form-panel">
      <div class="section-heading"><div><h2>${t('addTask')}</h2></div></div>
      <form id="taskForm" class="stack-form">
        <label>${t('taskTitle')}<input name="title" maxlength="100" autocomplete="off" required /></label>
        <div class="two-cols"><label>${t('taskDate')}<input name="date" type="date" value="${selectedDate}" required /></label><label>${t('time')}<input name="time" type="time" /></label></div>
        <label>${t('priority')}<select name="priority"><option value="medium">${t('medium')}</option><option value="high">${t('high')}</option><option value="low">${t('low')}</option></select></label>
        <label>${t('notes')}<textarea name="notes" maxlength="300" rows="3"></textarea></label>
        <p class="form-error" id="taskError" aria-live="polite"></p>
        <button class="primary-button" type="submit">+ ${t('addTask')}</button>
      </form>
    </article>
    <article class="card panel">
      <div class="section-heading"><div><h2>${t('plannerFor')}</h2><p>${escapeHtml(formatDate(selectedDate, locale()))}</p></div></div>
      <div class="task-list large">${tasks.length ? tasks.map(taskRow).join('') : emptyState('☷', t('noTasks'), t('addTask'), 'planner')}</div>
    </article>
  </section>`;
}

function statsView() {
  const stats = getSevenDayStats(state, selectedDate);
  const dateFmt = new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric' });
  const bestLabel = stats.bestDay ? dateFmt.format(fromDateKey(stats.bestDay.dateKey)) : '—';
  return `<section class="stats-page">
    <div class="section-title"><h2>${t('last7Days')}</h2></div>
    <section class="summary-grid stats-summary">
      ${metricCard('◎', `${Math.round(stats.rate * 100)}%`, t('overallCompletion'), stats.rate)}
      ${metricCard('✓', `${stats.totalHabitCompleted}/${stats.totalHabitScheduled}`, t('habitsDone'), stats.totalHabitScheduled ? stats.totalHabitCompleted / stats.totalHabitScheduled : 0)}
      ${metricCard('☷', `${stats.totalTaskCompleted}/${stats.totalTaskScheduled}`, t('tasksDone'), stats.totalTaskScheduled ? stats.totalTaskCompleted / stats.totalTaskScheduled : 0)}
      ${metricCard('★', bestLabel, t('bestDay'), stats.bestDay?.rate || 0)}
    </section>
    <article class="card panel chart-card">
      <div class="section-heading"><div><h2>${t('dailyCompletion')}</h2></div></div>
      ${stats.totalScheduled ? `<div class="bar-chart">${stats.days.map((day) => `<div class="bar-column"><div class="bar-track"><i style="height:${day.hasPlan ? Math.round(day.rate * 100) : 0}%"></i></div><strong>${day.hasPlan ? `${Math.round(day.rate * 100)}%` : '—'}</strong><span>${escapeHtml(dateFmt.format(fromDateKey(day.dateKey)))}</span></div>`).join('')}</div>` : `<div class="empty-state"><div>▥</div><p>${t('emptyStats')}</p></div>`}
    </article>
  </section>`;
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((el) => el.addEventListener('click', () => { activeTab = el.dataset.tab; render(); }));
  document.querySelectorAll('[data-tab-jump]').forEach((el) => el.addEventListener('click', () => { activeTab = el.dataset.tabJump; render(); }));
  document.querySelectorAll('[data-shift-date]').forEach((el) => el.addEventListener('click', () => { selectedDate = shiftDate(selectedDate, Number(el.dataset.shiftDate)); render(); }));
  document.querySelector('#dateLabel')?.addEventListener('click', () => { selectedDate = toDateKey(new Date()); render(); });

  document.querySelector('#languageSelect')?.addEventListener('change', (event) => { state.settings.language = event.target.value; persist(); render(); });
  document.querySelector('#themeSelect')?.addEventListener('change', (event) => { state.settings.theme = event.target.value; persist(); render(); });
  document.querySelector('#settingsButton')?.addEventListener('click', showSettingsModal);
  document.querySelector('#infoButton')?.addEventListener('click', showInfoModal);
  document.querySelector('#footerInfo')?.addEventListener('click', showInfoModal);

  document.querySelectorAll('[data-habit-toggle]').forEach((el) => el.addEventListener('click', () => { toggleHabit(state, el.dataset.habitToggle, selectedDate); persist(); render(); }));
  document.querySelectorAll('[data-task-toggle]').forEach((el) => el.addEventListener('click', () => { toggleTask(state, el.dataset.taskToggle); persist(); render(); }));
  document.querySelectorAll('[data-task-delete]').forEach((el) => el.addEventListener('click', () => { deleteTask(state, el.dataset.taskDelete); persist(); render(); showToast(t('taskDeleted')); }));
  document.querySelectorAll('[data-habit-delete]').forEach((el) => el.addEventListener('click', () => { deleteHabit(state, el.dataset.habitDelete); persist(); render(); showToast(t('habitDeleted')); }));

  bindHabitForm();
  bindTaskForm();
}

function bindHabitForm() {
  const form = document.querySelector('#habitForm');
  if (!form) return;
  form.querySelectorAll('[data-day-preset]').forEach((button) => button.addEventListener('click', () => {
    const presets = { daily: [1,2,3,4,5,6,7], weekdays: [1,2,3,4,5], weekends: [6,7] };
    const selected = presets[button.dataset.dayPreset];
    form.querySelectorAll('[name="days"]').forEach((box) => { box.checked = selected.includes(Number(box.value)); });
    form.querySelectorAll('[data-day-preset]').forEach((item) => item.classList.toggle('active', item === button));
  }));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const days = fd.getAll('days').map(Number);
    const error = form.querySelector('#habitError');
    if (!name) { error.textContent = t('required'); return; }
    if (!days.length) { error.textContent = t('selectedDaysRequired'); return; }
    state.habits.push(createHabit({ name, emoji: fd.get('emoji'), days }));
    persist();
    render();
    showToast(t('habitAdded'));
  });
}

function bindTaskForm() {
  const form = document.querySelector('#taskForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const title = String(fd.get('title') || '').trim();
    if (!title) { form.querySelector('#taskError').textContent = t('required'); return; }
    state.tasks.push(createTask({ title, date: fd.get('date'), time: fd.get('time'), priority: fd.get('priority'), notes: fd.get('notes') }));
    selectedDate = String(fd.get('date'));
    persist();
    render();
    showToast(t('taskAdded'));
  });
}

function showInfoModal() {
  const root = document.querySelector('#modalRoot');
  root.innerHTML = `<div class="modal-backdrop" id="modalBackdrop"><section class="modal card" role="dialog" aria-modal="true" aria-labelledby="infoTitle">
    <div class="modal-header"><div><div class="eyebrow">Apps & Games</div><h2 id="infoTitle">${t('info')}</h2></div><button class="icon-button ghost" id="closeModal" aria-label="${t('close')}">×</button></div>
    <div class="info-grid">
      <div class="info-block"><span>✓</span><div><h3>${t('aboutTitle')}</h3><p>${t('aboutText')}</p></div></div>
      <div class="info-block"><span>🌐</span><div><h3>${t('languageNoteTitle')}</h3><p>${t('languageNoteText')}</p></div></div>
      <div class="info-block"><span>🔒</span><div><h3>${t('privacyTitle')}</h3><p>${t('privacyText')}</p></div></div>
      <div class="info-block"><span>⬇</span><div><h3>${t('installTitle')}</h3><p>${t('installText')}</p></div></div>
    </div>
    ${renderSupportSection(t)}
    <div class="modal-footer"><span>${t('version')} 1.0.0</span><button class="primary-button" id="closeModalBottom">${t('close')}</button></div>
  </section></div>`;
  const close = () => { root.innerHTML = ''; };
  root.querySelector('#closeModal')?.addEventListener('click', close);
  root.querySelector('#closeModalBottom')?.addEventListener('click', close);
  root.querySelector('#modalBackdrop')?.addEventListener('click', (event) => { if (event.target.id === 'modalBackdrop') close(); });
  root.querySelectorAll('[data-copy-address]').forEach((button) => button.addEventListener('click', async () => {
    await copyText(button.dataset.copyAddress || '');
    showToast(t('copied'));
  }));
  root.querySelector('#closeModal')?.focus();
}

function showSettingsModal() {
  const root = document.querySelector('#modalRoot');
  root.innerHTML = `<div class="modal-backdrop" id="settingsBackdrop"><section class="modal card settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
    <div class="modal-header"><div><div class="eyebrow">Apps & Games</div><h2 id="settingsTitle">⚙ ${t('settings')}</h2></div><button class="icon-button ghost" id="closeSettings" aria-label="${t('close')}">×</button></div>

    <section class="settings-section">
      <h3>${t('dataTools')}</h3>
      <p>${t('backupDescription')}</p>
      <div class="button-row settings-actions">
        <button class="secondary-button" id="exportButton">↓ ${t('exportData')}</button>
        <label class="secondary-button file-button">↑ ${t('importData')}<input id="importInput" type="file" accept="application/json,.json" hidden></label>
      </div>
    </section>

    <section class="settings-section danger-zone">
      <h3>${t('dangerZone')}</h3>
      <p>${t('dangerZoneText')}</p>
      <button class="danger-button" id="resetButton">× ${t('resetData')}</button>
    </section>

    <div class="modal-footer"><span>🔒 ${t('localOnly')}</span><button class="primary-button" id="closeSettingsBottom">${t('close')}</button></div>
  </section></div>`;

  const close = () => { root.innerHTML = ''; };
  root.querySelector('#closeSettings')?.addEventListener('click', close);
  root.querySelector('#closeSettingsBottom')?.addEventListener('click', close);
  root.querySelector('#settingsBackdrop')?.addEventListener('click', (event) => { if (event.target.id === 'settingsBackdrop') close(); });
  root.querySelector('#exportButton')?.addEventListener('click', () => { exportBackup(state); showToast(t('exported')); });
  root.querySelector('#importInput')?.addEventListener('change', async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      state = await importBackup(file);
      persist();
      close();
      render();
      showToast(t('imported'));
    } catch { showToast(t('importError'), true); }
  });
  root.querySelector('#resetButton')?.addEventListener('click', () => {
    if (!window.confirm(t('resetConfirm'))) return;
    const settings = { ...state.settings };
    clearState();
    state = createDefaultState();
    state.settings = settings;
    persist();
    applyTheme(state.settings.theme);
    close();
    render();
    showToast(t('clearDone'));
  });
  root.querySelector('#closeSettings')?.focus();
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

watchSystemTheme(() => state.settings.theme, render);
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
