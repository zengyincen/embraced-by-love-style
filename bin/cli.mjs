#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "embraced-by-love-style";
const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url));
const PAYLOAD_ROOT = path.join(PACKAGE_ROOT, "skill", SKILL_NAME);
const PACKAGE_JSON = JSON.parse(
  readFileSync(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
);

const HELP = `Embraced by Love 文风 Skill 安装器

用法：
  npx embraced-by-love-style@latest [选项]

选项：
  --target <目录>  指定 Codex skills 根目录
  --dry-run        只显示将要执行的操作
  --version        显示 npm 包版本
  --help           显示帮助

默认安装位置：
  $CODEX_HOME/skills/embraced-by-love-style
  未设置 CODEX_HOME 时使用 ~/.codex/skills/embraced-by-love-style
`;

function fail(message) {
  process.stderr.write(`错误：${message}\n`);
  process.exitCode = 1;
}

function parseArgs(argv) {
  const options = { dryRun: false, target: undefined };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--target 需要一个目录参数");
      }
      options.target = value;
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--version" || argument === "-v") {
      options.version = true;
    } else {
      throw new Error(`未知参数 ${argument}`);
    }
  }

  return options;
}

function defaultSkillsRoot() {
  const codexRoot = process.env.CODEX_HOME;
  return codexRoot
    ? path.join(codexRoot, "skills")
    : path.join(os.homedir(), ".codex", "skills");
}

function verifyPayload() {
  for (const entry of ["SKILL.md", "agents", "references"]) {
    if (!existsSync(path.join(PAYLOAD_ROOT, entry))) {
      throw new Error(`npm 包缺少 Skill 资源：${entry}`);
    }
  }
}

function copyPayload(destination) {
  mkdirSync(destination, { recursive: true });

  for (const entry of ["SKILL.md", "agents", "references"]) {
    cpSync(path.join(PAYLOAD_ROOT, entry), path.join(destination, entry), {
      recursive: true,
    });
  }

  writeFileSync(
    path.join(destination, ".embraced-by-love-style.json"),
    `${JSON.stringify(
      {
        name: PACKAGE_JSON.name,
        version: PACKAGE_JSON.version,
        installedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

function backupName() {
  return new Date().toISOString().replaceAll(":", "-");
}

function install(options) {
  verifyPayload();

  const skillsRoot = path.resolve(options.target ?? defaultSkillsRoot());
  const target = path.join(skillsRoot, SKILL_NAME);
  const replacing = existsSync(target);

  if (options.dryRun) {
    process.stdout.write(
      `${replacing ? "将更新" : "将安装"} ${SKILL_NAME}@${PACKAGE_JSON.version}\n目标：${target}\n`,
    );
    if (replacing) {
      process.stdout.write("现有版本会先完整备份。\n");
    }
    return;
  }

  mkdirSync(skillsRoot, { recursive: true });
  const stageRoot = mkdtempSync(path.join(skillsRoot, `.${SKILL_NAME}-staging-`));
  const stagedTarget = path.join(stageRoot, SKILL_NAME);
  let backup;

  try {
    copyPayload(stagedTarget);

    if (replacing) {
      const backupRoot = path.join(skillsRoot, `.${SKILL_NAME}-backups`);
      mkdirSync(backupRoot, { recursive: true });
      backup = path.join(backupRoot, backupName());
      renameSync(target, backup);
    }

    try {
      renameSync(stagedTarget, target);
    } catch (error) {
      if (backup && !existsSync(target) && existsSync(backup)) {
        renameSync(backup, target);
      }
      throw error;
    }
  } finally {
    if (existsSync(stageRoot)) {
      rmSync(stageRoot, { force: true, recursive: true });
    }
  }

  process.stdout.write(
    `${replacing ? "已更新" : "已安装"} ${SKILL_NAME}@${PACKAGE_JSON.version}\n位置：${target}\n`,
  );
  if (backup) {
    process.stdout.write(`备份：${backup}\n`);
  }
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
  } else if (options.version) {
    process.stdout.write(`${PACKAGE_JSON.version}\n`);
  } else {
    install(options);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
