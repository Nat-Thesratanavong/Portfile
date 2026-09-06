# AGENTS.md

## Commands

Use `pnpm` for all package operations; do not use npm, yarn, or bun.

- `pnpm dev` - run the development task
- `pnpm build` - build the project
- `pnpm lint` - run the lint task
- `pnpm start` - start the project
- `pnpm test` - run the unit and integration suites
- `pnpm test:e2e` - run the E2E suite

## Git Worktree Layout

- Keep the repository root checkout on the local `main` branch only.
- Work on feature branches from dedicated worktrees under `.worktrees/` (for example, `.worktrees/feat-pong`).
- Before editing, verify the checkout with `git worktree list` and `git branch --show-current`.

## Code Map

- `src` - application source
- `tests` - automated tests
- `scripts` - project configuration
- `.github` - project configuration

## Conventions

- Use `import`/`export` syntax for modules.
- Follow TDD: write or update a failing test first, then implement.
- Follow DRY: reuse existing helpers instead of duplicating logic.
- Prefer readable code over clever shortcuts.
- Keep `pnpm build` and `pnpm lint` passing; cover behavior changes with tests.
