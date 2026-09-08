# AG2 V2.1 vs Desktop ChatGPT Codex — Read-Only Code Review Benchmark

## Baseline
Both agents must review the exact same application baseline commit:

`7a92798ec436f1116c871e5a64ffdce4f33f326d` — `Initial Habit Tracker / Daily Planner V1.0 baseline`

## Review branches
- AG2 V2.1: `test-ag2-v2.1`
- Desktop ChatGPT Codex: `test-codex`

Both branches start from the same baseline commit.

# Benchmark #1 — Read-Only Full Project Code Review

## Rules
1. Give both agents the **identical prompt** below.
2. This is a **READ-ONLY review**.
3. The agent must **not edit, create, delete, rename, format or overwrite any project file**.
4. The agent must **not commit, push, create a pull request or change branches**.
5. The agent must **not run auto-fix commands** or install/update dependencies.
6. The agent may inspect all existing source/configuration files and use read-only analysis tools available to it.
7. Do not manually help one agent with findings discovered by the other.
8. Do not tell the second agent what the first agent found.
9. Findings must distinguish confirmed problems from optional improvements or uncertain hypotheses.
10. A finding is valuable only if it is supported by the actual project code.

## Identical prompt for both agents

```text
Perform a complete READ-ONLY code review of this Habit Tracker / Daily Planner project.

IMPORTANT:
- Do NOT modify, create, delete, rename, format or overwrite any file.
- Do NOT commit or push anything.
- Do NOT create a pull request.
- Do NOT install or update dependencies.
- Do NOT run auto-fix commands.
- Your task is analysis and reporting only.

Review the entire existing project, not just one file. Inspect the application architecture and all relevant HTML, JavaScript, CSS, translations, PWA files, package/configuration files and documentation needed to understand the implementation.

Look specifically for:
1. Real functional bugs or edge cases.
2. Data-loss or state-consistency problems.
3. localStorage problems, schema/versioning problems or persistence bugs.
4. JSON export/import backup problems, validation weaknesses or compatibility risks.
5. Security issues, including unsafe handling of imported or user-entered data.
6. PWA/service-worker/manifest problems and update/cache risks.
7. Problems with Light, Dark or System theme behavior.
8. Missing, inconsistent or broken translations across Croatian, English, German, Italian and Spanish.
9. Responsive/mobile layout problems that can be identified from the code.
10. Accessibility/usability problems.
11. Date, weekday, streak, statistics or timezone-related logic problems.
12. Problems in habit scheduling, completion state, planner tasks or statistics calculations.
13. Build/configuration/dependency issues.
14. Dead code, duplicated logic, fragile coupling or maintainability problems that could realistically cause defects.

Do not invent problems merely to produce a longer report. If something is only a possible concern and cannot be confirmed from the code, label it clearly as a hypothesis.

For every finding provide:
- Severity: Critical / High / Medium / Low.
- File path and, where possible, function/section or approximate line/location.
- What is wrong.
- Why it matters to the user or application.
- A concrete scenario that triggers the problem, when applicable.
- A recommended fix, but DO NOT apply the fix.

Separate the final report into:
A. Confirmed bugs / defects
B. Security or data-integrity risks
C. Accessibility / responsive / localization issues
D. Code-quality or maintainability concerns
E. Optional improvements (not bugs)
F. Things reviewed that appear correct

At the end provide:
- Total number of confirmed findings by severity.
- The 3 most important issues to fix first.
- An overall code-health score from 0 to 10 with a short justification.
- A short statement confirming that no project files were modified.
```

## Comparison criteria
Score each agent from 0–5 in each category:

1. Number and importance of **real** bugs found.
2. Accuracy — avoidance of false positives.
3. Evidence and precision of file/location references.
4. Understanding of application architecture and data flow.
5. localStorage / backup / data-integrity analysis.
6. Security analysis.
7. PWA / service-worker analysis.
8. Localization / accessibility / responsive analysis.
9. Quality and practicality of recommended fixes.
10. Clarity and prioritization of the final report.

Maximum score: **50 points**.

Also record:
- elapsed review time,
- number of confirmed Critical/High/Medium/Low findings,
- number of findings later proven to be false positives,
- important issues found by both agents,
- important issues found by only one agent,
- whether either agent attempted to modify files despite the read-only instruction,
- number of follow-up prompts required.

## Fairness rule
Do not fix the baseline between the AG2 and Codex reviews. Both agents must review the same code state. Only after both reports are complete should findings be verified and fixes considered.
