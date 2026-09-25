const LANGUAGE_NAMES = {
  hr: 'Hrvatski',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
};

const FLAGS = {
  hr: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="6.667" fill="#ff0000"/><rect y="6.667" width="30" height="6.666" fill="#fff"/><rect y="13.333" width="30" height="6.667" fill="#171796"/><path d="M12 5.4h6v6.4c0 2.25-1.25 3.65-3 4.45-1.75-.8-3-2.2-3-4.45z" fill="#fff" stroke="#d1182b" stroke-width=".55"/><path d="M12.35 6h1.1v1.1h-1.1zm2.2 0h1.1v1.1h-1.1zm2.2 0h.9v1.1h-.9zm-3.3 1.1h1.1v1.1h-1.1zm2.2 0h1.1v1.1h-1.1zm-3.3 2.2h1.1v1.1h-1.1zm2.2 0h1.1v1.1h-1.1zm2.2 0h.9v1.1h-.9zm-3.3 1.1h1.1v1.1h-1.1zm2.2 0h1.1v1.1h-1.1z" fill="#d1182b"/></svg>',
  en: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/></svg>',
  de: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="6.667" fill="#000"/><rect y="6.667" width="30" height="6.666" fill="#dd0000"/><rect y="13.333" width="30" height="6.667" fill="#ffce00"/></svg>',
  it: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/></svg>',
  es: '<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false"><rect width="30" height="5" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/><rect y="15" width="30" height="5" fill="#aa151b"/><rect x="8" y="7" width="2.1" height="4.5" rx=".25" fill="#aa151b"/><circle cx="9.05" cy="6.7" r="1" fill="#aa151b"/></svg>',
};

let globalHandlersBound = false;

function installStyles() {
  if (document.getElementById('ag-language-menu-styles')) return;
  const style = document.createElement('style');
  style.id = 'ag-language-menu-styles';
  style.textContent = [
    '.ag-language-native{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;padding:0!important;margin:0!important;border:0!important}',
    '.ag-language-menu{position:relative;min-width:0}',
    '.ag-language-button{min-width:148px;height:40px;display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:12px;padding:7px 34px 7px 10px;background:var(--surface);color:var(--text);font:inherit;font-weight:700;cursor:pointer;text-align:left;position:relative;white-space:nowrap;box-shadow:0 4px 12px rgba(34,48,76,.04)}',
    '.ag-language-button:hover{border-color:var(--primary)}',
    '.ag-language-button:focus-visible{outline:3px solid color-mix(in srgb,var(--primary) 35%,transparent);outline-offset:2px}',
    '.ag-language-button .ag-flag,.ag-language-option .ag-flag{width:24px;height:16px;flex:0 0 24px;display:inline-flex;border-radius:2px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.16)}',
    '.ag-language-button .ag-flag svg,.ag-language-option .ag-flag svg{width:100%;height:100%;display:block}',
    '.ag-language-chevron{position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:.72rem;color:var(--muted)}',
    '.ag-language-options{position:absolute;z-index:10000;right:0;top:calc(100% + 5px);min-width:100%;width:max-content;max-width:min(230px,calc(100vw - 20px));background:var(--surface);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow);padding:5px;display:none}',
    '.ag-language-menu.open .ag-language-options{display:grid}',
    '.ag-language-option{min-width:170px;min-height:40px;display:flex;align-items:center;gap:9px;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:var(--text);font:inherit;text-align:left;cursor:pointer}',
    '.ag-language-option:hover,.ag-language-option:focus-visible{outline:none;background:var(--surface-2)}',
    '.ag-language-option:focus-visible{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--primary) 45%,transparent)}',
    '.ag-language-option.selected{background:var(--primary-soft);color:var(--primary);font-weight:750}',
    '@media(max-width:590px){.ag-language-button{min-width:134px;height:36px;padding:6px 30px 6px 8px;gap:7px;font-size:.76rem}.ag-language-options{left:0;right:auto}.ag-language-option{min-width:150px}.ag-language-button .ag-flag,.ag-language-option .ag-flag{width:22px;height:15px;flex-basis:22px}}'
  ].join('');
  document.head.appendChild(style);
}

function flagMarkup(language) {
  return '<span class="ag-flag">' + (FLAGS[language] || FLAGS.en) + '</span>';
}

function closeMenu(menu, restoreFocus) {
  menu.classList.remove('open');
  const button = menu.querySelector('.ag-language-button');
  if (button) {
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus();
  }
}

function closeAll(except) {
  document.querySelectorAll('.ag-language-menu.open').forEach((menu) => {
    if (menu !== except) closeMenu(menu, false);
  });
}

function bindGlobalHandlers() {
  if (globalHandlersBound) return;
  globalHandlersBound = true;
  document.addEventListener('pointerdown', (event) => {
    document.querySelectorAll('.ag-language-menu.open').forEach((menu) => {
      if (!menu.contains(event.target)) closeMenu(menu, false);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = document.querySelector('.ag-language-menu.open');
    if (!menu) return;
    event.preventDefault();
    closeMenu(menu, true);
  });
}

function enhanceSelect(select) {
  if (!select || select.dataset.agLanguageEnhanced === 'true') return;
  select.dataset.agLanguageEnhanced = 'true';
  select.classList.add('ag-language-native');
  select.tabIndex = -1;

  Array.from(select.options).forEach((option) => {
    if (LANGUAGE_NAMES[option.value]) option.textContent = LANGUAGE_NAMES[option.value];
  });

  const menu = document.createElement('div');
  menu.className = 'ag-language-menu';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = (select.id || 'agLanguage') + 'MenuButton';
  button.className = 'ag-language-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', select.getAttribute('aria-label') || 'Language');

  const options = document.createElement('div');
  options.className = 'ag-language-options';
  options.id = (select.id || 'agLanguage') + 'Options';
  options.setAttribute('role', 'listbox');
  options.setAttribute('aria-label', select.getAttribute('aria-label') || 'Language');
  button.setAttribute('aria-controls', options.id);

  Object.entries(LANGUAGE_NAMES).forEach(([language, name]) => {
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'ag-language-option';
    optionButton.dataset.language = language;
    optionButton.setAttribute('role', 'option');
    optionButton.tabIndex = -1;
    optionButton.innerHTML = flagMarkup(language) + '<span>' + name + '</span>';
    options.appendChild(optionButton);
  });

  const items = () => Array.from(options.querySelectorAll('.ag-language-option'));

  function updateDisplay() {
    const language = LANGUAGE_NAMES[select.value] ? select.value : 'en';
    button.innerHTML = flagMarkup(language) + '<span>' + LANGUAGE_NAMES[language] + '</span><span class="ag-language-chevron" aria-hidden="true">▼</span>';
    items().forEach((optionButton) => {
      const selected = optionButton.dataset.language === language;
      optionButton.classList.toggle('selected', selected);
      optionButton.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function focusItem(index) {
    const optionItems = items();
    if (!optionItems.length) return;
    const normalized = (index + optionItems.length) % optionItems.length;
    optionItems[normalized].focus({ preventScroll: true });
  }

  function openMenu() {
    closeAll(menu);
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    const optionItems = items();
    const selectedIndex = Math.max(0, optionItems.findIndex((item) => item.dataset.language === select.value));
    queueMicrotask(() => focusItem(selectedIndex));
  }

  options.addEventListener('click', (event) => {
    const optionButton = event.target.closest('.ag-language-option');
    if (!optionButton) return;
    event.preventDefault();
    const language = optionButton.dataset.language;
    if (!LANGUAGE_NAMES[language]) return;
    select.value = language;
    closeMenu(menu, false);
    button.focus();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (menu.classList.contains('open')) closeMenu(menu, false);
    else openMenu();
  });

  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(menu, false);
    }
  });

  options.addEventListener('keydown', (event) => {
    const optionItems = items();
    const current = optionItems.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusItem(optionItems.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      document.activeElement && document.activeElement.click();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeMenu(menu, true);
    } else if (event.key === 'Tab') {
      closeMenu(menu, false);
    }
  });

  select.addEventListener('change', updateDisplay);
  select.insertAdjacentElement('afterend', menu);
  menu.append(button, options);
  updateDisplay();
}

export function enhanceLanguageMenus(root = document) {
  installStyles();
  bindGlobalHandlers();
  root.querySelectorAll('select[data-ag-language-menu]').forEach(enhanceSelect);
}
