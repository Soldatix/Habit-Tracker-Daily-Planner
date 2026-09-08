# AG2 V2.1 vs Desktop ChatGPT Codex — Benchmark Plan

## Baseline
Both agents must start from the exact same baseline commit:

`7a92798ec436f1116c871e5a64ffdce4f33f326d` — `Initial Habit Tracker / Daily Planner V1.0 baseline`

## Test branches
- `test-ag2-v2.1`
- `test-codex`

Do not manually edit either branch during a benchmark run.

## General rules
1. Give both agents the identical task prompt below.
2. Each agent may inspect and edit the project files on its own branch.
3. No manual code corrections while an agent is working.
4. Do not copy fixes or ideas from one agent to the other.
5. Record whether the agent completes the task without additional guidance.
6. Run the same verification checklist after both results.
7. Preserve existing project architecture unless a change is genuinely necessary.
8. Existing functionality must not regress.

# Benchmark #1 — Weekly Overview

## Identical task prompt

Add a new **Weekly Overview / Tjedni pregled** feature to the existing Habit Tracker / Daily Planner application.

Requirements:

- Add a new main navigation tab for the weekly view without removing or redesigning the existing Today, Habits, Planner or Statistics sections.
- Show one complete Monday-to-Sunday week at a time.
- Clearly show the date for every day.
- For each day, show the habits scheduled for that day and planner tasks assigned to that date.
- Allow habits and tasks to be marked complete/uncompleted directly from the weekly overview.
- Changes made in the weekly overview must immediately use the same underlying data as the existing Today, Habits, Planner and Statistics views. Do not create a second independent copy of the data.
- Add previous-week, next-week and return-to-current-week navigation.
- Clearly distinguish the current day.
- Clearly distinguish completed items.
- A day with no planned habits or tasks must have a clean empty state rather than looking broken.
- Preserve the current visual style and make the weekly view responsive and practical on desktop and mobile screens around 390 px wide.
- Support all existing interface languages: Croatian, English, German, Italian and Spanish. Do not translate user-entered habit names, task titles or notes.
- Preserve Light, Dark and System theme behavior.
- Preserve existing localStorage data and compatibility with the current JSON export/import backup format. Existing backups must continue to import successfully.
- Preserve the PWA/build behavior.
- Do not add a backend, login system, cloud database, React/Vue/Angular or other large framework.
- Prefer the existing modular Vanilla JavaScript structure and reuse existing storage, date, habit, planner, translation and theme logic where appropriate.
- Do not make unrelated changes.

When finished:

1. Run the available build/check commands.
2. Briefly report which files were changed and why.
3. Report any limitations or assumptions honestly.

## Verification checklist

### Build / regressions
- `npm run build` succeeds.
- Existing Today view still works.
- Existing Habits view still works.
- Existing Planner view still works.
- Existing Statistics view still works.
- No data loss after page reload.

### Weekly Overview
- New weekly tab opens correctly.
- Monday-Sunday dates are correct.
- Previous week works.
- Next week works.
- Return to current week works.
- Current day is visually identifiable.
- Scheduled habits appear on the correct days.
- Tasks appear on the correct dates.
- Habit completion can be toggled from weekly view.
- Task completion can be toggled from weekly view.
- Changes are reflected in Today/Planner/Statistics as appropriate.
- Empty days have a clear empty state.

### Compatibility
- Croatian works.
- English works.
- German works.
- Italian works.
- Spanish works.
- Light theme works.
- Dark theme works.
- System theme works.
- Existing JSON backup can still be imported.
- New export can be imported again.
- Mobile layout is usable at approximately 390 px width.

## Comparison criteria
Score each agent from 0–5 in each category:

1. Functional correctness
2. Preservation of existing functionality
3. Code quality and modularity
4. Understanding/reuse of existing architecture
5. UI consistency
6. Mobile responsiveness
7. Five-language completeness
8. Accessibility/usability
9. Amount of unnecessary code or unrelated changes
10. Independence — amount of extra guidance required

Maximum score: **50 points**.

Also record:
- elapsed working time,
- number of files changed,
- approximate lines added/removed,
- build errors encountered,
- bugs found during manual testing,
- number of follow-up prompts needed.
