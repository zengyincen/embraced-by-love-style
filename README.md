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

首次发布前，在 npm 创建一个用于 CI 的细粒度访问令牌：

1. 打开 [npm Granular Access Tokens](https://www.npmjs.com/settings/zengyincen/tokens/granular-access-tokens/new)；
2. 将 Packages and scopes 设为 Read and write；首次创建包时选择 All packages；
3. 开启 Bypass two-factor authentication，并设置合理的有效期；
4. 在 GitHub 仓库的 Settings → Secrets and variables → Actions 中新增 `NPM_TOKEN`；
5. 打开 Actions → Publish to npm → Run workflow。

工作流会依次安装依赖、运行测试，并使用 provenance 发布当前 `package.json` 中的版本。不得把令牌写进仓库文件、Issue 或聊天记录。

发布新版本时修改 Skill，确认测试通过，再提交新的版本号：

```bash
npm test
npm version patch
git push --follow-tags
```

推送后再次手动运行发布工作流。较大的功能变化可将 `patch` 换为 `minor` 或 `major`。

首次发布成功后，可以在 npm 包设置中将此仓库配置为 Trusted Publisher，再从工作流移除 `NPM_TOKEN`，完全改用短期 OIDC 凭证。

## 项目结构

```text
skill/embraced-by-love-style/  Skill 本体
bin/cli.mjs                   npx 安装与安全更新程序
test/install.test.mjs         安装、备份、dry-run 测试
```

## License

MIT
