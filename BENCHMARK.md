# AG2 V2.1 vs Desktop ChatGPT Codex — Benchmark Plan

## Baseline
Use the exact same `v1.0.0-baseline` commit for both agents.

## Suggested branches
- `benchmark/ag2-v2.1`
- `benchmark/codex`

## Rules
1. Give both agents the identical prompt.
2. No manual code edits during a benchmark run.
3. Record start/end state and all agent messages.
4. Run the same verification steps after each result.
5. Compare functionality, regressions, code quality, accessibility, mobile behavior and number of unnecessary changes.

## First benchmark task (proposal)
"Add editable habits and editable planner tasks without changing the visual design. Preserve all five languages, localStorage compatibility, import/export backup format, responsive behavior and PWA build."

## Verification checklist
- `npm run build` succeeds
- Create / complete / delete habit
- Create / complete / delete task
- Change date
- Change all 5 languages
- Light / dark / system theme
- Export and import backup
- Mobile layout at ~390 px width
- No data loss after page reload
