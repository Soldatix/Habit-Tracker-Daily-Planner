/* Habit Tracker / Daily Planner — original Adsterra GET CODE.
 * One responsive banner at page bottom, OUTSIDE the app's rerendered #app.
 * Request only after existing first-party advertising consent.
 * Do not request on preview hosts or offline; no refresh or retries.
 * This parser-time technique was used in other Apps & Games pilots, but
 * has not been separately endorsed by the Adsterra provider.
 */
(() => {
  "use strict";
  if (location.hostname !== "habit-tracker.appsandgames.org") return;
  if (document.readyState !== "loading") return;
  if (navigator.onLine === false) return;

  const current = document.currentScript;
  const slot = current?.parentElement;
  const area = slot?.parentElement;
  const unit = current?.dataset.unit;
  if (!slot?.classList.contains("habit-ad-unit") ||
      area?.id !== "habit-ad-area") return;

  const desktop = matchMedia("(min-width: 800px)").matches;
  const mobile = matchMedia("(min-width: 320px) and (max-width: 799px)").matches;
  if (!((desktop && unit === "desktop") || (mobile && unit === "mobile"))) return;

  let allowed = false;
  try {
    const entry = document.cookie.split(";").map(s => s.trim())
      .find(s => s.startsWith("ag_privacy_choices_v1="));
    const record = entry && JSON.parse(decodeURIComponent(
      entry.slice("ag_privacy_choices_v1=".length)));
    const age = record && Date.now() - record.timestamp;
    allowed = !!record && record.version === 1 &&
      record.partnerRevision === "adsterra-2026-11" &&
      record.advertising === true &&
      Number.isFinite(age) && age >= 0 &&
      age <= 180 * 24 * 60 * 60 * 1000;
  } catch (_) { allowed = false; }
  if (!allowed) return;

  const snippets = {
    desktop: "<script>\n  atOptions = {\n    'key' : '2323e0dcae68ac006f38ac29a78f9875',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/2323e0dcae68ac006f38ac29a78f9875\"></script>",
    mobile: "<script>\n  atOptions = {\n    'key' : 'e73d7584abdcd1572c60f907297201d6',\n    'format' : 'iframe',\n    'height' : 50,\n    'width' : 320,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/e73d7584abdcd1572c60f907297201d6\"></script>"
  };
  area.hidden = false;
  slot.hidden = false;

  const label = document.createElement("span");
  label.className = "habit-ad-label";
  label.textContent = "Advertisement";
  slot.insertBefore(label, current);
  document.write(snippets[unit]);
})();
