# Integration guards

Version context: Payload/db-sqlite 3.92.0, Puck 0.23.0, Tiptap 3.32.0 and React Aria Components 1.22.1. Recheck supported APIs when changing pins. These are distilled engineering findings, not browser acceptance or a universal backend guarantee.

## Selection, menus and history

- Puck's default inline menu can anchor to a whole mapped component instead of the selected text. `SelectionMenu` uses an ownerDocument DOM Range virtual reference and Floating UI autoUpdate. Coordinates already measured inside an iframe must not receive a second host offset. Preserve the same subtree while a child menu owns focus.
- React Aria modal popovers made the canvas/tools inert in an actual in-memory integration fixture. Use the current nonmodal child popovers and scoped portal container. Puck field focus is opaque state: `RichTextMenuBridge` captures/restores it via public UI actions and the actual mapped component ID. Do not guess private IDs, globally cancel blur or repeatedly reopen menus with timers. Intermittent user-reported dropdown closing still needs real user acceptance; pointer-only tests did not reproduce every case.
- A Puck history restore can leave editor focus metadata stale and ignore later format changes. Test an exact new style in both editor HTML and Puck onChange after undo/redo and mode switching. `content-history` skips UI-only same-content snapshots without deleting history. Keep the Puck root mounted across preview.
- Cross-editor paste rules can delete source nodes before rejecting an incompatible drop. Reject such drops before paste-rule handling; preserve node IDs and test actual paragraph/image order, undo/redo and later edits. Puck component drag is not rich paragraph drag.
- Hover font/size/color is a decoration, not a committed mark. It must not reach native dirty/autosave or undo. Escape, pointer exit, selection changes and closure clear it.

## Native saving and previews

- In Payload 3.92, `beforeSubmit` runs after the native form has captured its data. Waiting there cannot include pending canvas input. Use the supplied custom-view Form boundary and paired submit controllers to flush first, then call one native submit. Test last-character publish, autosave, HTML submit and concurrent response ordering. A field-only DefaultEditView integration is not covered.
- Use root `@payloadcms/ui` consistently with its RootProvider. Mixing root and modular component/hook entrypoints produced different provider contexts in the pinned SDK. Native Form's ref can identify its wrapper `div`; dispatch HTML submit tests on the real inner `form`, and assert exactly one form rather than weakening persistence checks.
- Debounced editor state can lag behind the last character. Flush the current public snapshot before native submit; compare canonical content rather than HTML strings when structures differ but semantic content matches. A timeout must identify the stage and preserve edits.
- Projected initial/default values are not persisted revision baselines. Bootstrap revisions from stored records and normalize unchanged shared fields before computing own patches. Reload ownership comes from a server journal, never localStorage. Do not let delayed autosave responses replace newer typing.
- Rebuilding/remounting the canvas on save responses can run the original website's scroll-to-top behavior. Apply acknowledgements through public data actions without remounting. Do not globally restore stale scroll coordinates over a user's own scrolling.
- Manual save and new-tab preview reuse the native writer, flush pending edits, serialize against background saves and refuse upload-pending state. Preview authenticates staff, reads drafts and never publishes assets. Content-free stage/code/status diagnostics are sufficient; do not log text, URLs, tokens or account data.
- Collection afterRead hooks also receive projected records used by admin metadata. Do not assume the content group exists or synthesize a revision from a partial record. Guard the complete-record shape before applying read-time fallback; test a projection without content as well as a full draft. An unguarded fallback caused a blank edit view despite successful authentication.
- Plain/rich deep-merge residue can let stale sidecars override new text. Normalize one authoritative bounded representation while retaining old-version fallback. Roundtrip official LinkNode v3, NodeState and upload v3 shapes, not only handmade v1 fixtures. Unsupported legacy data must refuse editing rather than flatten silently.

- An acknowledged draft can become unpublishable when the clean-form button condition relies only on a stale unpublished-version counter. In the pinned Payload custom-view controller, also accept the native acknowledged document's `_status: 'draft'`; a clean published document stays disabled. Regression: save, clear modified state, keep the counter at zero, then assert Publish remains enabled for the saved draft. Do not fake a counter or introduce another draft state source.

## SQLite and migration safety

- Parallel BEGIN reproduced SQLITE_BUSY in Payload/db-sqlite/drizzle 3.92.0 with @libsql/client 0.14.0/libsql 0.4.7; later SDK commits could fail without propagating failure. Use the supplied async-mutex 0.5.0 transaction adapter and assert persisted values, rollback/table digests and conflict responses, not merely HTTP success. [Upstream mechanism](https://github.com/tursodatabase/libsql-client-ts/issues/352) is context, not evidence about every later version.
- The wrapper is single-owner per file. External SQL writers poison the owner fail-closed until controlled restart. It does not certify arbitrary disk failures or multi-process SQLite. Do not automatically retry, clear locks or reseed.
- Blind schema push after partial migrations can duplicate indexes. Inspect real schema first, consistent backup, exact additive authorized deltas, idempotence, FK/integrity and all existing row/version preservation. Never restore a backup over newer user edits as an automatic code rollback.

## Media and event handoffs

- Puck pointer capture prevented the first official FileTrigger press in an isolated integration case. Keep the current event path and test real pointer down/up through the mapped target; a mocked choose callback is insufficient. Actual OS dialogs remain user acceptance.
- Opening a React Aria popover during Radix onSelect can immediately dismiss it on the context menu's default focus restoration. Use supported onCloseAutoFocus handoff rather than arbitrary timeouts.
- Replace creates a new immutable media ID; unlink never deletes shared bytes. Per-position alt is separate from shared asset identity. Missing uploader provenance cannot be guessed/backfilled. A metadata hash requires a server prohibition on same-ID file replacement; it is not byte hashing.
- Publish only actual snapshot references from the current uploader inside the page transaction after access/type/signature checks. Failures roll back page/settings/media. Draft media stays authenticated, no-store and excluded from public image optimization.

## Build and delivery

- Import official Payload CSS. Browser extensions may inject hydration attributes absent in raw HTML; do not suppress real warnings globally.
- Payload runtime importMap must not contain CLI generator functions, which cause RSC function-serialization errors. CLI generation and runtime config need separate supported paths.
- Keep dev/build/test output directories disjoint and consume complete HTML streams for errors. An intermittent Webpack module failure was not proven to result from shared output directories; its original root cause remains unresolved. A guard or restart does not establish a fix.
- macOS tar can add AppleDouble absent from staging. Use the deterministic Python packer and validate actual tar regular members, normalized metadata, hashes and privacy. Install/type/build/test from the extraction. Keep release-gate rejection observable, including temporary path aliases.

Use `assets/fixture` for an independent neutral manifest and `assets/integration/tests/check-sqlite.ts` for real temporary backend transactions. They do not prove a new target's production ACL or browser behavior. Preserve the distinction between program evidence and user acceptance. Image wrapping and arbitrary iframe insertion are unsupported.

- A no-sharp Payload/Next evaluation must test the build as well as uploads. Next 16.4.3 still invoked sharp for static-import blur generation with only `images.unoptimized`. A bounded profile used `disableStaticImages` plus standard Webpack asset/resource handling and explicit MIT platform binaries while omitting optional dependencies. Real PNG upload/dimensions, private access, publication and complete Next HTTP output passed. This does not provide resize/crop/optimization, clear dependency notices, or establish other-platform compatibility.
