# Contributing

Thanks for your interest! This is a small hobby project, so a few rules keep it manageable.

## Before you start

- **Bugs** - open an issue using the bug report form. Include the log and your app version.
- **Bigger changes or new features** - open an issue first and wait for a reply before writing code. Pull requests that were not discussed may be closed.
- **Small fixes** (typos, translations, obvious bugs) - a pull request straight away is fine.

## Development setup

```bash
npm install
npm start
```

See the *Development* section of the [README](README.md) for the project layout and debug switches.

## Guidelines

- **One topic per pull request.** Do not mix refactoring, formatting and features.
- **Code, comments and commit messages in English.**
- **UI texts** go to `lib/i18n.js`, with an entry for every language. Do not hard-code strings in `renderer/` or `main.js`.
- **No new dependencies** without discussing them first. The UI is plain HTML/CSS/JS on purpose.
- **Follow the existing style** - 2-space indentation, single quotes, semicolons (see `.editorconfig`).
- **Keep the store happy** - do not increase request parallelism or remove the retry delays.
- **Do not commit** `dist/`, `node_modules/`, `library.json`, screenshots or personal paths.

## Pull requests

1. Fork the repository and create a branch from `main` (`fix/import-matching`, `feat/folder-picker`).
2. Make your change and test it with `npm start`.
3. Open the pull request and fill in the template. The *Build* check must pass.
4. Pull requests are squash-merged, so the title becomes the commit message - keep it short and descriptive.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
