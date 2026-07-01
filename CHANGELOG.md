# Changelog

## [1.14.0] - 2026-06-30

### Added
- A fifth Froth Lab milk style, Extra-Thick, matching the machine's froth presets.
- A Website link at the bottom of Settings, alongside the Support and GitHub links.

## [1.13.0] - 2026-06-21

### Changed
- Switched analytics from Umami to Vercel Web Analytics.

## [1.12.0] - 2026-06-21

### Added
- One-click data move for the new site address: if you open the new site without any data, a welcome banner can bring your shots, recipes, beans, and history over from the old site in a single click, no manual export needed.

## [1.11.0] - 2026-06-12

### Added
- Tap the grind-size number to type a value directly, alongside the slider and the +/- buttons.

### Fixed
- On phones, opening a popup no longer lets the page behind it scroll or jump out of place; the background is held still and your scroll position is kept when you close it.
- Removed the pull-down bar at the top of mobile popups that looked draggable but only triggered an accidental page refresh.
- Smoother scrolling inside popups on phones.
- The Shot Timer, Dose & Yield, and Froth Lab panels now ease open instead of snapping the layout down.
- The bean icon is no longer clipped at the top.

## [1.10.0] - 2026-06-12

### Added
- A small Support (Ko-fi) link and a GitHub link at the bottom of Settings.

## [1.9.1] - 2026-06-12

### Fixed
- On phones and tablets, the grind and taste sliders and the "Taste later" and "Froth Lab" toggles now grow back to comfortable tap sizes. Some of these controls had been renamed, which had quietly switched off their touch-friendly sizing.

## [1.9.0] - 2026-06-12

### Changed
- Settings is more compact: themes are now a tidy two-column swatch grid (the selected one is ringed in the active theme's own color), and the data tools and sections are tighter so the panel fits in view instead of scrolling.
- The expanded Shot History now shows each shot's dial-in details inline, matching the dashboard, with the favorite, edit, and delete actions grouped together.
- A refreshed icon set across the whole app for a more consistent, crafted look.
- Numbers read more elegantly and now line up in columns across stats, the caffeine tracker, and dose and yield.
- Clearer controls: recipe cards have a labelled "Apply" button, a bean's active state now reads as an "Active"/"Inactive" tag, and the Strength control looks the same everywhere.

### Fixed
- The highlight on a favorited or selected shot in the history view now renders correctly in every theme.

## [1.8.0] - 2026-06-12

### Added
- A new "Fadetouched" theme: a calm, dark teal-green palette, selectable in Settings alongside the existing five.

### Changed
- A refreshed look across the whole app: a new heading typeface, calmer flat surfaces, and a decluttered shot history where each shot reads as a clean line instead of a row of boxes. The header is now just the wordmark.
- The taste-rating slider is simpler: a clean gradient with a single handle and the live "Balanced" label, with the small marker dots removed.
- Motion is quieter throughout. Things settle smoothly instead of bouncing, and a freshly logged shot gives a soft, brief tint instead of a glow.

### Fixed
- The Bag Size and Price fields no longer show the browser's mismatched up/down spinner arrows. You can still type the value or use the arrow keys.
- Secondary text like shot times and details now meets readable contrast in the Light, Catppuccin, and Rosé Pine themes.

## [1.7.0] - 2026-06-11

### Added
- Save first, taste later: you can log a shot without rating it, then add the taste from the shot's detail card once you've tried it. Unrated shots no longer count against your balanced rate.
- Bean inventory: record a bag's size and price, and the app tracks grams left, roughly how many shots remain, and the cost per shot on each bean card. A low-bag warning appears in the Smart Barista while you log.
- A quiet word of encouragement at milestone shots (your first, your 100th, your 50th of a bean), with no badges or confetti.

### Changed
- On phones, the Stats, History, and library panels now rise from the bottom as sheets within thumb's reach, and the Log Shot button stays pinned at the bottom of the form while you fill it in. Delete confirmations stay centered.
- Dose, yield, and time fields open the number pad on mobile, and the header is more compact so more of the form is visible.
- In a shot's detail view, "Brew Again" is now the primary button.
- A freshly logged shot briefly glows in your history, and the slider and bottom sheets settle with a gentle spring. Both respect your reduced-motion setting.

### Fixed
- All five themes now render their colors correctly. The favorite-shot gold is readable in the warm light theme (it was nearly invisible), the Caffeine tracker's gauge and labels display properly, and accent glows, rating colors, and danger text now follow the active theme instead of always using the dark one.
- Delete buttons and the "stale bean" label now meet readable contrast on cards.
- The keyboard-shortcuts panel starts collapsed and no longer covers your most recent shot's buttons.

## [1.6.0] - 2026-05-30

### Changed
- Visual refresh: the emoji used as icons are replaced with a single consistent icon set, the theme picker now uses a color swatch per theme, and hover and selection animations are smoother and more intentional.
- Corners and text sizes are drawn from a consistent scale across the app for a more polished, uniform look.
- The Stats panel now leads with a large Balanced Rate figure, with context, so your dial-in success stands out at a glance.

### Fixed
- The Smart Barista panel shows a clearer heading and explanation before there is any shot history for a bean, instead of a near-empty card.

## [1.5.1] - 2026-05-30

### Fixed
- CSV export now neutralizes bean names and notes that begin with `=`, `+`, `-`, or `@`, so opening the file in Excel or Google Sheets cannot run them as formulas.

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
