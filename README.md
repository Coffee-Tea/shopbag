# Shopbag

Shopbag is a mobile-first grocery list app built with Angular. It is a single-screen POC focused on fast list management: add items, edit inline, mark as bought, undo deletes, and run bulk actions for bought items.

## Stack

- Angular 21
- SCSS
- JSON Server for the local API
- Node.js 22.12+

## Local development

Install dependencies:

```bash
npm install
```

Start the full local setup:

```bash
npm run dev
```

This runs:

- the Angular app on `http://localhost:7007`
- the mock API on `http://localhost:7008`

API calls from the app are proxied from `/api` to the JSON Server defined in `db.json`.

If you want to run them separately:

```bash
npm run api
npm start
```

## Scripts

```bash
npm start          # Angular dev server
npm run api        # JSON Server API on port 7008
npm run dev        # API + app together
npm run build      # production build
npm test           # unit tests
npm run lint       # ESLint
npm run format     # Prettier
```

## Project shape

- `src/app/components` — UI building blocks
- `src/app/services` — item state, dialogs, toasts, dictionary, theme
- `src/app/models` — item types and helpers
- `src/assets/starter-dictionary.json` — starter suggestions
- `db.json` — local mock data source

## Notes

- The app uses a local mock backend during development.
- Unit tests are planned for one of the next phases.
