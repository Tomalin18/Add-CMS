# Add CMS

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**你的網站，現在可以編輯了。**

為既有 React 網站加入可視化 CMS 的 agent Skill 與可重用元件。保留原前台設計、路由與互動，將內容接到需登入的編輯介面、草稿、預覽與發布流程。

[閱讀 Skill](SKILL.md) · [整合指引](references/install.md) · [Adapter 契約](references/adapter-contract.md)

https://github.com/user-attachments/assets/e38ffbe1-c3a9-4af2-ab3b-2fa9000a3e9d

73 秒、1080p 產品示範：原頁 → 編輯 → 換圖 → 發布 → 更新後頁面。影片以真實編輯器狀態及已驗證的合成內容製作 UI 動畫，登入輸入為合成示範。

## ✨ 可以編輯什麼

內容透過明確映射接入 CMS，前台仍由你自己的元件渲染。

| 內容 | 編輯流程 |
| --- | --- |
| **文字** | 在畫布直接編輯；rich 儲存保留允許的格式，普通欄位保留型別驗證。 |
| **圖片與檔案** | 點目標開小工具、選檔並替換引用，保留共用原檔。 |
| **連結** | 一起修改顯示文字與目的地，可選已登錄的站內頁面。 |
| **共用區塊** | 同一畫布編輯 header/footer，底層維持唯一資料來源。 |
| **草稿與發布** | 先將最新輸入同步到原生 CMS 表單，再由伺服器處理權限、預覽、版本與發布。 |

## 📦 安裝 Skill

將以下 prompt 交給支援專案內 Skill 的 coding agent。安裝的是包含元件、模板與腳本的完整套件，不只是 `SKILL.md`。

```text
請為此專案安裝 https://github.com/Tomalin18/Add-CMS 的 Add CMS skill（add-cms）。先讀根目錄 SKILL.md，取得完整原始碼套件，保留 src/、templates/、scripts/、references/、fixtures/、data/mock/、locks/、package.json、product.json、LICENSE 及 notices/ 的相對結構。

辨識目前的 agent，依其官方文件採用專案內的 Skill 安裝方式，不覆寫既有同名 Skill 或全域設定。確認 frontmatter name 為 add-cms、引用資源齊全且 agent 能辨識後，才在本專案使用。若遠端沒有原始碼或 agent 不支援 Skill，回報具體阻礙，不假稱已安裝。
```

依目前 agent 支援的專案內 Skill 流程安裝完整儲存庫套件。安裝只複製原始碼與資源，不會建立 CMS、安裝後台依賴或變更帳密。原始碼安裝與資源檢查已在隔離暫存專案驗證。

### 使用已安裝的 Skill

```text
請對目前網站使用已安裝的 Add CMS skill。先讀 SKILL.md，檢查實際框架、渲染、部署、登入、資料庫與內容來源。若有不支援的整合需求，先說明具體差異。

盤點既有文字、圖片、下載檔案、連結及共用 header/footer，保留原前台設計、路由與互動。沿用套件元件及 typed adapter，串起編輯、單一原生保存流程、草稿、授權預覽、發布與前台渲染。用隔離資料驗證保存重載、衝突、回滾及私人媒體權限。不要另造網站、靜默以假 CMS 替代，或未經授權建立帳號及部署。
```

## 整合範圍

隨附整合以 **React 19 + Next.js App Router + Payload 3.92** 為目標，需 Node.js 22 以上。可保留既有 React 元件，但每個網站仍需明確的內容映射、原 renderer 與伺服器端儲存／權限 adapter。其他框架、非 React 頁面、進階排程及多語系發布需額外工程與驗證；本專案不是代管服務，也不是任意網站轉換器。

<details>
<summary>鎖定技術版本與整合要求</summary>

已驗證環境：React／React DOM 19.2.4、Next.js App Router 16.4.3，需 Node.js 22 以上。

| 核心技術 | 精確版本 | 授權 | 用途 |
| --- | --- | --- | --- |
| [Payload](https://github.com/payloadcms/payload) | 3.92.0 | MIT | 選用後台：管理介面、權限、原生表單、媒體、草稿及版本 |
| [Puck](https://github.com/puckeditor/puck) | 0.23.0 | MIT | 映射內容畫布及編輯器 UI／history API |
| [Tiptap](https://github.com/ueberdosis/tiptap) | 3.32.0 | MIT | 富文字、圖片、YouTube 及段落拖曳 |
| [React Aria](https://github.com/adobe/react-spectrum) | 1.22.1 | Apache-2.0 | 無障礙選單、色盤、浮動工具及檔案選擇 |

Payload 用戶端整合需要**自訂 document edit view**，組合 `PayloadCanvasForm` 與配對的 `PayloadCanvasPublish`／`PayloadCanvasAutosave` 控制器。它們先 flush 畫布，再進入唯一的原生 `Form.submit` 流程。**這不是 `DefaultEditView` 的直接替換元件**：只加入欄位，或保留預設 Publish／Autosave 控制器，都不能確保擷取表單快照前已 flush。進階排程及多 locale 流程仍需額外整合與驗證。

目標網站需提供穩定欄位 ID、具型別的路徑、實際前端 renderer、路由清單、內容／樣式政策、在地化文案及 CMS 權限／儲存 adapter。模板是可選的工廠，不是完整安全政策。原生表單必須是唯一 writer。純字串支援文字修改；持久化 rich marks 需要真正的 rich storage。替換圖片／下載檔會建立新的不可變資產；解除連結只移除參照。

每個 SQLite 檔案僅支援一個 Payload 擁有者行程。外部 writer 的 `SQLITE_BUSY` 會使寫入拒絕執行，直到受控重啟；多行程須使用另一個已驗證的資料庫／adapter。擁有權不明的私有媒體必須重新上傳，不可猜測或回填上傳者。Metadata fingerprint 不是檔案位元組摘要：伺服器 hooks 必須禁止同 ID 替換檔案，並強制媒體 ACL、MIME／位元組／大小驗證及發布檢查。

另有隔離 demo 驗證過 **僅限 macOS arm64** 的 no-sharp 後台 profile，明確選用 MIT 平台二進位套件並省略 optional 依賴。已驗證原圖上傳、尺寸讀取、私有草稿與授權發布；不提供縮放、裁切、模糊圖生成或圖片最佳化。這不代表完整選用後台 fixture 已獲授權放行、其他平台已受支援，或其獨立 notices 已解決。

</details>

## 外觀與驗收

編輯器有 scoped styles 與功能性 shell，並非完全 headless。公開頁面 CSS 保持主導；僅在需身分驗證的編輯 layout 匯入 `puck.css`、`editor.css`、`canvas.css`。`PuckShell.className` 可限制附加樣式範圍。`editorThemeVariables` 接受 surface、text、border、focus、hover、selected 的六位十六進位色碼；套用至已驗證的 document 根節點（含 iframe 根節點），讓 body portal 繼承，勿帶入公開 renderer。

Locale／文案及允許的字型／色彩政策由呼叫端提供。Vendor overrides 受鎖定版本的 Puck、Payload、Tiptap API 限制。Tokens 不代表能替換每個 vendor control；保留可見焦點與足夠對比。

使用另一網站的合成 fixture、暫存 SQLite coordinator 測試、archive／hash／隱私檢查及完整 HTTP 回應；失敗 commit 後也要檢查持久化值。這些檢查不能證明正式身分驗證或視覺驗收：外觀、捲動、下拉選單、日文 IME、OS 檔案選擇、播放與無障礙仍由使用者驗收。不支援圖片文繞圖或任意 iframe 插入。

## 開發

參與開發前先讀 [AGENTS.md](AGENTS.md)。從 `dev` 建立 `feat/` 或 `fix/` 分支，使用合成資料驗證受影響的整合。

<details>
<summary>執行隔離 fixture</summary>

先讀 [Skill](SKILL.md) 與[安裝及驗證](references/install.md)，包含 artifact 檢查與 release gate。封裝版使用 `assets/runtime`、`assets/integration`、`assets/fixture`；原始碼 checkout 使用 `src`、`templates`、`fixtures` 與合成資料 `data/mock`。安裝器拒絕已存在的目的地，不修改 host 設定或帳密。

**已解壓縮的 archive：**在含 `MANIFEST.json` 的目錄執行：

```sh
node scripts/install-fixture.mjs /tmp/new-cms-fixture
cd /tmp/new-cms-fixture
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run types
npm run build
node fixture/check-http.mjs
```

**原始碼 checkout：**將上述第一行替換為在 repository 根目錄執行 `node scripts/prepare-portable-fixture.mjs /tmp/new-cms-fixture`，再於新目錄執行其餘相同命令。Prepare 腳本是 repository 工具，不是 archive 入口。

一律選新的暫存目錄。基礎評估使用 React 與鎖定版本、MIT 授權的 esbuild 工具鏈，不安裝 Next、Payload、SQLite 或 sharp／libvips。公開輸出只用公開 CSS；編輯器 CSS／JavaScript 只屬於預設停用的私有 fixture 路由。Fixture flag 不能充當正式環境身分驗證。

獨立的 Payload fixture 及其鎖檔需主動選用，授權仍未釐清。從 source 執行 `node scripts/prepare-payload-fixture.mjs . /tmp/new-cms-payload-fixture`；從解壓縮的 archive 執行 `node scripts/install-payload-fixture.mjs /tmp/new-cms-payload-fixture`。後端驗證命令見[安裝及驗證](references/install.md)。實際目標專案仍需真正的身分驗證、ACL、伺服器驗證及經授權的 schema 變更。

</details>

## 🔒 安全風險

`/admin` 路徑或後台子網域本身不是存取防護。正式部署前需評估 UI、API、上傳、媒體、預覽、版本及發布的伺服器端登入與權限，公開唯讀內容不得洩漏草稿或開放管理寫入；也需檢視首位管理員建立、登入與 session 政策、HTTPS／cookies、CORS／CSRF、私人媒體快取、備份及相依更新。模板不會自動完成正式環境強化或 MFA。

應用程式權限、身分閘道及 VPN／私人網路解決不同層次的問題。閘道仍需防止原始站點、其他部署網域或 API 繞過，且可能保留另一層 CMS 登入；私人網路也不取代應用程式權限。本 Skill 不指定供應商或部署方案。

[Payload access control](https://payloadcms.com/docs/access-control/overview) · [Payload authentication](https://payloadcms.com/docs/authentication/overview) · [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) · [Origin token validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) · [Deployment domains](https://vercel.com/docs/domains/working-with-domains) · [WireGuard](https://www.wireguard.com/quickstart/)

## 狀態與授權

開發版本 **0.3.0**，套件 **`@add-cms/core`**。Add CMS 原創碼採 [MIT](LICENSE) 授權，第三方元件及媒體保留各自條款。Source-only 交付包含編輯器、整合工廠、合成 fixture、精確相依鎖檔與驗證腳本；不含原網站內容、adapter、設定、媒體、資料庫、帳密或已安裝的第三方程式碼。獨立合成示範網站已實際走過認證編輯、草稿保存、預覽與發布；這不等於跨瀏覽器或正式部署安全認證。

原創碼可依 MIT 公開；依賴套件打包的第三方 notices 仍有待補齊；見[通知審查](notices/portable-release-review.json)。可選的 Payload／Next 後端 fixture 有另一組尚未釐清的完整相依鏈，包含 LGPL 授權的 sharp／libvips 原生元件及其他待審授權；編輯器 audit 不涵蓋該相依鏈。不附 `node_modules` 並不表示安裝或再散布義務已釐清。本儲存庫沒有內附已安裝的依賴實作或原生二進位；散布編譯後應用程式或依賴套件包仍需另行審查。

部分精確發行版的後台授權原文已保留在[後台 notices](notices/payload-backend-THIRD-PARTY-NOTICES.txt)，不代表完整相依鏈已獲放行。

示範配樂：**2:23 AM — しゃろう**。配樂已確認可隨這支示範影片公開發布，不作為獨立音樂資產提供，也不適用原始碼授權。

## 📚 來源與致謝

選用後台整合以 [Payload](https://github.com/payloadcms/payload) 提供管理介面、原生表單、資料、權限、媒體、草稿及版本；可視化編輯使用 [Puck](https://github.com/puckeditor/puck), [Tiptap](https://github.com/ueberdosis/tiptap), [React Spectrum / React Aria](https://github.com/adobe/react-spectrum)。精確 registry artifacts 與 notices 另行審查。Plate 的 [editable font-size interaction](https://github.com/udecode/plate/blob/main/apps/www/src/registry/ui/font-size-toolbar-button.tsx) 是互動參考；未包含 Slate／Plus 實作。保留的 MIT 致謝見 [Plate notice](notices/Plate-INTERACTION-REFERENCE-MIT.txt)。

Skill 結構於 2026-10-27 研究 [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md), [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md), [Vercel React best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md)：精簡的 discovery metadata、漸進式 references、可執行檢查及有證據的規則。這些是結構參考，非複製的 runtime 實作或背書；`main` 連結不是不可變發行版 pins。OpenAI skills repository 已由 [openai/plugins](https://github.com/openai/plugins) 取代，本套件不採用過時安裝指示。Anthropic 文件 skills 有獨立的 source-available 條款，未對其整個 repository 宣稱統一授權。未將任何第三方授權套用到擁有者的原創碼。

README 研究僅借鑑組織與呈現方式，未複製第三方文案、品牌圖片、徽章或範例實作。

| 參考來源 | 採用的方法 |
| --- | --- |
| [Crafting Effective READMEs](https://github.com/softaworks/agent-toolkit/tree/main/skills/crafting-effective-readmes) | 以讀者需求開場，分清安裝／使用／開發；MIT。 |
| [awesome-readme](https://github.com/matiassingers/awesome-readme) | 挑選重視視覺與任務流程的範例；清單採 CC0 放棄權利聲明。 |
| [Puck README](https://github.com/puckeditor/puck/blob/main/README.md) | 先展示產品，再分清編輯器與 renderer 整合；MIT 專案。 |
| [Refine Core README](https://github.com/refinedev/refine/blob/main/packages/core/README.md) | 交代用途、整合邊界與範例入口；MIT 專案。 |
| [Vercel Agent Skills README](https://github.com/vercel-labs/agent-skills/blob/main/README.md) | Skill 發現、安裝、使用及套件結構。README 標示 MIT，未找到根目錄 LICENSE，未複製其內容。 |
