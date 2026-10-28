# Add CMS contributor guidance

## Architecture and source separation

- Preserve each target site's design, routes, interactions and existing content. Integrate through explicit field mappings and the site's renderer; do not replace the site with a sample or claim universal compatibility.
- Keep canonical runtime source in `src`, host integration templates in `templates`, fixtures in `fixtures`, and synthetic data in `data/mock`. Packaged Skills use `assets/runtime`, `assets/integration` and `assets/fixture`. Keep source-checkout and archive commands distinct.
- Reusable source must exclude customer content, adapters, configuration, databases, media, credentials, machine-specific absolute paths and customer Git history. Use synthetic test data and content-free diagnostics.
- Keep `README.md` and its Traditional Chinese, Simplified Chinese and Japanese translations aligned. Use `SKILL.md` and focused references for agent instructions; record unfinished features in `FEATURES.md` only when necessary. Avoid per-change report files.

## Persistence and security invariants

- Keep one native CMS writer for dirty state, autosave, draft save, publication and versions. Flush pending canvas changes before the native form takes its snapshot. The supplied Payload integration requires a custom document edit view with `PayloadCanvasForm` and its paired controllers; a field in `DefaultEditView` is insufficient.
- Enforce authentication, roles, ACLs, bounded content validation, revision conflicts and atomic writes on the server. Never substitute client display state for persistence or authorization. Validate bridge origin, source window and per-instance channel.
- Shared content has one canonical document. Publication includes only the current actor's authorized patches and preserves other drafts. Store ownership journals on the server; verify persisted values after failures and roll back related writes together.
- Media replacement creates a new immutable asset; unlink removes a reference rather than bytes. Enforce private-media access, MIME/signature/size checks, uploader provenance and transactional publication. Never guess or backfill unknown upload ownership. Metadata fingerprints do not prove file-byte identity.
- The supplied SQLite adapter supports one owner process per file. Preserve its fail-closed behavior after external-writer conflicts. Other databases or concurrency models require their own validation.
- Do not reseed over edits, reset real data or apply destructive schema changes as test setup. Plan schema changes with backups, additive migrations and checks preserving existing rows and versions.

## Interface and style

- Supply functional labels, errors and accessibility feedback through i18n or caller catalogs. The runtime defaults cover `zh-TW`, `en` and `ja`; product READMEs and the demo also cover `zh-CN`. Do not add filler headings, decorative translations or hardcoded sample language to reusable components.
- Keep public rendering lightweight and free of editor or authenticated draft payloads. Import editor CSS only in authenticated editing layouts. Public site styles remain authoritative.
- Use scoped styles, supported vendor APIs and caller-provided theme/content policies. Preserve visible focus and sufficient contrast; do not promise arbitrary replacement of every vendor control.

## Git workflow

- Treat `main` as stable and `dev` as the integration branch. Branch from `dev` into `feat/...` or `fix/...`, integrate back into `dev`, then promote `dev` to `main`.
- Do not develop directly on `main` or `dev`, merge feature/fix branches directly into `main`, or rewrite shared history. Keep pushes, merges and releases within the agreed contribution scope.
- Use commit titles in the form `[type] title`, without emoji. Describe the problem, change and checks actually performed.

## Validation

- Run relevant type, build, logic and API checks in isolated fixtures. Preserve exact dependency locks and verify a fresh source/archive installation, archive members, hashes and public/editor bundle separation as appropriate.
- Test native save/reload, draft preview, authorized publication, version restoration, concurrency, failure rollback and private media through the integration being claimed. A passing build, mock or DOM test does not prove production authentication or backend compatibility.
- Repository policy excludes automated browser and desktop UI testing. Appearance, scrolling, dropdown behavior, IME, OS file selection, playback and accessibility require human UX acceptance; programmatic checks do not replace it.
- Clean up disposable verification artifacts while retaining required tests, runtime files and license notices. Keep video tooling separate from Skill and demo installation; do not add automatic tool downloads, execution or screen recording.

## Licensing and release gates

- Original Add CMS code is MIT licensed. Preserve LICENSE. Third-party source, dependencies, notices and demo media retain their own terms; do not relicense them or claim release clearance without the appropriate review.
- Prefer MIT, Apache-2.0, BSD and ISC dependencies. Do not introduce GPL, AGPL, SSPL or other restricted dependencies without approval. Review each exact version and its transitive closure, source and required notices individually; do not classify every nonpreferred license as equivalent.
- Preserve required copyright and license notices. Mark unknown third-party or generated provenance for review. Public research does not authorize copying restricted implementations or disguising them through superficial rewrites.
- Keep unresolved runtime notice gates separate from the optional Payload backend dependency review, including native dependencies. Enforce the gate for the actual output: sourcePublication for original-source release, and the separate dependency/binary gate for installed or compiled bundles. Do not apply a native-binary distribution gate to a source checkout that contains no dependency implementations; source publication does not clear downstream dependency obligations.

- When a user-specified tool, method, or deliverable cannot be executed, report the exact blocker. Propose alternatives only; do not adopt a fallback or count a substitute as completion without the user's explicit approval.
