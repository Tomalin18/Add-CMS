---
name: add-cms
description: Retrofit a static-content React or Next.js website with authenticated CMS-backed editing while preserving its existing frontend. Reuse the bundled visual editor and connect mapped content to drafts, publication and versions.
---

# Add CMS

Preserve the target's frontend design, routes, interactions and existing content. Reuse the actual bundled components; do not recreate an editor or replace the website to fit a CMS. Verified integration is React 19.2.4, Next App Router 16.4.3, Payload 3.92.0, Puck 0.23.0 and Tiptap 3.32.0. Assess other stacks explicitly; do not promise universal conversion.

Read the target's instructions and authorization. This Skill does not authorize deployment, new accounts, data resets, destructive migrations, publication or external transmission. Respect the target's frontend acceptance workflow.

## Prepare

Read [installation](references/install.md). Read the release review appropriate to the layout: `notices/portable-release-review.json` in a source checkout, or `RELEASE-GATE.json` in an extracted artifact. The original-source publication gate is separate from dependency-bundle clearance. Installing the Skill or copying its original source does not install its declared dependencies. Before installing, building or distributing a target application, review its actual dependency notices and host licensing policy; never treat a source-only gate as binary or dependency clearance. Temporary fixture evaluation is separately scoped.

Inventory actual routes and rendered content: text/alt, shared shell, images, links and destinations, downloads, tables/lists, conditional states and SEO. Separate editable public copy from private submissions. A schema field or shared header alone does not establish full-page editing. Track each content source through edit target, native save, reload and renderer using the target's existing planning location; do not generate unsolicited reports.

## Integrate

- Keep the complete Skill directory and its relative resources together. In a source checkout reuse `src`, `package.json`, `templates`, `fixtures`, `data/mock` and `locks`; an extracted archive instead uses `assets/runtime`, `assets/integration` and `assets/fixture`. Do not download only this document or assume archive paths exist in a checkout. Reuse the runtime with its exact lock. Supply stable field IDs/typed paths and the existing renderer. The neutral fixture demonstrates mappings; it is not a site to copy over the target.
- Read [the adapter contract](references/adapter-contract.md) before wiring persistence. Mount in the existing authenticated admin workflow. Native CMS form state is the sole writer for dirty state, autosave, manual draft save, publish and versions. Validate iframe origin, source window and per-instance channel.
- Shared content remains one canonical document. Coordinate server-owned revision journals, the current actor's patches and atomic writes; publication must not include another actor's pending draft. For SQLite, use the supplied serialized adapter only within its single-owner restriction.
- Keep plain typed values plain. For sites requiring formatting on existing string fields, use explicit JSON companions and `createTextCompanions`; validate every companion server-side, synchronize plain/rich changes with conflict rejection, and render validated nodes on draft and public routes. Native string edits must not silently retain stale rich content. Verify color persistence through save/reload/preview/publish before filming or claiming formatting. Rich editing requires persistent rich storage and the bounded codec. Supply the target route/style/media policies; unsupported legacy nodes must remain intact or refuse editing. Never silently flatten data or render arbitrary HTML.
- Use whole existing image targets and actual anchors. First click opens compact tools; explicit replacement invokes the official file trigger and authenticated CMS upload. Replace creates a new asset; unlink removes a reference. Media ACL, byte/MIME/size checks, immutable identity, uploader provenance and publication checks are server responsibilities. A preview must not publish media.
- Keep a visible native image field beside its content as a supplementary entry, using `PayloadImageField` or the official Upload field; a buried relationship selector does not satisfy local-file upload. Preserve the whole-image compact tool as the primary canvas interaction. Guard site-specific read-time fallbacks against projected records without content; never hydrate or hash a partial admin metadata record.
- Keep public rendering lightweight and free of editor/authenticated draft payloads. Import scoped editor CSS only in editing layouts. Use the theme/locale/copy configuration documented in README; do not override the public design or force a sample language.

## Verify and deliver

Validate in isolated fixtures: real editor output → native save/reload → authenticated draft preview → authorized publication → version restoration. Check every rendered occurrence and conditional/tab view, including repeated brand or label copies. A local illustration state must not replace persisted formatting on the actual public renderer; field counts and codec tests alone do not prove rendered coverage. Include failures/concurrency, other-author draft isolation, private media, URL safety and public bundle separation. Backup and compare existing rows/versions before any separately authorized additive migration; never reseed over edits.

After a successful manual draft save and after autosave settles, verify that an acknowledged draft remains publishable even before version counters refresh. For media, require the real mapped target → official file chooser → authenticated upload → saved reference → draft preview → authorized publication → public renderer path. A browser-tool approval failure is neither server failure nor successful upload; report that boundary without substituting another write route.

Use the executable archive/hash checks and fresh installation from actual extraction. Metadata validation alone does not prove functionality. Report exact tests and remaining limits concisely, in the target's requested format. Browser appearance, IME, OS dialogs and playback require the target's acceptance process.

Before changing fragile synchronization or transaction code, read [verified troubleshooting](references/troubleshooting.md). For dependency/redistribution review, read [component provenance](references/component-provenance.md). Preserve notices and target licensing; do not assign a public license to owner code. Image wrapping and arbitrary iframe insertion remain outside this implementation.
