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

### Required Worktree and Database Setup

Every agent creating or entering a feature worktree must complete this setup before running the application or editing schema-related code:

1. Create or verify the worktree from the current `main` branch. If the feature branch is older than `main`, merge or rebase `main` into it before making new changes.
2. Copy the root `.env` into the feature worktree without printing, opening, parsing, or modifying either file. The `.env` file contains secrets and is never included in command output, patches, logs, or summaries.

   ```sh
   cp -- .env .worktrees/<feature-slug>/.env
   ```

   After copying, stop and ask the user to edit the feature worktree’s `.env` so it uses an isolated database connection. At minimum, use a unique Compose project and a unique host port or database name. Do not continue until the user confirms the feature database is isolated from `main` and every other worktree.
3. Start the isolated database with a unique Compose project name, for example:

   ```sh
   docker compose -p portfile-<feature-slug> up -d db
   ```

   Never point a feature worktree at the `main` database. Never share a Postgres volume between worktrees. If feature data is needed, ask the user to create or provide a sanitized backup/clone; do not read the main `.env` or inspect production data.
4. Treat the database schema as versioned application code. Use Payload migrations for schema changes (`migrate:create`, then `migrate`) and commit `src/migrations/` with the feature. Do not rely on automatic dev schema push, accept destructive schema warnings, use `PAYLOAD_DROP_DATABASE`, or run `migrate:fresh`, `migrate:reset`, or equivalent against a non-disposable database without explicit user approval and a recoverable backup.
5. Before merge or handoff, merge/rebase the feature branch onto current `main`, apply its migrations to a fresh isolated database clone, run the migration status check, then run tests, lint, and build. Resolve migration ordering and schema conflicts in code and migrations; do not repair them by manually editing a shared database.

Agents must not read, modify, or delete any `.env` file. Copying the root `.env` to initialize a feature worktree is the sole permitted operation, and the user must make the database-connection edits.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
