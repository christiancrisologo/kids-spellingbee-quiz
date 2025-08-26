# Spelling Bee for Kids

A modern, interactive spelling bee quiz app for kids, built with Next.js, React, and TypeScript.

## Features

- **Dynamic Year Level Presets**: Quiz settings (difficulty, question count, timer, categories, etc.) are loaded at runtime from `src/configs/settings.json`. Easily customize or add new year levels without code changes.
- **Quiz Mechanics**:
  - Multiple question types: input (type the word) and multiple-choice
  - Word categories: places, animals, persons, science, technology, actions, other, all
  - Timer per question and overall game timer
  - Correct/incorrect answer goals and limits
  - Challenge modes for extra difficulty
- **Speech Synthesis**: Words are read aloud using browser TTS for accessibility and engagement.
- **Mobile-Friendly UI**: Responsive design with touch-friendly controls and custom mobile components.
- **Game History & Results**: Track user progress, view past results, and see detailed stats.
- **System Settings**: Toggle dark mode and other preferences.
- **Config-Driven**: All year level presets and settings are managed via JSON config files for easy updates.

## How It Works

1. **Select Year Level**: Choose your school year level. The app loads settings dynamically from config.
2. **Customize Settings**: Adjust difficulty, question type, timer, and categories as needed.
3. **Start Quiz**: Words are presented one by one, with speech synthesis and timer.
4. **Track Progress**: See your results, history, and stats after each quiz.

## Configuration

- Edit `src/configs/settings.json` to change year levels, quiz settings, or add new presets.
- All changes are reflected instantly in the app UI and logic.

## Tech Stack

- Next.js
- React
- TypeScript
- Zustand (state management)
- Custom hooks and utility functions

## Getting Started

1. Install dependencies:
	```sh
	yarn install
	# or
	npm install
	```
2. Run the development server:
	```sh
	yarn dev
	# or
	npm run dev
	```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

- To add or edit year levels, update `src/configs/settings.json`.
- To change UI or quiz logic, edit components in `src/app/` and `src/components/`.

## License

MIT

