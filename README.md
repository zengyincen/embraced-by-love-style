# Embraced by Love Style

一个从个人作品中蒸馏出的中文文风 Skill，适用于 Codex 中的散文、随笔、书信、短诗、成长叙事、年终回望、续写、润色与审稿。

它保留温柔内省、时间折返、具体物象、现实扎根和克制希望，也会主动抑制辞藻堆叠、重复升华、空泛金句与未经核实的典故。

## 安装或更新

```bash
npx embraced-by-love-style@latest
```

再次执行同一命令即可更新。更新前，安装器会把原目录完整备份到：

```text
~/.codex/skills/.embraced-by-love-style-backups/
```

预览操作或指定其他 Codex skills 目录：

```bash
npx embraced-by-love-style@latest --dry-run
npx embraced-by-love-style@latest --target /path/to/skills
```

## 使用

```text
$embraced-by-love-style 根据这些真实素材，写一篇中度文风的成长散文。
```

```text
$embraced-by-love-style 保留事实和我的口吻，删去文章中过度矫情、意象拥挤的部分。
```

默认采用中度文风。可以明确要求轻度、中度或高度浓度。

## 本地迭代

Skill 源文件位于 `skill/embraced-by-love-style/`。修改后依次运行：

```bash
npm test
npm run install:local
```

## 通过 GitHub Actions 发布

在 npm 包设置的 Trusted Publisher 中绑定 GitHub Actions：

1. 打开 npm 上的 `embraced-by-love-style` 包设置；
2. Publisher 选择 GitHub Actions；
3. Organization or user 填写 `zengyincen`；
4. Repository 填写 `embraced-by-love-style`；
5. Workflow filename 填写 `publish.yml`；
6. Environment 留空，Allowed actions 选择 `npm publish`。

工作流使用 npm Trusted Publishing 的短期 OIDC 凭证，不需要 `NPM_TOKEN`。它会依次安装依赖、运行测试、发布当前版本并自动生成 provenance。

发布新版本时修改 Skill，确认测试通过，再提交新的版本号：

```bash
npm test
npm version patch
git push --follow-tags
```

推送 `v*` 标签后会自动发布，也可以在 GitHub Actions 页面手动运行。较大的功能变化可将 `patch` 换为 `minor` 或 `major`。

## 项目结构

```text
skill/embraced-by-love-style/  Skill 本体
bin/cli.mjs                   npx 安装与安全更新程序
test/install.test.mjs         安装、备份、dry-run 测试
```

## License

MIT
