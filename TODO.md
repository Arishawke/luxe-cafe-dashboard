# TODO

Small follow-up cleanups noted during the refactor. None of these are bugs, just opportunities to tighten things further.

## Code

- **Header callback boilerplate.** App.tsx wires five header buttons with the same `() => { setShowX(true); setMobileMenuOpen(false); }` shape. Could collapse to a single `openModal(setter)` helper, or move the close-mobile-menu detail inside `Header.tsx` so call sites just pass `setShowX`.
- **Modal-stack hygiene.** `confirmDeleteShot` and `openEditShot` both call `setSelectedShot(null)` to dismiss the detail modal before doing their work. The fact that both have to remember this is a sign the parent shouldn't own that hygiene. A `useModalStack` hook (or making the detail modal close itself on the relevant actions) would consolidate.
- **Long-form date formatting.** `lib/format.ts` exports `formatDate` for the short list view, but `ShotDetailView` builds long-form (weekday/year) inline with `Intl.DateTimeFormat`. Add a `formatDateLong` to `lib/format` so all three call sites (`ShotHistory`, `HistoryModal`, `ShotDetailView`) use the same helper.
- **Two `Settings` buttons in `Header.tsx`.** Lines 67-80 render two buttons with the same callback, one icon-only and one with text, presumably for desktop vs mobile breakpoints. The duplication is real markup-wise. Either collapse to one button using CSS to swap the label, or add a one-line comment explaining the responsive intent.
- **`storage.ts` key prefix inconsistency.** `STORAGE_KEY = 'espresso-shots'` etc. uses an `espresso-` prefix while every other localStorage key in the app uses `luxe-cafe-`. Renaming would orphan existing users' data, so leave alone unless a migration is added.
- **`ConfirmDialog` button label is hardcoded to "Delete".** Works for every current confirm flow, but won't generalize. If a non-destructive confirm is ever added, take an optional `confirmLabel` prop.

## Quality of life

- **No test suite.** Sensible follow-up: add Vitest + React Testing Library, start with smoke tests for `useShots`, `useBeans`, `useRecipes` (round-tripping through localStorage) and a render check on `App`.
- **No CI.** A GitHub Actions workflow that runs `npm run lint && npm run build` on every PR would catch regressions before merge.

## Planned features

Direction agreed during brainstorming, ordered by what to tackle next.

- **Bean inventory and cost-per-shot.** Extend `BeanProfile` with `bagSizeGrams`, `pricePaid`, and `purchaseDate`. Auto-decrement remaining grams as shots are logged using `doseIn`. Add a "running low" alert variant (under 100g) that mirrors the freshness alert pattern. Surface cost-per-shot in stats and on the bean library card. The only one of the three that needs a data migration, so it deserves its own brainstorm and plan before coding.
- **Deeper insights.** Two pieces that can ship separately:
  - Bean Passport modal: click a bean in the library, see grind-vs-rating scatter, balanced average, top recipe, and all shots filtered to that bean.
  - Calendar heatmap and streak tracker: 30 or 90 day grid colored by shot count or success rate. New section in `StatsModal`, reuses the day grouping in `computeStats`.
- **Maintenance polish (deferred from v1).** Captured in the v1 plan as out of scope:
  - Water hardness picker (Soft 120d, Medium 90d, Hard 45d).
  - Water filter replacement timer (60 day cadence).
  - Backflush log (weekly, opt-in so non-pro users are not nagged).
  - Maintenance history view inside Settings or its own modal.
  - Small indicator chip in `Header.tsx` when any task is due.
  - Browser notifications when a task becomes due.
