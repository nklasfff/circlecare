# CircleCare

Familie-koordineringsapp som PWA. Kernen er **dækningsbilledet**: "hvem gør
hvad, i dag og i denne uge" — så man med ét blik kan se, om alt er dækket.

> Den oprindelige klikbare prototype (v2.1.0, én statisk HTML-fil) ligger nu i
> [`prototype/index.html`](prototype/index.html) og bruges udelukkende som
> visuel reference (farver, tone, komponenter).

## Stack

- **React + Vite + TypeScript**, installérbar som PWA (`vite-plugin-pwa`)
- **Supabase** — Auth (magic link), Postgres, Realtime, Row Level Security
- **TanStack Query** til server-state, opdateret live via Supabase Realtime
- **Tailwind CSS v4** med design-tokens porteret fra prototypen

## Kom i gang

```bash
npm install
cp .env.example .env      # udfyld VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY
npm run dev
```

### Database

Schemaet ligger i `supabase/migrations/` og demo-data i `supabase/seed.sql`.

Med [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase start          # lokal stak
supabase db reset       # kører migrations + seed
```

Efter dit første login (magic link) kobler du dig til en plads i demo-familien:

```sql
select claim_demo_seat('Peter');   -- eller Maria / Anne / Lars
```

## Status (byggefaser)

- [x] **Fase 0** — fundament: scaffold, schema + RLS, auth
- [x] **Fase 1** — dækningsbilledet (uge-overblik, manglende ansvarlig markeres, realtime)
- [ ] Fase 2 — opgaver (CRUD, tildeling, status, gentagelse)
- [ ] Fase 3 — kalender (begivenheder + hvem dækker)
- [ ] Fase 4 — roller & rolle-tilpassede visninger
- [ ] Fase 5 — kommunikation (spor → emne-tråde → beskeder)
- [ ] Senere — mor som to-vejs "ansigt", orkestrator, push, AI

## Struktur

```
prototype/          gammel prototype (reference)
src/
  app/              router, providers, layout, auth-guard
  features/         coverage, members, auth (senere: tasks, calendar, ...)
  components/ui/    genbrugs-komponenter
  lib/              supabase-klient, query-client
  types/            domæne-/database-typer
supabase/           migrations + seed
```
