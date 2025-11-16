# Contributing

Thanks for wanting to help make Code Typer better. This is a small project, so every bug report, typo fix, and new feature makes a difference.

## Requirements
- **Node 22**
- **npm**. Yarn/pnpm are great, but please stick to npm so lockfiles stay in sync.
- **GitHub API token** to run the snippet seeding scripts
- **Docker** (optional)

## Setup
1. Fork the repo and clone your fork.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env` 
   ```bash
   cp .env.example .env
   ```
   Tweak the values to match your local setup. If you plan to seed snippets (which is needed to test the application), drop your GitHub token into `GITHUB_API_TOKEN`.

4. Start Postgres:
   - **Docker:** `docker compose up db -d` spins up the same Postgres config referenced in `.env`.
   - **Local install:** make sure the credentials (either `DATABASE_URL` or `POSTGRES_*`) match your running server.
5. Sync Prisma with the database:
   ```bash
   npx prisma db push   # creates tables
   npx prisma db seed   # seeds base languages
   ```
6. Populate the database with all the snippets:
   ```bash
   npx tsx scripts/seed-missing-snippets.ts
   ```
   Snippets for every language will be seeded. Given Github API limitations, this process **will** take some time. 
   
   Optionally, if you only need to populate snippets of one specific language, you can find all the available language ids in `prisma/seed/languages.ts` and then run.
   ```bash
   npx tsx scripts/seed-snippets.ts --language <id>
   ```
6. Run the dev server using `npm run dev`.

## Pull request checklist
- Create a branch off `main` with a descriptive name (`feature/auto-closing-tweak`, `fix/language-picker`, etc.).
- Keep changes scoped. Smaller PRs get reviewed faster.
- Update docs when behavior changes (README, this file, inline comments).
- Run `npm run lint`, `npm run prettier`, and `npm run build` locally.
- Include screenshots or screen recordings if you touch UI/UX. A quick Loom/GIF helps reviewers verify the behavior without pulling the branch immediately.
- Push your branch and open a PR against `main`. Describe the problem, your solution, and any follow-up work you’re leaving for later.

## Reporting issues
Not ready to code? Filing issues is just as helpful. When you open one, share:
- What you expected vs. what happened.
- Steps to reproduce (including browser/OS if UI-related).
- Screenshots or videos when visual glitches appear.
