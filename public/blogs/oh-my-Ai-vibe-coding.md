# Oh My AI-Vibe-Coding :终端流派（Claude Code / OpenCode / Oh My OpenCode）

*Published: 2026-01-19*

这篇文章把三件事一次讲清楚：

1) **Claude Code 如何“搭建/构建”**（安装、在项目里跑起来、基础用法）
2) **OpenCode 如何“搭建/构建”**（安装方式 + 从源码构建本地可执行文件）
3) **oh-my-opencode 如何安装**（把 OpenCode 变成“电池全家桶”的 Agent Harness）

我把命令尽量写成可复制的最短路径；更细的配置项用官方文档链接兜底。

---

## 0. 先说清楚三者关系

- **Claude Code**：Anthropic 官方的终端编程 Agent（“在你的项目里跑”的那种），更偏“开箱即用 + 官方体验”。
- **OpenCode**：开源的终端编程 Agent（provider-agnostic），可以连 Claude / OpenAI / Google / 本地模型等。
- **oh-my-opencode（Oh My OpenCode / OmO）**：一个“插件 + 安装器 + 配置/Agent/工具集”方案，跑在 **OpenCode** 之上，主打多 Agent、LSP/AST、MCP、Hook、Claude Code 兼容层等。

---

## 1) Claude Code 的构建（安装与跑通）

Claude Code 官方仓库：`https://github.com/anthropics/claude-code`  
官方文档：`https://code.claude.com/docs/en/overview`  
安装/排障：`https://code.claude.com/docs/en/setup`

### 1.1 安装（推荐方式）

> 官方 README 明确写了：**npm 安装已 deprecated**，优先用脚本 / brew / winget。

**macOS / Linux（推荐）**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Homebrew（macOS / Linux）**

```bash
brew install --cask claude-code
```

**Windows（PowerShell，推荐）**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**NPM（不推荐，仅做兼容）**

```bash
npm install -g @anthropic-ai/claude-code
```

### 1.2 在你的项目里跑起来

```bash
cd /path/to/your-repo
claude
```

第一次运行一般会引导你完成登录/授权与基础设置；如果遇到网络、证书、代理、登录卡住等问题，直接看官方 setup 文档最省时间：`https://code.claude.com/docs/en/setup`。

### 1.3 一个建议的使用姿势（“vibe coding”不翻车）

- 先让 Claude Code **读仓库与建模**：让它总结目录结构、关键入口、构建/测试命令、约定（lint/format）。
- 再让它 **小步修改 + 频繁验证**：每次改动尽量能 `npm test` / `pnpm lint` / `go test` 这种立即闭环。
- 需要长任务时，把目标拆成 checklist，让它按步骤推进、每步落盘并复核（你也更好 review）。

---

## 2) OpenCode 的构建（安装与从源码构建）

OpenCode 官网：`https://opencode.ai`  
仓库：`https://github.com/anomalyco/opencode`  
安装说明（README）：`https://github.com/anomalyco/opencode#installation`

### 2.1 安装（最快跑通）

**脚本（YOLO）**

```bash
curl -fsSL https://opencode.ai/install | bash
```

**Homebrew（推荐，更新更快）**

```bash
brew install anomalyco/tap/opencode
```

**npm（也可以）**

```bash
npm i -g opencode-ai@latest
```

装完后直接进项目目录运行：

```bash
cd /path/to/your-repo
opencode
```

### 2.2 从源码“构建”（适合想改 OpenCode 本体/做二次开发）

OpenCode 的贡献指南里给了开发与本地构建可执行文件的方式：`https://github.com/anomalyco/opencode/blob/dev/CONTRIBUTING.md`

#### 2.2.1 开发模式（跑 dev）

要求：**Bun 1.3+**

```bash
git clone https://github.com/anomalyco/opencode.git
cd opencode
git checkout dev

bun install
bun dev
```

默认 `bun dev` 会在 `packages/opencode` 目录运行；你也可以指定要在某个目录/仓库里跑：

```bash
bun dev <directory>
# 例如在 opencode 仓库根目录本身运行
bun dev .
```

#### 2.2.2 构建单文件可执行（localcode）

```bash
./packages/opencode/script/build.ts --single
```

构建产物路径（示例）：

```bash
./packages/opencode/dist/opencode-<platform>/bin/opencode
```

把 `<platform>` 替换成你的平台标识（例如 `darwin-arm64`、`linux-x64`）。

---

## 3) oh-my-opencode 的安装（把 OpenCode 变成“电池全家桶”）

项目主页：`https://github.com/code-yeongyu/oh-my-opencode`  
安装指南：`https://github.com/code-yeongyu/oh-my-opencode/blob/dev/docs/guide/installation.md`

### 3.1 安全提醒（务必看一眼）

oh-my-opencode 的 README 顶部有一段很重要的提醒：**存在冒充站点**，请只从 GitHub Releases/仓库文档安装与下载：`https://github.com/code-yeongyu/oh-my-opencode/releases`。

另外，README 里也提到过第三方 OAuth 的合规/ToS 风险与限制（尤其是“用某些方式复用订阅 OAuth”这类做法）。建议你按官方/社区文档走，别碰来路不明的“魔改授权”。

### 3.2 安装前置：先装好 OpenCode

最简单的自检：

```bash
command -v opencode && opencode --version
```

如果 `opencode` 不存在，先按 `https://opencode.ai` / `https://github.com/anomalyco/opencode#installation` 装好。

### 3.3 运行安装器（推荐 bunx）

```bash
bunx oh-my-opencode install
```

没有 bun 也可以用 npm 的方式：

```bash
npx oh-my-opencode install
```

安装器会引导你做 provider/订阅相关的选择，并把插件注册到 OpenCode 的配置里。

### 3.4 非交互安装（适合脚本化/CI 或不想用 TUI）

安装指南提供了 `--no-tui` 以及订阅开关参数（按你实际情况填）：

```bash
bunx oh-my-opencode install --no-tui --claude=<yes|no|max20> --chatgpt=<yes|no> --gemini=<yes|no> --copilot=<yes|no>
```

### 3.5 验证是否安装成功

```bash
opencode --version
cat ~/.config/opencode/opencode.json
```

你应该能在 `opencode.json` 里看到 `oh-my-opencode` 出现在插件列表中（具体键名以你的版本为准）。

### 3.6 登录/授权（按你选的 provider 来）

安装指南给的通用入口是：

```bash
opencode auth login
```

然后在交互界面里选择对应 provider 完成 OAuth/登录流程。

---

## 4) 一个我个人最推荐的工作流（把“vibe”落地）

1. 用 **OpenCode/Claude Code** 先跑一次“仓库体检”：入口、构建命令、测试命令、CI、代码规范。
2. 做功能/重构时，先让 Agent 输出“变更计划 + 风险点 + 回滚策略”，再开始改。
3. 让 Agent 每一步都给出可执行验证命令（`test/lint/build`），你只要看终端输出就能把控质量。
4. 需要更强的“团队化”体验时，再上 **oh-my-opencode**：多 Agent 分工、后台探索、LSP/AST 工具链，效率会明显上一个台阶。

