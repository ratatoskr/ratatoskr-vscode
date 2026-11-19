// Finding Wraith and asking it for Lua types. Nothing here needs VS Code, so it's tested on its own.

const { execFile } = require("node:child_process");
const { existsSync, readFileSync, statSync } = require("node:fs");
const { homedir } = require("node:os");
const { delimiter, join } = require("node:path");

/** What a folder needs from `wraith sdk lua types`, or null if it isn't Wraith Lua. */
function luaKind({ manifests, hasScripts }) {
    if (manifests.some(isLuaManifest)) return "plugin";
    if (hasScripts) return "scripts";
    return null;
}

/** A wraith.json's contents, or null if it isn't a JSON object. */
function parseManifest(text) {
    try {
        const manifest = JSON.parse(text);
        return manifest && typeof manifest === "object" && !Array.isArray(manifest) ? manifest : null;
    } catch {
        return null;
    }
}

/** A plugin manifest that says `"provider": "lua"`. */
function isLuaManifest(manifest) {
    return manifest?.kind === "plugin" && manifest.provider === "lua";
}

/** 4 for a plugin that's only for 32-bit games, like the JS tooling. */
function pointerSize(manifest) {
    const arches = manifest?.arches;
    return Array.isArray(arches) && arches.length === 1 && arches[0] === "x86" ? 4 : 8;
}

/** `wraith sdk lua types` args. Scripts get the API as globals too. Wraith finds the schemas folder itself. */
function typesArgs({ kind, pointerSize: size = 8 }) {
    const args = ["sdk", "lua", "types"];
    if (kind === "scripts") args.push("--globals");
    if (size === 4) args.push("--pointer-size", "4");
    return args;
}

/** wraith.exe paths to try, in order. The setting, WRAITH, the launcher's install, then PATH. */
function* candidates({ setting, env = process.env } = {}) {
    if (setting) yield exeIn(setting);
    if (env.WRAITH) yield exeIn(env.WRAITH);
    const root = env.WRAITH_ROOT ?? join(env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), "Wraith");
    try {
        const current = readFileSync(join(root, "framework", "current.txt"), "utf8").trim();
        yield join(root, "framework", current, "wraith.exe");
    } catch {}
    for (const dir of (env.PATH ?? env.Path ?? "").split(delimiter)) {
        if (dir) yield join(dir, "wraith.exe");
    }
}

/** A folder means its wraith.exe. */
function exeIn(path) {
    try {
        if (statSync(path).isDirectory()) return join(path, "wraith.exe");
    } catch {}
    return path;
}

function findWraith(options) {
    for (const exe of candidates(options)) {
        if (existsSync(exe)) return exe;
    }
    return null;
}

/** Runs it in `cwd`, giving what it printed. */
function run(exe, args, cwd) {
    return new Promise((resolve, reject) => {
        execFile(exe, args, { cwd, windowsHide: true, timeout: 60_000 }, (err, stdout, stderr) => {
            const output = `${stdout}${stderr}`.trim();
            if (err) reject(new Error(output || err.message));
            else resolve(output);
        });
    });
}

module.exports = { luaKind, parseManifest, isLuaManifest, pointerSize, typesArgs, candidates, findWraith, run };
