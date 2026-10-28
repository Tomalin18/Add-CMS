# Installation and validation

## Source checkout

Keep the complete checkout together: `SKILL.md`, `src`, `templates`, `scripts`, `references`, `fixtures`, `data/mock`, `locks`, package metadata, LICENSE and notices. Read `notices/portable-release-review.json`; `sourcePublication.distributable` governs the inspected original-source distribution; the top-level `distributable` flag governs dependency-bundle clearance. Archive-only `MANIFEST.json`, `RELEASE-GATE.json` and `assets` paths are generated during packaging and are not source-checkout entrypoints.

For isolated evaluation, run `node scripts/prepare-portable-fixture.mjs <new-temporary-directory>` from the checkout, then follow README's fixture commands in that new directory. For target integration reuse `src` and the opt-in `templates` with the exact dependency locks and the target's authorization; a local Skill install only copies source files and does not install backend dependencies. Review dependency notices and host policies before building or distributing an installed application.

## Extracted artifact

The artifact has `assets/runtime` (actual canonical source and pinned lock), `assets/integration` (typed contracts and native Payload factories), `assets/fixture` (a separate neutral manifest and React/esbuild fixture), scripts, notices and `MANIFEST.json`.

1. `node scripts/verify-artifact.mjs <skill-root>` checks hashes and excluded files. `--release` also enforces the artifact-specific `RELEASE-GATE.json`. A source-only gate does not clear dependency bundles; inspect `dependencyRedistributionCleared` and `dependencyBlockers` before redistributing installed or compiled dependencies.
2. `node scripts/install-runtime.mjs <new-target-package-directory>` copies actual runtime files without overwriting existing files or changing package.json, AGENTS, credentials or the host configuration. Connect the local package with the target's existing package manager and use its locked versions. Next uses `transpilePackages: ['@add-cms/core']`; import Puck CSS and runtime editor/canvas CSS only in authenticated editor layouts.
3. `node scripts/install-fixture.mjs <new-temporary-directory>` creates a synthetic evaluation project without production data. In that directory run `npm ci --ignore-scripts`, `npm test`, `npm run types`, `npm run build`. This proves component portability, not a new production backend or completed CMS ACL integration.
4. The fixture editor route is internal test infrastructure, disabled unless its explicit fixture flag is present; never copy that flag as production authentication. Implement actual CMS auth in the target's admin view.

The base fixture has no Next/Payload/sharp dependency path. Its public React-prerendered page imports only public.css; editor assets belong to the disabled private fixture route. The separate backend fixture is not an implicitly installed base dependency.

No package contains node_modules, database files, secrets, uploads or original-site content. Native addon/build dependencies belong to the host framework and need its own license/platform review; the portable runtime lock does not include Tailwind's WASI host-build bundle. Keep runtime and host licensing conclusions separate.

## Complete Payload evaluation from the real archive

Run `python3 scripts/check-archive.py <archive>` before using an unpacked candidate. It validates actual members and extracts only regular, manifest-listed files, with no paths, links, AppleDouble, ownership metadata or secrets. The Python packer produces reproducible gzip/USTAR bytes and ignores `.DS_Store`/`._*`; system tar on macOS previously added AppleDouble even when staging looked clean.

`node scripts/install-payload-fixture.mjs <new-temporary-directory>` installs the fixture files, integration source and its full pinned host lock from the actual artifact. In that new directory run:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node --import tsx fixture/verify.mjs
node --import tsx integration/tests/check-coordinator.mjs
NODE_ENV=development node --import tsx integration/tests/check-sqlite.ts
npm run build
node fixture/check-http.mjs
```

The integration explicitly requires Payload/UI/db-sqlite 3.92.0 and async-mutex 0.5.0, not resolution from a parent project's node_modules. Preserve the pinned DOMPurify security override when preparing the lock; dropping it made `npm ci` reject a missing 3.4.15 entry. Do not use force or legacy-peer flags to conceal a broken lock.

Real SQLite tests cover native draft/manual save, server-journal reload, own-patch publication, other-author drafts, real version restore, all-table rollback, parallel revision conflicts and external-lock fail-closed behavior. They do not constitute a deployed auth, browser or multi-process database test. See the main Skill's single-owner SQLite restriction before adapting the host template. A separate SQL database adapter needs its own verified concurrency contract.

The SOURCE-ONLY artifact uses the same real assets paths and verification scripts, with owner source/templates and exact dependency declarations but no installed third-party code. Its integration factories still require target configuration and authorized schema changes. Original source is available under MIT, and approved media retains its separate terms. Copying these source files does not redistribute the declared dependencies; installing, compiling or bundling those dependencies has a separate notice and distribution review.
