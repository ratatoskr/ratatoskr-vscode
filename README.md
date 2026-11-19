# Ratatoskr for VS Code

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
