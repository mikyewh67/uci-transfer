# 405 South — Transfer Command v4

Offline-first Santa Monica College → UC transfer planner built for a Fall 2028 transfer route.

## What changed in v4

- Rebuilt around **real unit states**: completed, enrolled, planned, projected.
- Fall 2026 is stored as the actual paid 14-unit schedule and locked against accidental moves.
- BUS 1 starts completed with a **C**.
- UCI Business Administration is the primary target; UCLA Business Economics is tracked alongside it.
- Major-prep requirements are separated from Cal-GETC and UC-transferable unit credit.
- 60-unit engine, GPA engine, requirement matrix, Cal-GETC coverage, course detail sheets, move validation, critical path, source vault, application timeline, TAU mode, counselor log/report, JSON backup, calendar export, search/command palette, snapshots, undo, and offline PWA support.
- Current Cal-GETC numbering is used where SMC changed course codes (for example ECON C2001/C2002 and HIST C1002).
- The app does **not** create a fake admissions probability or readiness score.

## Publish on GitHub Pages

1. Create or open your GitHub repository (for example `uci-transfer`).
2. Upload **all files in this folder** to the repository root. `index.html` must be at the top level.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose `main` and `/ (root)`, then save.
6. After GitHub publishes, the URL is normally:
   `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

If your repo is `uci-transfer` under `mikyewh67`, the URL is:
`https://mikyewh67.github.io/uci-transfer/`

## Add to iPhone Home Screen

1. Open the GitHub Pages URL in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Open **405 South** from the Home Screen once while online so the app shell can cache.
5. After that, the core app opens offline.

## Source model

The app is static and makes no background admissions-data calls. Its working academic source set is:

- SMC → UCI Business Administration ASSIST major agreement, 2025–26.
- SMC → UCLA Business Economics ASSIST major agreement, 2025–26.
- SMC Cal-GETC course list, 2026–27.
- SMC UC Transfer Course Agreement, 2025–26, used as the working UC-transferability/unit-credit list.

Before each registration window, compare the saved plan against the newest ASSIST agreement and SMC catalog. Source years are shown in **Requirements → Sources** without placing a warning on every course.

## Data and backups

All changes live in browser `localStorage` under the v4 namespace. Use **Settings → Export JSON** before changing phones or clearing browser data. Importing that JSON restores the saved plan.

This v4 build intentionally uses a new storage namespace instead of automatically mixing older v2/v3 planner data into the new verified course model.
