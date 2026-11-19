# Wraith for VS Code

Language support for [Wraith](https://wraith.io)'s files, for modding Windows games.

| File | You get |
| --- | --- |
| `.rwt` tweaks | Highlighting, with the asm, JS, Lua and schemas inside highlighted too, plus snippets |
| `.sal` schemas | Highlighting and snippets, from the Salamander extension, which comes with this one. Plus `[Sig]` and `[VirtualTable]` |
| `.rws.js` `.rws.lua` scripts | Opened as JavaScript or Lua. Lua ones get types |
| Lua plugins | Types for `require("wraith")` and your schemas |
| `wraith.json` | Checked against the [Wraith Hub](https://hub.wraith.io)'s schema as you type |
| `.rwa.zon` `.rwp.zon` | Opened as ZON. Install the Zig extension for highlighting |

## Lua types

Open a Lua plugin's folder, or one with `.rws.lua` scripts, and it runs `wraith sdk lua types` there, so the [Lua extension](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) gets completions and type checks for the Wraith you have. It runs again when a `.sal` file changes. **Wraith: Update Lua types** runs it now.

| Setting | Does |
| --- | --- |
| `wraith.luaTypes` | Turn it off to leave your types alone |
| `wraith.path` | Where `wraith.exe` is, if it isn't found on its own |

More in the [docs](https://docs.wraith.io/tools/vscode/).

Pre-release. Expect breaking changes.

## License

MIT, see [LICENSE](LICENSE).
