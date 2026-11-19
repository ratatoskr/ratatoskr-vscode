// Keeps the LuaLS types in Lua plugins and Workbench script folders in step with the installed
// Wraith. It runs `wraith sdk lua types`, which writes .wraith/types and a .luarc.json if there
// isn't one. The Lua extension (sumneko.lua) picks that up on its own.

const vscode = require("vscode");
const wraith = require("./wraith");

/** @type {vscode.OutputChannel} */
let output;
const pending = new Map();
let warnedNoWraith = false;

function activate(context) {
    output = vscode.window.createOutputChannel("Wraith");
    context.subscriptions.push(output);
    context.subscriptions.push(vscode.commands.registerCommand("wraith.updateLuaTypes", () => updateAll(context, true)));
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => updateAll(context, false)));

    // Schemas are typed too, and so are the plugins wraith.json depends on, so a change to either wants them again
    const watcher = vscode.workspace.createFileSystemWatcher("**/{*.sal,wraith.json}");
    const changed = (uri) => {
        const folder = vscode.workspace.getWorkspaceFolder(uri);
        if (folder) later(context, folder);
    };
    watcher.onDidChange(changed);
    watcher.onDidCreate(changed);
    watcher.onDidDelete(changed);
    context.subscriptions.push(watcher);

    updateAll(context, false);
}

function deactivate() {
    for (const t of pending.values()) clearTimeout(t);
}

/** After a burst of saves settles. */
function later(context, folder) {
    const key = folder.uri.toString();
    clearTimeout(pending.get(key));
    pending.set(key, setTimeout(() => {
        pending.delete(key);
        update(context, folder, false);
    }, 500));
}

async function updateAll(context, asked) {
    const folders = vscode.workspace.workspaceFolders ?? [];
    let any = false;
    for (const folder of folders) any = (await update(context, folder, asked)) || any;
    if (asked && !any) vscode.window.showInformationMessage("Wraith: there's no Lua plugin or .rws.lua script here to type.");
}

/** True if it's a Wraith Lua folder. */
async function update(context, folder, asked) {
    if (folder.uri.scheme !== "file") return false;
    const config = vscode.workspace.getConfiguration("wraith", folder.uri);
    if (!asked && !config.get("luaTypes", true)) return false;

    const manifests = (await Promise.all((await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "wraith.json"), null, 1)).map(read)))
        .map(wraith.parseManifest)
        .filter(Boolean);
    const scripts = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "**/*.rws.lua"), "**/node_modules/**", 1);
    const kind = wraith.luaKind({ manifests, hasScripts: scripts.length > 0 });
    if (!kind) return false;

    const exe = wraith.findWraith({ setting: config.get("path") });
    if (!exe) {
        if (asked || !warnedNoWraith) vscode.window.showWarningMessage("Wraith: no wraith.exe found for Lua types. Install the Wraith app, or set wraith.path.");
        warnedNoWraith = true;
        return true;
    }
    const root = folder.uri.fsPath;
    const manifest = manifests.find(wraith.isLuaManifest) ?? null;
    const args = wraith.typesArgs({ kind, pointerSize: wraith.pointerSize(manifest) });
    try {
        const said = await wraith.run(exe, args, root);
        output.appendLine(`${root}: ${exe} ${args.join(" ")}\n${said}`);
        if (asked) vscode.window.showInformationMessage(`Wraith: Lua types updated in ${folder.name}.`);
    } catch (e) {
        output.appendLine(`${root}: ${exe} ${args.join(" ")} failed\n${e.message}`);
        if (asked) vscode.window.showErrorMessage(`Wraith: couldn't update the Lua types. See the Wraith output.`);
    }
    suggestLuaExtension(context);
    return true;
}

/** Once, since the types are only any good with it. */
function suggestLuaExtension(context) {
    if (vscode.extensions.getExtension("sumneko.lua") || context.globalState.get("suggestedLua")) return;
    context.globalState.update("suggestedLua", true);
    vscode.window.showInformationMessage("Wraith: install the Lua extension (sumneko.lua) for completions and type checks from Wraith's types.", "Show it").then((pick) => {
        if (pick) vscode.commands.executeCommand("workbench.extensions.search", "sumneko.lua");
    });
}

async function read(uri) {
    return Buffer.from(await vscode.workspace.fs.readFile(uri)).toString("utf8");
}

module.exports = { activate, deactivate };
