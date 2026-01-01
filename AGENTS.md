# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, with locale-specific routes under `app/[locale]/`.
- `components/`: shared UI components; `components/ui` contains shadcn/ui primitives.
- `lib/`, `hooks/`, `types/`: shared utilities, React hooks, and TypeScript types.
- `assets/`: markdown problem content and supporting data.
- `messages/` and `i18n/`: translation files and i18n configuration.
- `public/`: static assets; `.next/` is build output.
- `tests/`: Vitest setup and test utilities.

## Build, Test, and Development Commands
- `pnpm dev`: run the dev server on `http://localhost:33333`.
- `pnpm build`: production build.
- `pnpm start`: build and run production server.
- `pnpm lint`: Biome lint checks.
- `pnpm fix`: auto-format and fix lint issues (runs in pre-commit hook).
- `pnpm type-check`: TypeScript compile checks.
- `pnpm test`, `pnpm test:run`, `pnpm test:ui`, `pnpm test:coverage`: Vitest modes.

## Coding Style & Naming Conventions
- Formatting and linting use Biome (`biome.json`); indentation is tabs and JS/TS strings use double quotes.
- Imports are auto-organized; use the `@` alias for repo-root imports.
- Follow existing naming patterns: PascalCase components in `components/`, `use*` hooks in `hooks/`.

## Testing Guidelines
- Test runner: Vitest with `jsdom` and Testing Library; setup lives in `tests/setup.ts`.
- Coverage is available but not required by default.
- Prefer `*.test.ts(x)` or `*.spec.ts(x)` placed in `tests/` or co-located with the module (match nearby patterns).

## Commit & Pull Request Guidelines
- Conventional Commits are enforced (commitlint + husky). Common types in history: `feat:`, `fix:`, `chore:`.
- PRs should include a clear description, linked issues (if any), and screenshots for UI changes. If you change UI text, update `messages/` translations.

## Configuration & Secrets
- Copy `.env.example` to `.env.local` for local configuration. Do not commit secrets.
