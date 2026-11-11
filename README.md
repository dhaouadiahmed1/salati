<div align="center">
  <img src="./assets/icon.png" width="104" height="104" alt="Salati logo">
  <h1>Salati — صلاتي</h1>
  <p>صلاتك، قرآنك، وذكرك. أقرب، كل يوم.</p>
  <p>Prayer, Quran, and daily remembrance for Android.</p>
  <p><a href="https://github.com/dhaouadiahmed1/salati/releases/latest">Download Android APK</a></p>
</div>

Salati is an Arabic/English Islamic companion built with Next.js, React,
TypeScript, and Capacitor. It includes prayer times and Azan reminders, Quran
reading and recitation, Tafseer, daily Azkar, Tasbeeh, and Qibla.

Salati 1.0 is based on [Aniro 6.15](https://github.com/its3li/Aniro) by
Ali Mahmoud (its3li), used under its MIT license. The name, logo, package
(`app.salati`) and update URLs were changed for this fork; the MIT copyright
notice is kept in [LICENSE](LICENSE). Salati is not the official Aniro app.

## Download and update

Get the latest APK from
[GitHub Releases](https://github.com/dhaouadiahmed1/salati/releases/latest).
Android 7.0 or newer is required.

**Existing users:** keep Salati installed. Open Settings → About → Check for
updates, or install the APK over your existing version. The update preserves
local data and preferences.

## Features

- **Prayer and Azan:** location-based timings, calculation preferences,
  manual adjustments, and native Android alarms/reminders.
- **Quran:** 114 surahs, page and list reading, color-coded Tajweed,
  saved reading position, and adjustable text controls.
- **Listening and Tafseer:** reciters, playback controls, and verse
  interpretation inside the reader. Online recitation needs internet.
- **Daily Azkar:** organized categories and repetition tracking; progress
  survives reopening and resets for the next local day.
- **Tasbeeh and Qibla:** a counter with touch feedback and a sensor-based
  compass with calibration guidance.
- **Preferences:** Arabic/English, light/dark/system appearance, text size,
  prayer options, and resizable Android home-screen widgets.

Permissions for notifications, alarms, location, and battery behavior can
affect reminders. Sensor availability and calibration affect Qibla direction.

## Technology

| Layer | Technology |
| --- | --- |
| Web app | Next.js 15, React 19, TypeScript 5 |
| UI | Tailwind CSS 3.4, Radix/shadcn components, Phosphor icons |
| Android | Capacitor 8 and native Java plugins |
| Prayer calculations | Adhan libraries |
| Search | MiniSearch, bundled Quran search data |
| Local data | IndexedDB and Capacitor Preferences |

## Development

Requirements: Node.js 20+, Java 21, and the configured Android SDK for
native builds. The app exports static web assets for Capacitor.

    git clone https://github.com/dhaouadiahmed1/salati.git
    cd salati
    npm ci
    npm run dev

Production web build and native sync:

    npm run build
    npx cap sync android

## Project layout

| Path | Content |
| --- | --- |
| src/app/ | Application pages |
| src/components/ | Shared UI and feature components |
| src/hooks/ | Location, prayer, reading, and state hooks |
| src/lib/ | Data access, calculations, search, and validation |
| android/ | Native Android app and plugins |
| public/ | Bundled static data and web assets |
| tests/ and scripts/ | Browser tests and release checks |

## License

MIT license. See [LICENSE](LICENSE). Original work © 2025 Ali (its3li),
Aniro; Salati fork © 2026 dhaouadiahmed1.
