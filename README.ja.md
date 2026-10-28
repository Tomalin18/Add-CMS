# Add CMS

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**あなたのサイトを、編集できるサイトに。**

既存の React サイトにビジュアル CMS を追加するエージェントスキルと再利用可能なコンポーネントです。フロントエンドのデザイン、ルート、操作を保ちながら、コンテンツを認証付き編集、下書き、プレビュー、公開につなぎます。

[スキルを読む](SKILL.md) · [統合ガイド](references/install.md) · [アダプター契約](references/adapter-contract.md)

https://github.com/user-attachments/assets/e38ffbe1-c3a9-4af2-ab3b-2fa9000a3e9d

73 秒・1080p の製品デモです。変更前 → 編集 → 画像の差し替え → 公開 → 変更後を紹介しています。実際のエディター状態と検証済みの合成コンテンツによる UI アニメーションで、ログイン入力は合成デモです。

## ✨ 編集できる内容

明示的なマッピングでコンテンツを CMS に接続し、公開画面は既存のコンポーネントで描画します。

| 内容 | 編集フロー |
| --- | --- |
| **テキスト** | キャンバスで直接編集。rich 形式は許可された書式を保存し、通常のフィールドは型検証を維持します。 |
| **画像・ファイル** | 対象から小さなツールを開いてファイルを選び、参照を置換。共有元ファイルは保持します。 |
| **リンク** | 表示文字と宛先を一緒に編集し、登録済みのサイト内ページを選べます。 |
| **共通部分** | 同じキャンバスで header/footer を編集し、正本は一つに保ちます。 |
| **下書き・公開** | 最新入力をネイティブ CMS フォームに同期してから、サーバーで権限・プレビュー・履歴・公開を処理します。 |

## 📦 スキルのインストール

プロジェクト内スキルをサポートするコーディングエージェントに、次のプロンプトを渡してください。コンポーネント、テンプレート、スクリプトを含むパッケージ全体が必要で、`SKILL.md` だけでは使えません。

```text
このプロジェクトに https://github.com/Tomalin18/Add-CMS の Add CMS skill（add-cms）をインストールしてください。ルートの SKILL.md を読み、src/、templates/、scripts/、references/、fixtures/、data/mock/、locks/、package.json、product.json、LICENSE、notices/ の相対構造を保った完全なソースパッケージを取得します。

現在の agent を識別し、その公式文書に従うプロジェクト内のスキル配置方法を使用してください。同名スキルやグローバル設定を上書きしないでください。frontmatter name が add-cms で、参照リソースが揃い、agent が発見できることを確認してから使用します。リモートにソースがない場合や未対応の agent では、導入済みとせず具体的な問題を報告してください。
```

利用中の agent がサポートするプロジェクト内 Skill 手順で、リポジトリ全体をインストールしてください。ソースと資源のコピーのみを行い、CMS の作成、バックエンド依存のインストール、認証情報の変更は行いません。ソースのインストールと資源検査は隔離した一時プロジェクトで検証済みです。

### インストール済みスキルを使う

```text
現在のサイトにインストール済みの Add CMS skill を使用してください。SKILL.md を読み、実際のフレームワーク、描画、デプロイ、認証、データベース、コンテンツソースを確認します。未対応の統合要件は変更前に具体的に報告してください。

既存の文字、画像、ダウンロード、リンク、共通 header/footer を棚卸しし、外観・ルート・操作を維持します。同梱コンポーネントと typed adapter を使い、編集、単一のネイティブ保存経路、下書き、権限付きプレビュー、公開、公開画面を接続します。隔離データで保存・再読込、競合、ロールバック、非公開メディアの権限を検証してください。別サイトの再構築、模擬 CMS への無断置換、未承認のアカウント作成やデプロイは行わないでください。
```

## 統合の範囲

付属の統合は **React 19 + Next.js App Router + Payload 3.92** を対象とし、Node.js 22 以降が必要です。既存の React コンポーネントを維持できますが、サイトごとのコンテンツマッピング、既存レンダラー、サーバー側の保存・権限アダプターが必要です。他のフレームワーク、React 以外のページ、高度な予約公開や複数ロケール公開には追加実装と検証が必要です。ホスティングサービスや万能な変換ツールではありません。

<details>
<summary>固定バージョンと統合要件</summary>

検証済み環境：React／React DOM 19.2.4、Next.js App Router 16.4.3、Node.js 22 以降。

| 主要技術 | 固定バージョン | ライセンス | 用途 |
| --- | --- | --- | --- |
| [Payload](https://github.com/payloadcms/payload) | 3.92.0 | MIT | 任意のバックエンド：管理画面、権限、ネイティブフォーム、メディア、下書き、バージョン |
| [Puck](https://github.com/puckeditor/puck) | 0.23.0 | MIT | マッピングしたコンテンツのキャンバスと編集 UI／history API |
| [Tiptap](https://github.com/ueberdosis/tiptap) | 3.32.0 | MIT | リッチテキスト、画像、YouTube、段落のドラッグ |
| [React Aria](https://github.com/adobe/react-spectrum) | 1.22.1 | Apache-2.0 | アクセシブルな選択・色・ポップオーバー・ファイル選択 |

Payload のクライアント統合には、`PayloadCanvasForm` と対応する `PayloadCanvasPublish`／`PayloadCanvasAutosave` コントローラーを組み合わせた**カスタム document edit view**が必要です。キャンバスを flush してから、唯一のネイティブ `Form.submit` 処理へ進みます。**`DefaultEditView` にそのまま追加できる構成ではありません**。フィールドの追加だけ、または既定の Publish／Autosave コントローラーを残す構成では、フォームのスナップショット取得前の flush を保証できません。高度なスケジュールや複数 locale の処理には追加の統合と検証が必要です。

対象サイトが、安定したフィールド ID と型付きパス、実際のフロントエンド renderer、ルート一覧、コンテンツ／スタイル方針、翻訳文言、CMS 認可／保存 adapter を提供します。テンプレートは任意のファクトリーであり、完全なセキュリティ方針ではありません。ネイティブフォームを唯一の writer にしてください。文字列はテキスト編集に使えますが、rich marks の永続化には実際の rich storage が必要です。画像／ダウンロードの置換は新しい不変アセットを作成し、リンク解除は参照だけを除去します。

SQLite ファイルごとに Payload の所有者プロセスは一つです。外部 writer による `SQLITE_BUSY` が発生すると、制御された再起動まで書き込みを拒否します。複数プロセスには別の検証済みデータベース／adapter が必要です。所有者不明の非公開メディアは再アップロードし、アップロード者を推測・補完しないでください。Metadata fingerprint はファイルのバイト列のダイジェストではありません。サーバー hooks で同一 ID のファイル置換を禁止し、メディア ACL、MIME／バイト列／サイズの検証と公開チェックを実施してください。

別の隔離デモでは **macOS arm64 限定** の no-sharp backend profile を検証しました。MIT のプラットフォームバイナリを明示し、optional 依存を省略します。原画像のアップロード・寸法取得・非公開下書き・権限付き公開を確認しましたが、リサイズ・切り抜き・ぼかし生成・画像最適化は提供しません。これは選択式 backend fixture 全体のライセンス確認、他の環境への対応、別途必要な notices の解決を意味しません。

</details>

## 外観と受け入れ確認

エディターは scoped styles と機能的な shell を持ち、完全な headless ではありません。公開ページの CSS を優先し、`puck.css`、`editor.css`、`canvas.css` は認証付き編集 layout だけで読み込んでください。`PuckShell.className` で追加スタイルの範囲を指定できます。`editorThemeVariables` は surface、text、border、focus、hover、selected の六桁の十六進色を受け付けます。Body portal に継承されるよう、認証付き document のルート（iframe のルートも含む）へ適用し、公開 renderer には含めないでください。

Locale／文言と許可するフォント／色の方針は呼び出し側が指定します。Vendor overrides は固定バージョンの Puck、Payload、Tiptap API の範囲内です。Tokens ですべての vendor control を置換できるわけではありません。見えるフォーカスと十分なコントラストを維持してください。

別サイトの合成 fixture、一時 SQLite coordinator テスト、archive／hash／プライバシー検査、HTTP 応答全体を使って検証し、commit 失敗後も保存値を確認してください。これらは本番認証や視覚的な受け入れ確認を証明しません。外観、スクロール、ドロップダウン、日本語 IME、OS のファイル選択、再生、アクセシビリティは利用者の確認が必要です。画像への文字回り込みと任意の iframe 挿入には対応していません。

## 開発

開発前に [AGENTS.md](AGENTS.md) を確認してください。`dev` から `feat/` または `fix/` ブランチを作成し、合成データで変更対象の統合を検証します。

<details>
<summary>隔離 fixture を実行する</summary>

[Skill](SKILL.md) と[インストール・検証手順](references/install.md)を読み、artifact 検査と release gate を確認してください。アーカイブは `assets/runtime`、`assets/integration`、`assets/fixture`、ソース checkout は `src`、`templates`、`fixtures` と合成データ `data/mock` を使います。インストーラーは既存の出力先を拒否し、ホスト設定や認証情報を変更しません。

**展開済みアーカイブ：**`MANIFEST.json` を含むディレクトリで実行します。

```sh
node scripts/install-fixture.mjs /tmp/new-cms-fixture
cd /tmp/new-cms-fixture
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run types
npm run build
node fixture/check-http.mjs
```

**ソース checkout：**上記の最初の行の代わりに、repository ルートで `node scripts/prepare-portable-fixture.mjs /tmp/new-cms-fixture` を実行し、新しいディレクトリで残りの同じコマンドを実行します。Prepare スクリプトは repository 用であり、アーカイブの入口ではありません。

必ず新しい一時ディレクトリを使ってください。基本評価は React と固定済みの MIT ライセンスの esbuild ツールチェーンを使い、Next、Payload、SQLite、sharp／libvips をインストールしません。公開出力は公開 CSS だけを使い、エディターの CSS／JavaScript は既定で無効の非公開 fixture ルートに限定します。Fixture flag は本番認証ではありません。

別の Payload fixture とロックファイルは明示的に選択するもので、ライセンス確認は未完了です。Source では `node scripts/prepare-payload-fixture.mjs . /tmp/new-cms-payload-fixture`、展開済みアーカイブでは `node scripts/install-payload-fixture.mjs /tmp/new-cms-payload-fixture` を実行します。バックエンドの検証コマンドは[インストール・検証手順](references/install.md)を参照してください。実際の対象プロジェクトには本物の認証、ACL、サーバー検証、承認済みの schema 変更が引き続き必要です。

</details>

## 🔒 セキュリティ上の注意

`/admin` というパスや管理用サブドメイン自体はアクセス制御ではありません。本番公開前に UI、API、アップロード、メディア、プレビュー、履歴、公開操作のサーバー側認証・権限を評価してください。公開の読み取り経路で下書きや管理書き込みを公開しないようにし、初回管理者作成、ログイン・session、HTTPS／cookies、CORS／CSRF、非公開メディアのキャッシュ、バックアップ、依存更新も確認します。テンプレートは本番対策や MFA を自動設定しません。

アプリの権限、認証ゲートウェイ、VPN／非公開ネットワークは異なる層を扱います。ゲートウェイにはオリジン・別デプロイドメイン・API 経由の迂回対策が必要で、CMS 側の別ログインが残る場合があります。非公開ネットワークもアプリ権限の代わりにはなりません。本 Skill は特定の製品や構成を指定しません。

[Payload access control](https://payloadcms.com/docs/access-control/overview) · [Payload authentication](https://payloadcms.com/docs/authentication/overview) · [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) · [Origin token validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) · [Deployment domains](https://vercel.com/docs/domains/working-with-domains) · [WireGuard](https://www.wireguard.com/quickstart/)

## 状態とライセンス

開発版 **0.3.0**、パッケージ **`@add-cms/core`**。Add CMS の独自コードは [MIT](LICENSE) ライセンスです。第三者のコンポーネントとメディアにはそれぞれの条件が適用されます。Source-only 配布物にはエディター、統合ファクトリー、合成 fixture、正確な依存ロックファイル、検証スクリプトが含まれます。元サイトのコンテンツ、adapter、設定、メディア、データベース、認証情報、インストール済みの第三者コードは含まれません。独立した合成デモで認証付き編集、下書き保存、プレビュー、公開を実行しました。全ブラウザー対応や本番セキュリティの認証を意味しません。

独自ソースは MIT で公開できます。依存パッケージの再配布に必要な第三者 notices には未解決の項目があります。[通知の調査](notices/portable-release-review.json)を参照してください。任意の Payload／Next バックエンド fixture には別の未解決の依存関係全体があり、LGPL の sharp／libvips ネイティブコンポーネントや他の要確認ライセンスを含みます。エディター単体の監査はこの依存関係を対象にしません。`node_modules` を同梱しなくても、インストールや再配布の義務が解消するわけではありません。このリポジトリにインストール済みの依存実装やネイティブバイナリは含みません。コンパイル済みアプリや依存バンドルの配布は別途確認が必要です。

一部の正確なリリースのライセンス本文を[バックエンド notices](notices/payload-backend-THIRD-PARTY-NOTICES.txt)に保持していますが、依存関係全体の確認完了を意味しません。

デモ音源：**2:23 AM — しゃろう**。このデモ動画の一部として公開できることを確認済みです。単独の音楽素材としては提供せず、ソースコードのライセンスも適用されません。

## 📚 参照元と謝辞

任意のバックエンド統合では [Payload](https://github.com/payloadcms/payload) の管理画面、ネイティブフォーム、データ、権限、メディア、下書き、バージョン機能を利用します。ビジュアル編集には [Puck](https://github.com/puckeditor/puck), [Tiptap](https://github.com/ueberdosis/tiptap), [React Spectrum / React Aria](https://github.com/adobe/react-spectrum) を使用します。正確な registry artifacts と notices は別途確認します。Plate の [editable font-size interaction](https://github.com/udecode/plate/blob/main/apps/www/src/registry/ui/font-size-toolbar-button.tsx) は操作の参考であり、Slate／Plus の実装は同梱していません。保持した MIT 表記は [Plate notice](notices/Plate-INTERACTION-REFERENCE-MIT.txt) を参照してください。

Skill 構造は 2026-10-27 に [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md), [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md), [Vercel React best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) を調査しました。簡潔な discovery metadata、段階的な references、実行可能な検査、根拠付きの規則を参考にしています。構造上の参考であり、runtime 実装のコピーや推薦を意味しません。`main` のリンクは不変のリリース pins ではありません。OpenAI skills repository は [openai/plugins](https://github.com/openai/plugins) に置き換えられており、古いインストール手順は採用しません。Anthropic の文書 skills には個別の source-available 条項があり、repository 全体に共通のライセンスがあるとは述べていません。所有者の独自コードに第三者ライセンスを適用しません。

README の構成と見せ方のみを参考にし、第三者の文章、ブランド画像、バッジ、実装例はコピーしていません。

| 参照元 | 参考にした点 |
| --- | --- |
| [Crafting Effective READMEs](https://github.com/softaworks/agent-toolkit/tree/main/skills/crafting-effective-readmes) | 読者に合わせた説明、インストール・利用・開発の分離。MIT。 |
| [awesome-readme](https://github.com/matiassingers/awesome-readme) | 視覚表現と作業の流れを重視した例の選定。リストは CC0 の権利放棄を明記。 |
| [Puck README](https://github.com/puckeditor/puck/blob/main/README.md) | 製品デモを先に置き、編集と描画の統合を分ける構成。MIT プロジェクト。 |
| [Refine Core README](https://github.com/refinedev/refine/blob/main/packages/core/README.md) | 用途、統合の境界、サンプルへの導線。MIT プロジェクト。 |
| [Vercel Agent Skills README](https://github.com/vercel-labs/agent-skills/blob/main/README.md) | スキルの検出、導入、利用、構造。README は MIT を表記していますがルート LICENSE は未確認で、内容はコピーしていません。 |
