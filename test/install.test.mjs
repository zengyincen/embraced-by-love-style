import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url));
const CLI = path.join(PACKAGE_ROOT, "bin", "cli.mjs");
const SKILL_NAME = "embraced-by-love-style";
const PACKAGE_VERSION = JSON.parse(
  readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
).version;

function runCli(...args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
  });
}

function withTempDirectory(callback) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "embraced-style-test-"));
  try {
    callback(directory);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

test("installs the complete skill into a custom skills root", () => {
  withTempDirectory((directory) => {
    const skillsRoot = path.join(directory, "skills");
    const result = runCli("--target", skillsRoot);
    const target = path.join(skillsRoot, SKILL_NAME);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /已安装/);
    assert.ok(existsSync(path.join(target, "SKILL.md")));
    assert.ok(existsSync(path.join(target, "agents", "openai.yaml")));
    assert.ok(existsSync(path.join(target, "references", "style-profile.md")));

    const metadata = JSON.parse(
      readFileSync(path.join(target, ".embraced-by-love-style.json"), "utf8"),
    );
    assert.equal(metadata.name, SKILL_NAME);
    assert.equal(metadata.version, PACKAGE_VERSION);
  });
});

test("backs up an existing installation before updating", () => {
  withTempDirectory((directory) => {
    const skillsRoot = path.join(directory, "skills");
    const first = runCli("--target", skillsRoot);
    assert.equal(first.status, 0, first.stderr);

    const target = path.join(skillsRoot, SKILL_NAME);
    writeFileSync(path.join(target, "local-note.txt"), "keep me\n");

    const second = runCli("--target", skillsRoot);
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /已更新/);
    assert.ok(!existsSync(path.join(target, "local-note.txt")));

    const backupRoot = path.join(skillsRoot, `.${SKILL_NAME}-backups`);
    const backups = readdirSync(backupRoot);
    assert.equal(backups.length, 1);
    assert.equal(
      readFileSync(path.join(backupRoot, backups[0], "local-note.txt"), "utf8"),
      "keep me\n",
    );
  });
});

test("dry-run makes no filesystem changes", () => {
  withTempDirectory((directory) => {
    const skillsRoot = path.join(directory, "not-created");
    const result = runCli("--target", skillsRoot, "--dry-run");

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /将安装/);
    assert.ok(!existsSync(skillsRoot));
  });
});
