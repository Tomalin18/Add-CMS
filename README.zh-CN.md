# Add CMS

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**你的网站，现在可以编辑了。**

为现有 React 网站添加可视化 CMS 的 agent Skill 与可复用组件。保留原前台设计、路由与交互，将内容连接到需要登录的编辑界面、草稿、预览与发布流程。

[阅读 Skill](SKILL.md) · [集成指南](references/install.md) · [Adapter 契约](references/adapter-contract.md)

https://github.com/user-attachments/assets/e38ffbe1-c3a9-4af2-ab3b-2fa9000a3e9d

73 秒、1080p 产品演示：原页面 → 编辑 → 换图 → 发布 → 更新后页面。影片使用真实编辑器状态和已验证的合成内容制作 UI 动画，登录输入为合成演示。

## ✨ 可以编辑什么

内容通过明确映射接入 CMS，前台仍由你自己的组件渲染。

| 内容 | 编辑流程 |
| --- | --- |
| **文字** | 在画布直接编辑；rich 存储保留允许的格式，普通字段保留类型校验。 |
| **图片与文件** | 点击目标打开小工具、选择文件并替换引用，保留共享原文件。 |
| **链接** | 一起修改显示文字与目标，可选已登记的站内页面。 |
| **共享区块** | 同一画布编辑 header/footer，底层维持唯一数据来源。 |
| **草稿与发布** | 先将最新输入同步到原生 CMS 表单，再由服务端处理权限、预览、版本与发布。 |

## 📦 安装 Skill

将以下 prompt 交给支持项目内 Skill 的 coding agent。安装的是包含组件、模板与脚本的完整包，而不只是 `SKILL.md`。

```text
请为此项目安装 https://github.com/Tomalin18/Add-CMS 的 Add CMS skill（add-cms）。先阅读根目录 SKILL.md，获取完整源码包，保留 src/、templates/、scripts/、references/、fixtures/、data/mock/、locks/、package.json、product.json、LICENSE 及 notices/ 的相对结构。

识别当前 agent，按其官方文档采用项目内的 Skill 安装方式，不覆盖已有同名 Skill 或全局设置。确认 frontmatter name 为 add-cms、引用资源完整且 agent 能发现后，再在本项目使用。如远端没有源码或 agent 不支持 Skill，报告具体阻碍，不声称安装成功。
```

按当前 agent 支持的项目内 Skill 流程安装完整仓库包。安装只复制源码与资源，不会建立 CMS、安装后台依赖或变更凭据。源码安装与资源检查已在隔离临时项目验证。

### 使用已安装的 Skill

```text
请对当前网站使用已安装的 Add CMS skill。先阅读 SKILL.md，检查实际框架、渲染、部署、认证、数据库与内容来源。如有不支持的集成要求，先说明具体差异。

盘点已有文字、图片、下载文件、链接和共享 header/footer，保留原前台设计、路由与交互。沿用包内组件和 typed adapter，串起编辑、单一原生保存流程、草稿、授权预览、发布和前台渲染。使用隔离数据验证保存重载、冲突、回滚和私有媒体权限。不要另造网站、静默用假 CMS 替代，或未经授权创建账号及部署。
```

## 集成范围

随附集成面向 **React 19 + Next.js App Router + Payload 3.92**，需要 Node.js 22 以上。可保留现有 React 组件，但每个网站仍需明确的内容映射、原 renderer 和服务端存储／权限 adapter。其他框架、非 React 页面、高级调度和多语言发布需要额外工程与验证；本项目不是托管服务，也不是任意网站转换器。

<details>
<summary>锁定技术版本与集成要求</summary>

已验证环境：React／React DOM 19.2.4、Next.js App Router 16.4.3，需要 Node.js 22 以上。

| 核心技术 | 精确版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| [Payload](https://github.com/payloadcms/payload) | 3.92.0 | MIT | 可选后台：管理界面、权限、原生表单、媒体、草稿和版本 |
| [Puck](https://github.com/puckeditor/puck) | 0.23.0 | MIT | 映射内容画布及编辑器 UI／history API |
| [Tiptap](https://github.com/ueberdosis/tiptap) | 3.32.0 | MIT | 富文本、图片、YouTube 和段落拖动 |
| [React Aria](https://github.com/adobe/react-spectrum) | 1.22.1 | Apache-2.0 | 无障碍菜单、色盘、浮动工具和文件选择 |

Payload 客户端集成需要**自定义 document edit view**，组合 `PayloadCanvasForm` 与配套的 `PayloadCanvasPublish`／`PayloadCanvasAutosave` 控制器。它们先 flush 画布，再进入唯一的原生 `Form.submit` 流程。**这不是 `DefaultEditView` 的即插即用替换组件**：只加入字段，或保留默认 Publish／Autosave 控制器，都不能确保获取表单快照前已 flush。高级调度及多 locale 流程仍需额外集成与验证。

目标网站需提供稳定字段 ID、带类型的路径、实际前端 renderer、路由清单、内容／样式策略、本地化文案及 CMS 权限／存储 adapter。模板是可选的工厂，不是完整安全策略。原生表单必须是唯一 writer。纯字符串支持文字修改；持久化 rich marks 需要真正的 rich storage。替换图片／下载文件会建立新的不可变资产；取消链接只移除引用。

每个 SQLite 文件仅支持一个 Payload 所有者进程。外部 writer 的 `SQLITE_BUSY` 会使写入拒绝执行，直到受控重启；多进程须使用另一个已验证的数据库／adapter。所有权不明的私有媒体必须重新上传，不可猜测或回填上传者。Metadata fingerprint 不是文件字节摘要：服务器 hooks 必须禁止同 ID 替换文件，并强制媒体 ACL、MIME／字节／大小验证及发布检查。

另有隔离 demo 验证过 **仅限 macOS arm64** 的 no-sharp 后台 profile，明确选用 MIT 平台二进制包并省略 optional 依赖。已验证原图上传、尺寸读取、私有草稿与授权发布；不提供缩放、裁剪、模糊图生成或图片优化。这不代表完整可选后台 fixture 已获授权放行、其他平台已受支持，或其独立 notices 已解决。

</details>

## 外观与验收

编辑器有 scoped styles 与功能性 shell，并非完全 headless。公开页面 CSS 保持主导；仅在需要身份验证的编辑 layout 导入 `puck.css`、`editor.css`、`canvas.css`。`PuckShell.className` 可限定附加样式范围。`editorThemeVariables` 接受 surface、text、border、focus、hover、selected 的六位十六进制色码；应用至已验证的 document 根节点（含 iframe 根节点），让 body portal 继承，勿带入公开 renderer。

Locale／文案及允许的字体／颜色策略由调用方提供。Vendor overrides 受锁定版本的 Puck、Payload、Tiptap API 限制。Tokens 不代表能替换每个 vendor control；保留可见焦点与足够对比。

使用另一网站的合成 fixture、临时 SQLite coordinator 测试、archive／hash／隐私检查及完整 HTTP 响应；失败 commit 后也要检查持久化值。这些检查不能证明生产身份验证或视觉验收：外观、滚动、下拉菜单、日文 IME、OS 文件选择、播放与无障碍仍由用户验收。不支持图片文字环绕或任意 iframe 插入。

## 开发

参与开发前先读 [AGENTS.md](AGENTS.md)。从 `dev` 创建 `feat/` 或 `fix/` 分支，使用合成数据验证受影响的集成。

<details>
<summary>运行隔离 fixture</summary>

先读 [Skill](SKILL.md) 与[安装及验证](references/install.md)，包含 artifact 检查与 release gate。封装版使用 `assets/runtime`、`assets/integration`、`assets/fixture`；源码 checkout 使用 `src`、`templates`、`fixtures` 与合成数据 `data/mock`。安装器拒绝已存在的目标目录，不修改 host 配置或凭据。

**已解压的 archive：**在含 `MANIFEST.json` 的目录执行：

```sh
node scripts/install-fixture.mjs /tmp/new-cms-fixture
cd /tmp/new-cms-fixture
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run types
npm run build
node fixture/check-http.mjs
```

**源码 checkout：**将上述第一行替换为在 repository 根目录执行 `node scripts/prepare-portable-fixture.mjs /tmp/new-cms-fixture`，再于新目录执行其余相同命令。Prepare 脚本是 repository 工具，不是 archive 入口。

一律选新的临时目录。基础评估使用 React 与锁定版本、MIT 许可的 esbuild 工具链，不安装 Next、Payload、SQLite 或 sharp／libvips。公开输出只用公开 CSS；编辑器 CSS／JavaScript 只属于默认禁用的私有 fixture 路由。Fixture flag 不能充当生产环境身份验证。

独立的 Payload fixture 及其锁文件需主动选用，许可仍未澄清。从 source 执行 `node scripts/prepare-payload-fixture.mjs . /tmp/new-cms-payload-fixture`；从解压的 archive 执行 `node scripts/install-payload-fixture.mjs /tmp/new-cms-payload-fixture`。后端验证命令见[安装及验证](references/install.md)。实际目标项目仍需真正的身份验证、ACL、服务器验证及经授权的 schema 变更。

</details>

## 🔒 安全风险

`/admin` 路径或后台子域名本身不是访问防护。正式部署前需评估 UI、API、上传、媒体、预览、版本及发布的服务端认证与权限，公开只读内容不得泄漏草稿或开放管理写入；还需检查首位管理员创建、登录和 session 策略、HTTPS／cookies、CORS／CSRF、私有媒体缓存、备份及依赖更新。模板不会自动完成正式环境加固或 MFA。

应用权限、身份网关和 VPN／私有网络解决不同层次的问题。网关仍需防止源站、其他部署域名或 API 绕过，且可能保留独立 CMS 登录；私有网络也不替代应用权限。本 Skill 不指定供应商或部署方案。

[Payload access control](https://payloadcms.com/docs/access-control/overview) · [Payload authentication](https://payloadcms.com/docs/authentication/overview) · [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) · [Origin token validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) · [Deployment domains](https://vercel.com/docs/domains/working-with-domains) · [WireGuard](https://www.wireguard.com/quickstart/)

## 状态与许可

开发版本 **0.3.0**，软件包 **`@add-cms/core`**。Add CMS 原创代码采用 [MIT](LICENSE) 许可，第三方组件及媒体保留各自条款。Source-only 交付包含编辑器、集成工厂、合成 fixture、精确依赖锁文件与验证脚本；不含原网站内容、adapter、设置、媒体、数据库、凭据或已安装的第三方代码。独立合成演示网站已实际完成认证编辑、草稿保存、预览与发布；这不等于跨浏览器或正式部署安全认证。

原创代码可按 MIT 公开；依赖包分发的第三方 notices 仍有待补齐；见[通知审查](notices/portable-release-review.json)。可选的 Payload／Next 后端 fixture 有另一组尚未澄清的完整依赖链，包含 LGPL 许可的 sharp／libvips 原生组件及其他待审许可；编辑器 audit 不涵盖该依赖链。不附 `node_modules` 并不表示安装或再分发义务已澄清。本仓库没有内附已安装的依赖实现或原生二进制；分发编译后的应用或依赖包仍需单独审查。

部分精确发行版的后台许可原文已保留在[后台 notices](notices/payload-backend-THIRD-PARTY-NOTICES.txt)，不代表完整依赖链已获放行。

演示配乐：**2:23 AM — しゃろう**。配乐已确认可随这支演示视频公开发布，不作为独立音乐资产提供，也不适用源码许可。

## 📚 来源与致谢

可选后台集成使用 [Payload](https://github.com/payloadcms/payload) 提供管理界面、原生表单、数据、权限、媒体、草稿和版本；可视化编辑使用 [Puck](https://github.com/puckeditor/puck), [Tiptap](https://github.com/ueberdosis/tiptap), [React Spectrum / React Aria](https://github.com/adobe/react-spectrum)。精确 registry artifacts 与 notices 另行审查。Plate 的 [editable font-size interaction](https://github.com/udecode/plate/blob/main/apps/www/src/registry/ui/font-size-toolbar-button.tsx) 是交互参考；未包含 Slate／Plus 实现。保留的 MIT 致谢见 [Plate notice](notices/Plate-INTERACTION-REFERENCE-MIT.txt)。

Skill 结构于 2026-10-27 研究 [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md), [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md), [Vercel React best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md)：精简的 discovery metadata、渐进式 references、可执行检查及有证据的规则。这些是结构参考，非复制的 runtime 实现或背书；`main` 链接不是不可变发行版 pins。OpenAI skills repository 已由 [openai/plugins](https://github.com/openai/plugins) 取代，本软件包不采用过时安装指示。Anthropic 文档 skills 有独立的 source-available 条款，未对其整个 repository 宣称统一许可。未将任何第三方许可应用到所有者的原创代码。

README 研究仅借鉴组织与呈现方式，未复制第三方文案、品牌图片、徽章或示例实现。

| 参考来源 | 采用的方法 |
| --- | --- |
| [Crafting Effective READMEs](https://github.com/softaworks/agent-toolkit/tree/main/skills/crafting-effective-readmes) | 以读者需求开场，分清安装／使用／开发；MIT。 |
| [awesome-readme](https://github.com/matiassingers/awesome-readme) | 挑选注重视觉与任务流程的示例；列表采用 CC0 权利放弃声明。 |
| [Puck README](https://github.com/puckeditor/puck/blob/main/README.md) | 先展示产品，再区分编辑器与 renderer 集成；MIT 项目。 |
| [Refine Core README](https://github.com/refinedev/refine/blob/main/packages/core/README.md) | 说明用途、集成边界和示例入口；MIT 项目。 |
| [Vercel Agent Skills README](https://github.com/vercel-labs/agent-skills/blob/main/README.md) | Skill 发现、安装、使用和包结构。README 标示 MIT，未找到根目录 LICENSE，未复制其内容。 |
