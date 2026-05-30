# Changelog

## [1.5.0] - 2026-05-30

### Added
- "Undo import" button in Settings to instantly restore your previous data after an import.

### Changed
- Importing a backup now keeps every readable entry and reports how many unreadable ones were skipped, instead of refusing the whole file or letting one bad entry corrupt your data.

### Fixed
- A damaged, hand-edited, or partial backup file can no longer blank the screen on import; unreadable entries are validated out as the file is read.
- Dates that cannot be read now show "Unknown date" instead of crashing the shot list or detail view.
- When browser storage is full or unavailable (for example in private mode), the app now warns you to export a backup instead of failing silently, and no longer risks overwriting recoverable data with an empty list.

## [1.4.3] - 2026-05-13

### Changed
- Faster first paint: Google Fonts now load via preconnect from the HTML head instead of a CSS import. Lighthouse mobile LCP estimated ~1s faster.
- Initial JavaScript bundle is ~5 KB smaller (gzip) because Bean Library, Recipe Library, Stats, Caffeine, History, Settings, and Recipe Editor modals now lazy-load their code only when first opened.

### Fixed
- Dashboard root is now a semantic `<main>` element, giving screen reader users proper landmark navigation.
- Muted text in the dark theme is slightly lighter so it meets WCAG AA (4.5:1) contrast on all background tones.

## [1.4.2] - 2026-05-13

### Changed
- Every interactive button now has at least a 44x44px tap target, so phone taps are easier and meet platform accessibility minimums.

## [1.4.1] - 2026-05-13

### Changed
- Shot detail modal now closes immediately when you click Edit, Delete, or Brew Again, so the confirm dialog or the form is no longer covered by the detail behind it.

## [1.4.0] - 2026-05-13

### Changed
- Accessibility hardening pass:
  - Added a visible `:focus-visible` ring for keyboard users across all interactive elements.
  - Honored the `prefers-reduced-motion` OS preference; animations and transitions collapse when set.
  - Respected device safe areas (notches, gesture bars) on the main dashboard for installed PWA users.
  - Associated every form label with its input via `htmlFor`/`id`, so screen readers announce field names correctly.
  - Pill-group selectors (Basket, Temperature, Strength, Milk Type, Milk Style, Timer mode) now announce their selected state and group label to screen readers.
  - Added descriptive labels to every icon-only button (modal closes, grind +/-, favorite star, edit, delete, etc.) so they are no longer silent in screen readers.
  - All nine modals now identify themselves as dialogs and trap keyboard focus while open; closing a modal restores focus to where it came from.

## [1.3.1] - 2026-05-12

### Fixed
- Rose Pine and Rose Pine Moon themes had `--color-foam` and `--color-muted` collapsed to the same color, flattening the text hierarchy. Foam now uses a lighter desaturated lavender.
- Header showed two duplicate Settings buttons (one icon-only on desktop, one with text on mobile). Consolidated to a single "Settings" button shown on both.
- Several UI labels were 10px, below the readable floor. Bumped to 12px.

## [1.3.0] - 2026-05-12

### Changed
- Swapped body font from Inter to Plus Jakarta Sans for a more distinctive look.
- Removed the infinite glow pulse on the header coffee icon (subtle drop-shadow halo retained).

## [1.2.0] - 2026-05-12

### Changed
- Switched analytics from Vercel to Umami.
- Re-licensed from MIT to GPL v3.

## [1.1.0] - 2026-05-07

### Added
- Maintenance reminders for cleaning (every 200 shots) and descaling (every 90 days), with banner alerts when a task is approaching, due, or overdue.
- Settings panel section to mark cleaning or descaling as done.
- Maintenance events round-trip through JSON import/export.

## [1.0.0] - 2026-01-28

### Added
- Log espresso shots with bean, brew type, grind size, basket, temperature, strength, and a 5-point taste rating.
- Bean Library with roaster, origin, roast level, process, roast date, and flavor notes.
- Quick Recipes for one-click form auto-fill.
- Stats dashboard with rating distribution, top beans, and weekly success rate.
- Caffeine tracker with daily total and 400 mg limit warning.
- Shot timer with dose-in, dose-out, and yield ratio.
- Tips based on your last shot for the same bean.
- Expanded shot history with split-pane preview.
- Shot comparison view.
- Ability to edit past shots.
- Single shot option.
- Export to JSON or CSV; import from JSON.
- 5 color themes (dark, light, Catppuccin, Rose Pine, Rose Pine Moon); 12 or 24-hour time format.
- Keyboard shortcuts for logging shots, opening the Bean Library, cycling themes, and closing modals.
- PWA support (installable, offline-capable).

### Fixed
- "Delete everything" reliably clears all data.
- Esc closes the Recipe Library, and Ctrl+Enter no longer logs a shot while it is open.
- Mobile layout, including theme toggle on small screens.
- Stopwatch UI.
- Scrollbar issues.
