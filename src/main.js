import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/support.css';
import './styles/responsive.css';
import { translations, localeMap } from './data/translations.js';
import { standardUiTranslations } from './data/standard-ui-translations.js';
import { enhanceLanguageMenus } from './js/ag-language-menu.js';
import { loadState, saveState, createDefaultState, normalizeState, STORAGE_KEY } from './js/storage.js';
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
let importGeneration = 0;
let deferredWebInstallPrompt = null;
let webInstallStatusKey = 'waiting';

const webInstallRequested = new URLSearchParams(window.location.search).get('install') === 'web';
const app = document.querySelector('#app');

const supplementalTranslations = {
  hr: {
    saveError: 'Spremanje nije uspjelo. Promjena nije primijenjena.',
    copyError: 'Kopiranje nije uspjelo.',
    markTaskDone: 'Označi zadatak izvršenim',
    markTaskUndone: 'Označi zadatak neizvršenim',
    webInstallTitle: 'Instaliraj Habit Tracker / Daily Planner',
    webInstallDescription: 'Instaliraj aplikaciju za brzi pristup u zasebnom prozoru. Vaši podaci ostaju lokalno u pregledniku.',
    webInstallAction: 'Instaliraj Web App',
    webInstallContinue: 'Nastavi u pregledniku',
    webInstallWaiting: 'Provjeravam je li instalacija dostupna…',
    webInstallReady: 'Aplikacija je spremna za instalaciju.',
    webInstallInstalling: 'Otvaram instalacijski dijalog…',
    webInstallInstalled: 'Aplikacija je instalirana.',
    webInstallDismissed: 'Instalacija je otkazana. Možete nastaviti koristiti aplikaciju u pregledniku.',
    webInstallUnavailable: 'Automatski dijalog trenutačno nije dostupan. Instalaciju možete pokrenuti i iz izbornika preglednika.',
  },
  en: {
    saveError: 'Saving failed. The change was not applied.',
    copyError: 'Copying failed.',
    markTaskDone: 'Mark task as complete',
    markTaskUndone: 'Mark task as incomplete',
    webInstallTitle: 'Install Habit Tracker / Daily Planner',
    webInstallDescription: 'Install the app for quick access in its own window. Your data stays locally in your browser.',
    webInstallAction: 'Install Web App',
    webInstallContinue: 'Continue in browser',
    webInstallWaiting: 'Checking whether installation is available…',
    webInstallReady: 'The app is ready to install.',
    webInstallInstalling: 'Opening the install dialog…',
    webInstallInstalled: 'The app is installed.',
    webInstallDismissed: 'Installation was dismissed. You can keep using the app in your browser.',
    webInstallUnavailable: 'The automatic install dialog is not available right now. You can also install from your browser menu.',
  },
  de: {
    saveError: 'Speichern fehlgeschlagen. Die Änderung wurde nicht übernommen.',
    copyError: 'Kopieren fehlgeschlagen.',
    markTaskDone: 'Aufgabe als erledigt markieren',
    markTaskUndone: 'Aufgabe als nicht erledigt markieren',
    webInstallTitle: 'Habit Tracker / Daily Planner installieren',
    webInstallDescription: 'Installiere die App für schnellen Zugriff in einem eigenen Fenster. Deine Daten bleiben lokal im Browser.',
    webInstallAction: 'Web-App installieren',
    webInstallContinue: 'Im Browser fortfahren',
    webInstallWaiting: 'Es wird geprüft, ob die Installation verfügbar ist…',
    webInstallReady: 'Die App ist zur Installation bereit.',
    webInstallInstalling: 'Installationsdialog wird geöffnet…',
    webInstallInstalled: 'Die App ist installiert.',
    webInstallDismissed: 'Die Installation wurde abgebrochen. Du kannst die App im Browser weiterverwenden.',
    webInstallUnavailable: 'Der automatische Installationsdialog ist derzeit nicht verfügbar. Die Installation kann auch über das Browsermenü gestartet werden.',
  },
  it: {
    saveError: 'Salvataggio non riuscito. La modifica non è stata applicata.',
    copyError: 'Copia non riuscita.',
    markTaskDone: 'Segna attività come completata',
    markTaskUndone: 'Segna attività come non completata',
    webInstallTitle: 'Installa Habit Tracker / Daily Planner',
    webInstallDescription: 'Installa l\'app per un accesso rapido in una finestra separata. I tuoi dati restano localmente nel browser.',
    webInstallAction: 'Installa Web App',
    webInstallContinue: 'Continua nel browser',
    webInstallWaiting: 'Verifica della disponibilità dell\'installazione…',
    webInstallReady: 'L\'app è pronta per essere installata.',
    webInstallInstalling: 'Apertura della finestra di installazione…',
    webInstallInstalled: 'L\'app è installata.',
    webInstallDismissed: 'Installazione annullata. Puoi continuare a usare l\'app nel browser.',
    webInstallUnavailable: 'La finestra automatica di installazione non è disponibile al momento. Puoi installare anche dal menu del browser.',
  },
  es: {
    saveError: 'No se pudo guardar. El cambio no se aplicó.',
    copyError: 'No se pudo copiar.',
    markTaskDone: 'Marcar tarea como completada',
    markTaskUndone: 'Marcar tarea como no completada',
    webInstallTitle: 'Instalar Habit Tracker / Daily Planner',
    webInstallDescription: 'Instala la app para acceder rápidamente en una ventana independiente. Tus datos permanecen localmente en el navegador.',
    webInstallAction: 'Instalar Web App',
    webInstallContinue: 'Continuar en el navegador',
    webInstallWaiting: 'Comprobando si la instalación está disponible…',
    webInstallReady: 'La app está lista para instalarse.',
    webInstallInstalling: 'Abriendo el diálogo de instalación…',
    webInstallInstalled: 'La app está instalada.',
    webInstallDismissed: 'La instalación se canceló. Puedes seguir usando la app en el navegador.',
    webInstallUnavailable: 'El diálogo automático de instalación no está disponible ahora. También puedes instalar desde el menú del navegador.',
  },
};

function t(key) {
  const language = state.settings.language;
  return translations[language]?.[key]
    ?? supplementalTranslations[language]?.[key]
    ?? standardUiTranslations[language]?.[key]
    ?? translations.en[key]
    ?? supplementalTranslations.en[key]
    ?? standardUiTranslations.en[key]
    ?? key;
}

function locale() { return localeMap[state.settings.language] || 'en-GB'; }

function isWebAppStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function renderWebInstallBanner(statusKey = null) {
  if (!webInstallRequested) return;

  if (statusKey) webInstallStatusKey = statusKey;
  if (isWebAppStandalone()) webInstallStatusKey = 'installed';

  let banner = document.querySelector('#webInstallBanner');
  if (!banner) {
    banner = document.createElement('aside');
    banner.id = 'webInstallBanner';
    banner.className = 'web-install-banner card';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-live', 'polite');
    document.body.appendChild(banner);
  }

  const statusTranslationKey = `webInstall${webInstallStatusKey.charAt(0).toUpperCase() + webInstallStatusKey.slice(1)}`;
  banner.innerHTML = `
    <div class="web-install-heading">
      <div class="web-install-icon" aria-hidden="true">✓</div>
      <div>
        <strong>${t('webInstallTitle')}</strong>
        <p>${t('webInstallDescription')}</p>
      </div>
    </div>
    <p class="web-install-status">${t(statusTranslationKey)}</p>
    <div class="web-install-actions">
      <button class="primary-button" id="installWebAppButton" type="button">${t('webInstallAction')}</button>
      <button class="secondary-button" id="continueWebButton" type="button">${t('webInstallContinue')}</button>
    </div>
  `;

  const installButton = banner.querySelector('#installWebAppButton');
  installButton.disabled = !deferredWebInstallPrompt || isWebAppStandalone();
  banner.querySelector('#continueWebButton')?.addEventListener('click', continueInBrowser);
  installButton.addEventListener('click', installWebApplication);
}

async function installWebApplication() {
  if (isWebAppStandalone()) {
    renderWebInstallBanner('installed');
    return;
  }

  if (!deferredWebInstallPrompt) {
    renderWebInstallBanner('unavailable');
    return;
  }

  renderWebInstallBanner('installing');
  deferredWebInstallPrompt.prompt();
  const choice = await deferredWebInstallPrompt.userChoice;
  deferredWebInstallPrompt = null;

  renderWebInstallBanner(choice.outcome === 'accepted' ? 'installing' : 'dismissed');
}

function continueInBrowser() {
  document.querySelector('#webInstallBanner')?.remove();
  const url = new URL(window.location.href);
  url.searchParams.delete('install');
  history.replaceState({}, '', url);
}

function cloneState(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function saveCurrentState(value = state) {
  try {
    saveState(value);
    return true;
  } catch {
    return false;
  }
}

function captureTransientUi() {
  const forms = [...document.querySelectorAll('form[id]')].map((form) => ({
    id: form.id,
    fields: [...form.elements].map((element, index) => ({
      index,
      type: element.type,
      value: element.type === 'file' ? '' : element.value,
      checked: 'checked' in element ? element.checked : undefined,
    })),
  }));

  const active = document.activeElement;
  let focus = null;
  if (active?.form?.id) {
    focus = {
      kind: 'form',
      formId: active.form.id,
      index: [...active.form.elements].indexOf(active),
    };
  } else if (active?.id) {
    focus = { kind: 'id', id: active.id };
  } else if (active?.dataset?.taskToggle) {
    focus = { kind: 'taskToggle', value: active.dataset.taskToggle };
  } else if (active?.dataset?.habitToggle) {
    focus = { kind: 'habitToggle', value: active.dataset.habitToggle };
  }

  return { forms, focus };
}

function restoreTransientUi(snapshot) {
  if (!snapshot) return;

  for (const savedForm of snapshot.forms) {
    const form = document.querySelector(`#${savedForm.id}`);
    if (!form) continue;
    const elements = [...form.elements];
    for (const saved of savedForm.fields) {
      const element = elements[saved.index];
      if (!element || element.type === 'file') continue;
      if (saved.type === 'checkbox' || saved.type === 'radio') element.checked = Boolean(saved.checked);
      else element.value = saved.value;
    }
    if (savedForm.id === 'habitForm') updateDayPresetState(form);
  }

  const focus = snapshot.focus;
  if (!focus) return;
  let target = null;
  if (focus.kind === 'form') {
    const form = document.querySelector(`#${focus.formId}`);
    target = form ? [...form.elements][focus.index] : null;
  } else if (focus.kind === 'id') {
    target = document.getElementById(focus.id);
  } else if (focus.kind === 'taskToggle') {
    target = document.querySelector(`[data-task-toggle="${focus.value}"]`);
  } else if (focus.kind === 'habitToggle') {
    target = document.querySelector(`[data-habit-toggle="${focus.value}"]`);
  }
  target?.focus();
}

function commitMutation(mutator, { message = null, preserveTransient = false } = {}) {
  const transient = captureTransientUi();
  state = loadState();
  const previous = cloneState(state);

  mutator();

  if (!saveCurrentState()) {
    state = previous;
    render();
    restoreTransientUi(transient);
    showToast(t('saveError'), true);
    return false;
  }

  render();
  if (preserveTransient) restoreTransientUi(transient);
  if (message) showToast(t(message));
  return true;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[char]);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the legacy best-effort copy path.
    }
  }

  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();

  try {
    return document.execCommand('copy') === true;
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

function render({ preserveTransient = false } = {}) {
  const transient = preserveTransient ? captureTransientUi() : null;

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
          <div title="${t('language')}">
            <select id="languageSelect" data-ag-language-menu aria-label="${t('language')}">
              ${[['hr','Hrvatski'],['en','English'],['de','Deutsch'],['it','Italiano'],['es','Español']].map(([value,label]) => `<option value="${value}" ${state.settings.language === value ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>
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

      <nav class="tabs" aria-label="${t('primaryNavigation')}">
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
  enhanceLanguageMenus(app);
  if (webInstallRequested) renderWebInstallBanner();
  if (transient) restoreTransientUi(transient);
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
  return `<button class="habit-row ${done ? 'done' : ''}" data-habit-toggle="${escapeHtml(habit.id)}" aria-pressed="${done}">
    <span class="habit-emoji">${escapeHtml(habit.emoji)}</span>
    <span class="habit-name">${escapeHtml(habit.name)}</span>
    <span class="habit-check">${done ? '✓' : ''}</span>
  </button>`;
}

function taskRow(task) {
  const actionLabel = task.done ? t('markTaskUndone') : t('markTaskDone');
  return `<div class="task-row ${task.done ? 'done' : ''}">
    <button class="task-check" data-task-toggle="${escapeHtml(task.id)}" aria-label="${escapeHtml(`${actionLabel}: ${task.title}`)}" aria-pressed="${task.done}">${task.done ? '✓' : ''}</button>
    <div class="task-copy"><strong>${escapeHtml(task.title)}</strong><div class="task-meta">${task.time ? `<span>🕒 ${escapeHtml(task.time)}</span>` : ''}<span class="priority ${escapeHtml(task.priority)}">${t(task.priority)}</span></div>${task.notes ? `<p>${escapeHtml(task.notes)}</p>` : ''}</div>
    <button class="icon-button danger ghost" data-task-delete="${escapeHtml(task.id)}" title="${t('delete')}" aria-label="${escapeHtml(`${t('delete')}: ${task.title}`)}">×</button>
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
  return `<div class="manage-row"><div class="manage-emoji">${escapeHtml(habit.emoji)}</div><div class="manage-copy"><strong>${escapeHtml(habit.name)}</strong><div class="weekday-pills">${habit.days.map((day) => `<span>${t(labels[day-1])}</span>`).join('')}</div></div><button class="icon-button danger ghost" data-habit-delete="${escapeHtml(habit.id)}" title="${t('delete')}" aria-label="${escapeHtml(`${t('delete')}: ${habit.name}`)}">×</button></div>`;
}

function plannerView() {
  const tasks = tasksForDate(state, selectedDate);
  return `<section class="content-grid planner-page">
    <article class="card panel form-panel">
      <div class="section-heading"><div><h2>${t('addTask')}</h2></div></div>
      <form id="taskForm" class="stack-form">
        <label>${t('taskTitle')}<input name="title" maxlength="100" autocomplete="off" required /></label>
        <div class="two-cols"><label>${t('taskDate')}<input name="date" type="date" min="0001-01-01" value="${selectedDate}" required /></label><label>${t('time')}<input name="time" type="time" /></label></div>
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

  document.querySelector('#languageSelect')?.addEventListener('change', (event) => {
    const language = event.target.value;
    commitMutation(() => { state.settings.language = language; }, { preserveTransient: true });
  });
  document.querySelector('#themeSelect')?.addEventListener('change', (event) => {
    const theme = event.target.value;
    commitMutation(() => { state.settings.theme = theme; }, { preserveTransient: true });
  });
  document.querySelector('#settingsButton')?.addEventListener('click', showSettingsModal);
  document.querySelector('#infoButton')?.addEventListener('click', showInfoModal);
  document.querySelector('#footerInfo')?.addEventListener('click', showInfoModal);

  document.querySelectorAll('[data-habit-toggle]').forEach((el) => el.addEventListener('click', () => {
    commitMutation(() => toggleHabit(state, el.dataset.habitToggle, selectedDate), { preserveTransient: true });
  }));
  document.querySelectorAll('[data-task-toggle]').forEach((el) => el.addEventListener('click', () => {
    commitMutation(() => toggleTask(state, el.dataset.taskToggle), { preserveTransient: true });
  }));
  document.querySelectorAll('[data-task-delete]').forEach((el) => el.addEventListener('click', () => {
    commitMutation(() => deleteTask(state, el.dataset.taskDelete), { message: 'taskDeleted', preserveTransient: true });
  }));
  document.querySelectorAll('[data-habit-delete]').forEach((el) => el.addEventListener('click', () => {
    commitMutation(() => deleteHabit(state, el.dataset.habitDelete), { message: 'habitDeleted', preserveTransient: true });
  }));

  bindHabitForm();
  bindTaskForm();
}

const DAY_PRESETS = {
  daily: [1,2,3,4,5,6,7],
  weekdays: [1,2,3,4,5],
  weekends: [6,7],
};

function updateDayPresetState(form) {
  const selected = [...form.querySelectorAll('[name="days"]:checked')].map((box) => Number(box.value)).sort((a, b) => a - b);
  form.querySelectorAll('[data-day-preset]').forEach((button) => {
    const preset = DAY_PRESETS[button.dataset.dayPreset] || [];
    const active = selected.length === preset.length && selected.every((value, index) => value === preset[index]);
    button.classList.toggle('active', active);
  });
}

function bindHabitForm() {
  const form = document.querySelector('#habitForm');
  if (!form) return;

  form.querySelectorAll('[data-day-preset]').forEach((button) => button.addEventListener('click', () => {
    const selected = DAY_PRESETS[button.dataset.dayPreset] || [];
    form.querySelectorAll('[name="days"]').forEach((box) => { box.checked = selected.includes(Number(box.value)); });
    updateDayPresetState(form);
  }));

  form.querySelectorAll('[name="days"]').forEach((box) => box.addEventListener('change', () => updateDayPresetState(form)));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const days = fd.getAll('days').map(Number);
    const error = form.querySelector('#habitError');
    if (!name) { error.textContent = t('required'); return; }
    if (!days.length) { error.textContent = t('selectedDaysRequired'); return; }

    commitMutation(
      () => state.habits.push(createHabit({ name, emoji: fd.get('emoji'), days })),
      { message: 'habitAdded' },
    );
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

    const transient = captureTransientUi();
    state = loadState();
    const previous = cloneState(state);
    const date = String(fd.get('date'));

    state.tasks.push(createTask({
      title,
      date,
      time: fd.get('time'),
      priority: fd.get('priority'),
      notes: fd.get('notes'),
    }));

    if (!saveCurrentState()) {
      state = previous;
      render();
      restoreTransientUi(transient);
      showToast(t('saveError'), true);
      return;
    }

    selectedDate = date;
    render();
    showToast(t('taskAdded'));
  });
}

function createModalController(root, opener, initialFocusSelector, onClose) {
  const shell = app.querySelector('.app-shell');
  const dialog = root.querySelector('[role="dialog"]');
  let closed = false;

  shell?.setAttribute('inert', '');

  const getFocusable = () => dialog
    ? [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.offsetParent !== null)
    : [];

  const close = () => {
    if (closed) return;
    closed = true;
    onClose?.();
    root.removeEventListener('keydown', onKeyDown);
    shell?.removeAttribute('inert');
    root.innerHTML = '';
    if (opener?.isConnected) opener.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  root.addEventListener('keydown', onKeyDown);
  queueMicrotask(() => root.querySelector(initialFocusSelector)?.focus());

  return close;
}

function showInfoModal() {
  const root = document.querySelector('#modalRoot');
  const opener = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop" id="modalBackdrop"><section class="modal card" role="dialog" aria-modal="true" aria-labelledby="infoTitle">
    <div class="modal-header"><div><div class="eyebrow">Apps & Games</div><h2 id="infoTitle">${t('info')}</h2></div><button class="icon-button ghost" id="closeModal" aria-label="${t('close')}">×</button></div>
    <div class="info-grid">
      <div class="info-block"><span>✓</span><div><h3>${t('aboutTitle')}</h3><p>${t('aboutText')}</p><a class="info-link" href="https://appsandgames.org/" target="_blank" rel="noopener noreferrer">${t('visitPortal')} ↗</a></div></div>
      <div class="info-block"><span>★</span><div><h3>${t('featuresTitle')}</h3><ul class="info-features"><li>${t('featureHabits')}</li><li>${t('featurePlanner')}</li><li>${t('featureStats')}</li><li>${t('featureBackup')}</li></ul></div></div>
      <div class="info-block"><span>🌐</span><div><h3>${t('languageNoteTitle')}</h3><p>${t('languageNoteText')}</p></div></div>
      <div class="info-block"><span>🔒</span><div><h3>${t('privacyTitle')}</h3><p>${t('privacyText')}</p></div></div>
      <div class="info-block"><span>⬇</span><div><h3>${t('installTitle')}</h3><p>${t('installText')}</p></div></div>
    </div>
    ${renderSupportSection(t)}
    <div class="modal-footer"><span>${t('version')} 1.0.0</span><button class="primary-button" id="closeModalBottom">${t('close')}</button></div>
  </section></div>`;

  const close = createModalController(root, opener, '#closeModal');
  root.querySelector('#closeModal')?.addEventListener('click', close);
  root.querySelector('#closeModalBottom')?.addEventListener('click', close);
  root.querySelector('#modalBackdrop')?.addEventListener('click', (event) => { if (event.target.id === 'modalBackdrop') close(); });
  root.querySelectorAll('[data-copy-address]').forEach((button) => button.addEventListener('click', async () => {
    const copied = await copyText(button.dataset.copyAddress || '');
    showToast(t(copied ? 'copied' : 'copyError'), !copied);
  }));
}

function showSettingsModal() {
  const root = document.querySelector('#modalRoot');
  const opener = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop" id="settingsBackdrop"><section class="modal card settings-modal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
    <div class="modal-header"><div><div class="eyebrow">Apps & Games</div><h2 id="settingsTitle">⚙ ${t('settings')}</h2></div><button class="icon-button ghost" id="closeSettings" aria-label="${t('close')}">×</button></div>

    <section class="settings-section">
      <h3>${t('dataTools')}</h3>
      <p>${t('backupDescription')}</p>
      <div class="button-row settings-actions">
        <button class="secondary-button" id="exportButton" type="button">↓ ${t('exportData')}</button>
        <button class="secondary-button file-button" id="importButton" type="button">↑ ${t('importData')}</button>
        <input id="importInput" type="file" accept="application/json,.json" hidden>
      </div>
    </section>

    <section class="settings-section danger-zone">
      <h3>${t('dangerZone')}</h3>
      <p>${t('dangerZoneText')}</p>
      <button class="danger-button" id="resetButton">× ${t('resetData')}</button>
    </section>

    <div class="modal-footer"><span>🔒 ${t('localOnly')}</span><button class="primary-button" id="closeSettingsBottom">${t('close')}</button></div>
  </section></div>`;

  const close = createModalController(root, opener, '#closeSettings', () => { importGeneration += 1; });
  root.querySelector('#closeSettings')?.addEventListener('click', close);
  root.querySelector('#closeSettingsBottom')?.addEventListener('click', close);
  root.querySelector('#settingsBackdrop')?.addEventListener('click', (event) => { if (event.target.id === 'settingsBackdrop') close(); });
  root.querySelector('#exportButton')?.addEventListener('click', () => { exportBackup(state); showToast(t('exported')); });
  root.querySelector('#importButton')?.addEventListener('click', () => root.querySelector('#importInput')?.click());

  root.querySelector('#importInput')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const generation = ++importGeneration;

    try {
      const imported = await importBackup(file);
      if (generation !== importGeneration) return;
      if (!saveCurrentState(imported)) {
        showToast(t('saveError'), true);
        return;
      }
      state = imported;
      close();
      render();
      showToast(t('imported'));
    } catch {
      if (generation === importGeneration) showToast(t('importError'), true);
    }
  });

  root.querySelector('#resetButton')?.addEventListener('click', () => {
    if (!window.confirm(t('resetConfirm'))) return;
    importGeneration += 1;

    const nextState = createDefaultState();
    nextState.settings = { ...state.settings };
    if (!saveCurrentState(nextState)) {
      showToast(t('saveError'), true);
      return;
    }

    state = nextState;
    applyTheme(state.settings.theme);
    close();
    render();
    showToast(t('clearDone'));
  });
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

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  importGeneration += 1;

  try {
    state = event.newValue ? normalizeState(JSON.parse(event.newValue)) : createDefaultState();
  } catch {
    state = loadState();
  }

  render({ preserveTransient: true });
});

if (webInstallRequested) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredWebInstallPrompt = event;
    renderWebInstallBanner('ready');
  });

  window.addEventListener('appinstalled', () => {
    deferredWebInstallPrompt = null;
    renderWebInstallBanner('installed');
  });

  window.setTimeout(() => {
    if (!deferredWebInstallPrompt && !isWebAppStandalone()) {
      renderWebInstallBanner('unavailable');
    }
  }, 3000);
}

watchSystemTheme(() => state.settings.theme);
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
