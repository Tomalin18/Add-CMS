# Add CMS

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

**Your website. Now editable.**

An agent Skill and reusable components for adding a visual CMS to an existing React website. Keep your frontend design, routes and interactions; map its content to authenticated editing, drafts, preview and publication.

[Read the Skill](SKILL.md) · [Integration guide](references/install.md) · [Adapter contract](references/adapter-contract.md)

https://github.com/user-attachments/assets/e38ffbe1-c3a9-4af2-ab3b-2fa9000a3e9d

The 73-second, 1080p product demonstration: original page → editing → image replacement → publication → updated page. The film uses UI animation with genuine editor states and verified synthetic content; login typing is synthetic.

## ✨ What you can edit

Mapped content, backed by your CMS and rendered by your own components.

| Content | Editing workflow |
| --- | --- |
| **Text** | Edit in the canvas; rich storage retains allowed formatting, plain fields retain typed validation. |
| **Images and files** | Open a compact target tool, select a file, replace its reference and retain shared originals. |
| **Links** | Edit the label and destination together, including registered internal pages. |
| **Shared sections** | Keep header/footer data canonical while editing it in the same canvas. |
| **Drafts and publication** | Flush pending input into the native CMS form; authorize, preview, version and publish on the server. |

## 📦 Skill installation

Give this prompt to a coding agent that supports project-local Skills. It installs the complete package, including components, templates and scripts; `SKILL.md` alone is not the package.

```text
Install the Add CMS skill (add-cms) from https://github.com/Tomalin18/Add-CMS for this project. Read the root SKILL.md and obtain the complete source package, retaining src/, templates/, scripts/, references/, fixtures/, data/mock/, locks/, package.json, product.json, LICENSE and notices/.

Identify the current agent and follow its documented project-local skill installation method. Do not overwrite an existing skill or change global settings. Verify the frontmatter name add-cms, referenced resources and agent discovery before using it. If the repository has no source or the agent does not support skills, report the specific blocker instead of claiming installation.
```

Install the complete repository package using your agent’s supported project-local Skill workflow. Skill installation copies source and resources; it does not provision a CMS, install backend dependencies or change credentials. Source installation and resource checks have been validated in an isolated temporary project.

### Apply the installed Skill

```text
Use the installed Add CMS skill for this website. Read SKILL.md and inspect the actual framework, rendering, deployment, authentication, database and content sources first. Report unsupported integration requirements before changing the site.

Inventory existing text, images, downloadable files, links and shared header/footer content. Preserve the frontend design, routes and interactions. Reuse the supplied components and typed adapters to connect editing, one native save pipeline, drafts, authorized preview, publication and public rendering. Verify save/reload, conflicts, rollback and private-media access with isolated data. Do not invent a replacement website, silently substitute a mock CMS or create accounts or deploy without authorization.
```

## Integration scope

The supplied integration targets **React 19 + Next.js App Router + Payload 3.92** on Node.js 22 or later. Existing React components can be retained, but each website needs explicit content mappings, its renderer and a server-side storage/authorization adapter. Other frameworks, non-React pages, advanced scheduling and multi-locale publication need additional engineering and validation. This is not a hosted service or a universal site converter.

<details>
<summary>Pinned stack and integration requirements</summary>

Validated host: React / React DOM 19.2.4 and Next.js App Router 16.4.3 on Node.js 22 or later.

| Core technology | Pinned version | License | Responsibility |
| --- | --- | --- | --- |
| [Payload](https://github.com/payloadcms/payload) | 3.92.0 | MIT | Optional backend: admin, access control, native forms, media, drafts and versions |
| [Puck](https://github.com/puckeditor/puck) | 0.23.0 | MIT | Mapped content canvas and editor UI/history APIs |
| [Tiptap](https://github.com/ueberdosis/tiptap) | 3.32.0 | MIT | Rich text, images, YouTube and paragraph drag handles |
| [React Aria](https://github.com/adobe/react-spectrum) | 1.22.1 | Apache-2.0 | Accessible selection, color, popover and file-selection controls |

The Payload client integration requires a **custom document edit view** composed with `PayloadCanvasForm` and its paired `PayloadCanvasPublish` / `PayloadCanvasAutosave` controllers. These flush the canvas before the single native `Form.submit` pipeline. **This is not a `DefaultEditView` drop-in**: adding the field alone or retaining the default Publish/Autosave controllers does not establish flushing before the form snapshot. Advanced scheduling and multi-locale workflows need further integration and validation.

The target supplies stable field IDs and typed paths, its actual frontend renderer, route registry, content/style policy, localized copy and CMS authorization/storage adapter. Templates are opt-in factories, not a complete security policy. Keep the native form as the sole writer. Plain strings support content edits; persistent rich marks require rich storage. Image/download replacement creates a new immutable asset; unlink removes only the reference.

SQLite supports one Payload owner process per database file. An external-writer `SQLITE_BUSY` fails writes closed until a controlled restart. Multiple processes require another validated database/adapter. Private media with unknown ownership must be reuploaded; never guess or backfill the uploader. A metadata fingerprint is not a byte digest: server hooks must prohibit same-ID file replacement and enforce media ACLs, MIME/byte/size validation and publication checks.

An additional isolated demo has validated a no-sharp backend profile on **macOS arm64 only**, using explicit MIT platform binaries and omitted optional dependencies. It supports original-image upload, dimensions, private drafts and authorized publication; it does not provide resize, crop, blur generation or image optimization. This does not clear the full optional backend fixture, establish other-platform support, or resolve its separate notices.

</details>

## Appearance and acceptance

The editor has scoped styles and a functional shell; it is not fully headless. Public page CSS stays authoritative. Import `puck.css`, `editor.css` and `canvas.css` only in authenticated editing layouts. `PuckShell.className` scopes additional styles. `editorThemeVariables` accepts six-digit hex tokens for surface, text, border, focus, hover and selected state. Apply tokens to the authenticated document root, including iframe roots, so body portals inherit them; keep them out of public rendering.

Locale/copy and allowed font/color policies come from the caller. Vendor overrides remain subject to pinned Puck, Payload and Tiptap APIs. Tokens do not replace every vendor control; retain visible focus and sufficient contrast.

Use the alternate-site fixture, temporary SQLite coordinator tests, archive/hash/privacy checks and complete HTTP bodies. Inspect persisted values after failed commits. These checks do not establish production authentication or visual acceptance: appearance, scrolling, dropdowns, Japanese IME, OS file selection, playback and accessibility still need user acceptance. Image text wrapping and arbitrary iframe insertion are unsupported.

## Development

Read [AGENTS.md](AGENTS.md) before contributing. Work from `dev` in a `feat/` or `fix/` branch; validate the affected integration with synthetic data.

<details>
<summary>Run the isolated fixtures</summary>

Read [the Skill](SKILL.md) and [installation and validation](references/install.md), including artifact checks and release-gate enforcement. The archive uses `assets/runtime`, `assets/integration` and `assets/fixture`; the source checkout uses `src`, `templates`, `fixtures` and synthetic `data/mock`. Installers refuse existing destinations and do not change host configuration or credentials.

**Extracted archive:** from the folder containing `MANIFEST.json`, run:

```sh
node scripts/install-fixture.mjs /tmp/new-cms-fixture
cd /tmp/new-cms-fixture
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run types
npm run build
node fixture/check-http.mjs
```

**Source checkout:** instead of the first line above, run `node scripts/prepare-portable-fixture.mjs /tmp/new-cms-fixture` at the repository root, then run the same remaining commands in the new directory. The prepare script is a repository tool, not an archive entrypoint.

Always choose a new temporary directory. The base evaluation uses React and the pinned MIT esbuild toolchain; it installs no Next, Payload, SQLite or sharp/libvips. Public output uses public CSS; editor CSS/JavaScript belongs only to the disabled-by-default private fixture route. The fixture flag is not production authentication.

The separate Payload fixture and its lock are opt-in and remain uncleared. From source, run `node scripts/prepare-payload-fixture.mjs . /tmp/new-cms-payload-fixture`; from the extracted archive, run `node scripts/install-payload-fixture.mjs /tmp/new-cms-payload-fixture`. Follow the backend validation commands in [installation and validation](references/install.md). Real auth, ACLs, server validation and authorized schema changes are still required for a target project.

</details>

## 🔒 Security considerations

An `/admin` path or admin subdomain is not access control. Before public deployment, assess server-side authentication and permissions across the UI, APIs, uploads, media, previews, versions and publication. Published read-only access must not expose drafts or management writes. Review first-admin setup, login/session policies, HTTPS/cookies, CORS/CSRF, private-media caching, backups and dependency updates. These templates do not configure production hardening or MFA.

Deployment options address different risks: application authentication and ACLs govern operations; an identity-aware gateway adds an entry policy but requires protection against direct-origin/API bypass and may retain a separate CMS login; VPN/private networking limits network reachability while application permissions remain relevant. Alternate deployment domains can also bypass an unprotected origin. No particular provider or deployment option is required by this Skill.

Official references: [Payload access control](https://payloadcms.com/docs/access-control/overview) and [authentication](https://payloadcms.com/docs/authentication/overview); [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/) and [origin token validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/); [deployment domains](https://vercel.com/docs/domains/working-with-domains); [VPN configuration (WireGuard example)](https://www.wireguard.com/quickstart/).

## Status and licensing

Working version **0.3.0**, package **`@add-cms/core`**. Original Add CMS code is licensed under [MIT](LICENSE); third-party components and media retain their own terms. Source-only delivery includes the editor, integration factories, synthetic fixtures, exact dependency locks and verification scripts. It excludes original-site content, adapters, settings, media, databases, credentials and installed third-party code. The separate synthetic demonstration now exercises authenticated editing, saved drafts, previews and publication. The demonstration is not a cross-browser or production-security certification.

Original-source publication is cleared under MIT. Separate dependency-bundle notices remain unresolved; see [the notice review](notices/portable-release-review.json). The optional Payload/Next backend fixture has a separate uncleared dependency closure, including LGPL-licensed sharp/libvips native components and other licenses requiring review. The editor-only audit does not cover that closure. Omitting `node_modules` does not clear installation or redistribution obligations. The repository contains no installed dependency implementations or native binaries; distributing a compiled application or dependency bundle requires its own review.

Selected exact-release backend texts are retained in [backend notices](notices/payload-backend-THIRD-PARTY-NOTICES.txt); they do not clear the complete closure.

Demo soundtrack: **2:23 AM — しゃろう**. The soundtrack is cleared for public release as part of this demo film. It is not a standalone music asset or covered by the source-code license.

## 📚 Sources and attribution

The optional backend integration uses [Payload](https://github.com/payloadcms/payload) for the admin interface, native forms, data, access control, media, drafts and versions. Visual editing uses [Puck](https://github.com/puckeditor/puck), [Tiptap](https://github.com/ueberdosis/tiptap), [React Spectrum / React Aria](https://github.com/adobe/react-spectrum). Exact registry artifacts and notices are reviewed separately. Plate's [editable font-size interaction](https://github.com/udecode/plate/blob/main/apps/www/src/registry/ui/font-size-toolbar-button.tsx) was an interaction reference; no Slate/Plus implementation is bundled. Retained MIT attribution: [Plate notice](notices/Plate-INTERACTION-REFERENCE-MIT.txt).

Skill structure was researched on 2026-10-27 from [OpenAI skill-creator](https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md), [Anthropic skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md), [Vercel React best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md): concise discovery metadata, progressive references, executable checks and evidence-based rules. These are structural references, not copied runtime implementations or endorsements; `main` links are not immutable release pins. OpenAI's skills repository is deprecated in favor of [openai/plugins](https://github.com/openai/plugins); obsolete installation instructions are not adopted. Anthropic's document skills have separate source-available terms, without a blanket license claim for its repository. No third-party license is assigned to the owner's original code.

README research: only structure and presentation were studied; no third-party README prose, brand art, badges or sample implementation was copied.

| Reference | What informed this README |
| --- | --- |
| [Crafting Effective READMEs](https://github.com/softaworks/agent-toolkit/tree/main/skills/crafting-effective-readmes) | Audience-first description, separate installation/use/development; MIT. |
| [awesome-readme](https://github.com/matiassingers/awesome-readme) | Selection of visual, task-oriented examples; CC0 waiver on the list. |
| [Puck README](https://github.com/puckeditor/puck/blob/main/README.md) | Product demonstration before editor/render integration; MIT project. |
| [Refine Core README](https://github.com/refinedev/refine/blob/main/packages/core/README.md) | Purpose, supported integration boundaries and paths to examples; MIT project. |
| [Vercel Agent Skills README](https://github.com/vercel-labs/agent-skills/blob/main/README.md) | Skill discovery, installation, usage and package structure. README states MIT; no root LICENSE was found, and no content was copied. |
