const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, mkdirSync, rmSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { candidates, luaKind, parseManifest, pointerSize, typesArgs } = require("../src/wraith");

test("lua plugins and script folders", () => {
    const lua = parseManifest('{\n  "id": "a",\n  "kind": "plugin",\n  "title": "A",\n  "provider": "lua"\n}');
    const js = parseManifest('{ "id": "b", "kind": "plugin", "provider": "js" }');
    assert.equal(luaKind({ manifests: [lua], hasScripts: false }), "plugin");
    assert.equal(luaKind({ manifests: [js], hasScripts: true }), "scripts");
    assert.equal(luaKind({ manifests: [js], hasScripts: false }), null);
    assert.equal(luaKind({ manifests: [{ kind: "project", provider: "lua" }], hasScripts: false }), null);
});

test("manifests that aren't JSON objects are skipped", () => {
    assert.equal(parseManifest("{ broken"), null);
    assert.equal(parseManifest("[]"), null);
    assert.equal(parseManifest("null"), null);
});

test("32-bit only plugins get 4-byte pointers", () => {
    assert.equal(pointerSize({ arches: ["x86"] }), 4);
    assert.equal(pointerSize({ arches: ["x86", "x64"] }), 8);
    assert.equal(pointerSize({}), 8);
    assert.equal(pointerSize(null), 8);
});

test("types args", () => {
    assert.deepEqual(typesArgs({ kind: "plugin" }), ["sdk", "lua", "types"]);
    assert.deepEqual(typesArgs({ kind: "plugin", pointerSize: 4 }), ["sdk", "lua", "types", "--pointer-size", "4"]);
    assert.deepEqual(typesArgs({ kind: "scripts" }), ["sdk", "lua", "types"]);
});

test("wraith is looked for in order", () => {
    const root = mkdtempSync(join(__dirname, "tmp-"));
    try {
        mkdirSync(join(root, "framework"));
        writeFileSync(join(root, "framework", "current.txt"), "v1.2.3\n");
        // A real folder for PATH, since "C:\\bin" splits on its colon off Windows, where CI runs
        const bin = join(root, "bin");
        const found = [...candidates({ setting: "C:\\set\\wraith.exe", env: { WRAITH: "C:\\env\\wraith.exe", WRAITH_ROOT: root, PATH: bin } })];
        assert.deepEqual(found, ["C:\\set\\wraith.exe", "C:\\env\\wraith.exe", join(root, "framework", "v1.2.3", "wraith.exe"), join(bin, "wraith.exe")]);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
});
