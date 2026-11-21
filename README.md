# Ratatoskr for VS Code

[![CI](https://img.shields.io/github/actions/workflow/status/ratatoskr/ratatoskr-vscode/main_ci.yml?branch=main&label=CI)](https://github.com/ratatoskr/ratatoskr-vscode/actions/workflows/main_ci.yml)
[![License](https://img.shields.io/github/license/ratatoskr/ratatoskr-vscode)](https://github.com/ratatoskr/ratatoskr-vscode/blob/main/LICENSE)
[![Salamander](https://vsmarketplacebadges.dev/version-short/ratatoskr.salamander-schemas.svg?label=Salamander)](https://marketplace.visualstudio.com/items?itemName=ratatoskr.salamander-schemas)
[![Wraith](https://vsmarketplacebadges.dev/version-short/ratatoskr.wraith.svg?label=Wraith)](https://marketplace.visualstudio.com/items?itemName=ratatoskr.wraith)

VS Code extensions for Ratatoskr, published from one repo.

- [Salamander](packages/salamander): `.sal` schemas.
- [Wraith](packages/wraith): tweaks, scripts, address lists and projects. Needs Salamander.

## Building

You need Node 20 or newer.

```
npm install
npm test
npm run package
```

`npm run package` makes `packages/*/*.vsix`. Install one with **Extensions: Install from VSIX...**, or use **Run Salamander** or **Run Wraith** under Run and Debug to try one in a new window.

Want to help? See [CONTRIBUTING.md](https://github.com/ratatoskr/.github/blob/main/CONTRIBUTING.md). Found a security problem? See [SECURITY.md](https://github.com/ratatoskr/.github/blob/main/SECURITY.md).

## License

MIT, see [LICENSE](LICENSE).
