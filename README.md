# Quran Story Universe

Arabic-first luxury Quranic story atlas — refactored from the HTML prototype into a modular local-first app with Supabase-ready data layer.

## Quick start

```bash
cd /workspace
npx --yes serve src -p 3000
```

Open [http://localhost:3000](http://localhost:3000)

## Android app

The web app can be packaged as a native Android APK via **Capacitor**:

```bash
npm install
npm run android:sync
npm run android:build
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

Install on a connected phone: `npm run android:install` (requires `adb`).

See [docs/android_app_guide.md](docs/android_app_guide.md) (Arabic guide).

Alternative:

```bash
cd /workspace/src && python3 -m http.server 3000
```

## Project structure

```
src/           Application (ES modules, no build step)
docs/          Implementation plan, policies, checklist
supabase/      PostgreSQL schema
backup/        Design reference + notes about original prototype
```

## Features

- **Graph** — Canvas force graph with filters, search, details panel, pause/reset
- **Story Mode** — Timeline, ayah cards, themes, lessons, sources, navigation
- **Search** — Arabic normalization + multi-filter search
- **Surahs** — Grid with study modal entry
- **Study modal** — Sources, review badges, educational disclaimer

## Content safety

- No invented tafsir in seed data
- Unreviewed items show draft badges in public mode
- Disclaimer: **هذا ملخص تعليمي لا يغني عن المصحف وكتب التفسير المعتمدة.**

## Data layer

Local JSON via `src/lib/localJsonRepository.js`. Switch provider later:

```javascript
import { configure } from './lib/dataService.js';
configure({ provider: 'supabase', supabaseUrl: '...', supabaseKey: '...' });
```

## Documentation

- [Implementation plan](docs/implementation_plan.md)
- [Source policy](docs/source_policy.md)
- [Content review policy](docs/content_review_policy.md)
- [Quality checklist](docs/quality_checklist.md)

## Note on original prototype

The original `quran_story_universe_10_10_final.html` is in the repo root and `/backup`. The refactored app was aligned to it per `/docs/original_prototype_parity_report.md`.

## Pending work

- Import full licensed Quranic text
- Implement Supabase repository + admin review UI
- Complete scholarly review of all seed events
- Add automated tests
