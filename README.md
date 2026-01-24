# ☕ Luxe Cafe Dial-In

**Espresso Calibration Dashboard for the Ninja Luxe Cafe Pro**

A premium React-based dashboard for tracking and perfecting your espresso shots. Log your brews, get smart calibration tips, save favorite recipes, and dial in the perfect cup every time.

![Dashboard Preview](https://img.shields.io/badge/React-18+-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite)

---

## ✨ Features

### 📝 Shot Logging
- **Bean Name Autocomplete** — Quickly select from previously used beans
- **Brew Type Selector** — Espresso, Drip Coffee, Cold Brew, Cold Pressed, Over Ice
- **Hardware-Accurate Controls** — Grind size 1-25, Basket (Single/Double/Luxe), Temperature, Strength
- **5-Point Taste Rating** — Discrete slider from Very Sour → Balanced → Very Bitter

### 🥛 Froth Lab
- Collapsible milk settings panel
- Milk Type: Dairy or Plant
- Style: Steamed, Thin, Thick, Cold Foam

### 📋 Add-ins & Notes
- Record extras like "Vanilla syrup, Cinnamon, Extra hot"
- Notes display on history cards for easy reference

### ⭐ Pin Best Shot
- Star any shot as your "Target Recipe" for that bean
- Favorites get a gold border and sort to the top
- Target Recipe box shows ideal settings when selecting a bean

### ⚡ Quick Recipes
- Save complete drink configurations with one click
- Recipe chips at dashboard top for instant form auto-fill
- Saves: Bean, Brew Type, Grind, Temp, Basket, Strength, Milk, Notes

### 🤖 Smart Barista
- Real-time calibration tips based on your last shot
- Actionable advice: "Grind finer" / "Lower temperature"
- Visual adjustment badges (Major/Minor)

### 📱 Mobile-Optimized
- 44px+ touch targets for all interactive elements
- Thick sliders easy to grab on touchscreens
- Responsive layout for phones and tablets

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Components |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Vanilla CSS** | Custom "Midnight Cafe" Design System |
| **localStorage** | Data Persistence |

---

## 📁 Project Structure

```
espresso_dashboard/
├── src/
│   ├── App.tsx          # Main dashboard component
│   ├── types.ts         # TypeScript interfaces
│   ├── utils.ts         # Storage & helper functions
│   ├── index.css        # Complete design system
│   └── main.tsx         # React entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🎨 Design System

The **"Midnight Cafe"** theme features:

- **Dark Espresso Background** — `#1a1512`
- **Cream Text** — `#f5f0e8`
- **Caramel Accents** — `#a67b5b`
- **Gold Favorites** — `#FFD700`
- **Rating Colors** — Sour (amber) → Balanced (green) → Bitter (red)

Typography: **Playfair Display** (headings) + **Inter** (body)

---

## 💾 Data Storage

All data persists in `localStorage`:

| Key | Contents |
|-----|----------|
| `espresso-shots` | Shot history with timestamps |
| `espresso-favorites` | Bean → Shot ID mapping |
| `espresso-recipes` | Saved quick recipes |

---

## 📄 License

MIT © 2026
