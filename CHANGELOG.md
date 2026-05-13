# Changelog

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
