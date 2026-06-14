# CircleCare

Familie-koordineringsapp som PWA. Kernen er **dækningsbilledet**: "hvem gør
hvad, i dag og i denne uge" — så man med ét blik kan se, om alt er dækket.

> **Nuværende fase:** klikbar demo med **mock-data** (ingen login, ingen
> backend). Alt data er hårdkodet lokalt. Login, Supabase og realtid kobles på
> senere — uden at skærmene skal bygges om (se "Data-laget").
>
> Den oprindelige prototype (v2.1.0, én statisk HTML-fil) ligger i
> [`prototype/index.html`](prototype/index.html) som ren visuel reference.

## Stack

- **React + Vite + TypeScript**, installérbar som PWA (`vite-plugin-pwa`)
- **TanStack Query** til data-hentning og caching
- **Tailwind CSS v4** med design-tokens porteret fra prototypen
- **Mock-data-kilde** i dag → **Supabase** (auth + Postgres + realtime) senere

## Kom i gang

```bash
npm install
npm run dev      # åbn den viste URL
```

Ingen miljøvariabler kræves — appen kører på hårdkodet demo-data.

## Deploy (Vercel)

Repoet er klar til Vercel. Engangs-opsætning:

1. På [vercel.com](https://vercel.com) → **Add New → Project** → importér dette
   GitHub-repo.
2. Vercel auto-detekterer Vite (build: `npm run build`, output: `dist`).
   `vercel.json` sørger for SPA-routing, så fx `/opgaver` virker ved reload.
3. Deploy. Herefter får hver push til branchen en preview-URL, og `main` en
   produktions-URL.

## Data-laget (sådan kobles Supabase på senere)

Alle skærme går gennem grænsefladen [`DataSource`](src/data/source.ts) via
hooks i [`src/data/hooks.ts`](src/data/hooks.ts) — de kender ikke backenden.

- I dag: [`MockDataSource`](src/data/mock/MockDataSource.ts) (hårdkodet, i
  hukommelsen, med `subscribe` for fremtidig live-opdatering).
- Senere: en `SupabaseDataSource` der implementerer det **samme** interface.
  Skiftet sker ét sted, i [`DataProvider`](src/data/DataProvider.tsx).

Det fremtidige database-schema (RLS, dæknings-view, demo-seed) ligger allerede
i [`supabase/`](supabase/) som forberedelse.

## Status (byggefaser)

- [x] **Fase 1** — dækningsbilledet (uge-overblik, manglende ansvarlig markeres)
- [x] **Fase 2** — opgaver (tilføj/tildel/markér klaret) på mock-data
- [x] **Fase 3** — kalender (måned/uge, begivenheder + hvem dækker)
- [ ] Fase 4 — roller & rolle-tilpassede visninger
- [ ] Fase 5 — kommunikation (spor → emne-tråde → beskeder)
- [ ] Senere — login + Supabase + realtid, mor som to-vejs "ansigt", push, AI

## Struktur

```
prototype/          gammel prototype (reference)
src/
  app/              router, providers, layout
  data/             DataSource-grænseflade, mock-kilde, hooks  ← backend-skifte sker her
  features/         coverage (senere: tasks, calendar, ...)
  components/ui/    genbrugs-komponenter
  lib/              query-client
  types/            domæne-typer
supabase/           fremtidigt schema + seed (ikke brugt endnu)
```
