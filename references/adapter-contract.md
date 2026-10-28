# Adapter contract

## Runtime and rendering

Use `assets/runtime` directly. `PuckShell`, `manifest`, `form-bridge`, `canvas-session`, mapped targets and the bounded codec are site-neutral. `rich-policy` supplies a route-configured URL policy and document validator; supply allowed style tokens and explicit image/video/block validators. Omitted media policies reject those nodes. Provide a lightweight safe public renderer; never feed editor HTML to arbitrary innerHTML.

The site supplies stable field IDs/typed paths, repeatable IDs, a renderer using its actual components, localized labels, allowed destination registry and CSS/theme. Whole-image targets wrap the original image; resource targets wrap real anchors. Plain/native fields remain strings. Persistent formatting needs real rich storage, not a tool whose marks disappear on save. Media IDs are positive numeric IDs in this pinned adapter; another ID shape needs a codec/validator assessment.

Appearance is configurable through scoped CSS, PuckShell.className and the `theme` helper. Apply theme variables to the authenticated document root for body portals, including iframe documents. React Aria locale is supplied through InlineControlConfig.locale. This is not a fully headless vendor-UI replacement; use official component overrides and retain accessibility.

## Native Payload integration

Instantiate `createPayloadCanvasField` once at client module scope with locally imported validators, not function props sent from RSC or a new component factory per render. The frame route must authenticate and check staff permissions. Bridge messages require exact origin/source/channel; never trust only their type.

Compose a supported custom document edit view with `PayloadCanvasForm` and the paired `PayloadCanvasPublish` / `PayloadCanvasAutosave` controllers. They use one native `Form.submit` writer after the canvas acknowledges its current snapshot. Do not keep DefaultEditView's default Publish/Autosave controls: those bypass this submit port. `beforeSubmit` alone cannot fix this because the pinned SDK captures form data before awaiting that callback. Use root `@payloadcms/ui` components/hooks consistently with its RootProvider; mixing modular entrypoints can create separate provider contexts. This is not a field-only DefaultEditView drop-in or a complete replacement for native scheduling/multi-locale controls.

`CanvasFrameBridge` plus `canvas-flush` flush current editor state before the same native form submits. `PayloadDraftPreview` supplies manual draft saving and the single new-tab preview entry; provide a fixed authenticated same-origin preview URL and localized stage errors. Neither action publishes content/media. Keep initialization and upload-pending guards, background-save serialization and explicit failures. A successful promise without confirmed response/persisted values is insufficient.

`PayloadCoordinator` parameterizes native beforeChange/afterRead coordination with collection keys, role checks, revision fields and shared projection/normalization. Reserve `canvasSession` as a virtual staff-only exchange, `canvasJournal` as server-owned client-inaccessible storage, and `formattingInput` as a virtual validation signal. Reload must bootstrap from stored revision and server journal, not projected form defaults or browser ownership. Shared publication overlays only the current actor's own patches onto published values and preserves other drafts in the same transaction. Native autosave and publication must use these hooks; a separate endpoint is not an equivalent test.

The pinned SQLite adapter requires `transactionOptions: {}` and `SerializedSqliteAdapter`. One Payload process owns each file. A competing external writer causes fail-closed writes until controlled restart; use another tested adapter for multi-process deployments. Actual temporary SQLite tests are bundled under `assets/integration/tests`, separately from model tests.

## Media

A relationship selector alone is not a visible local-file upload control. Put image fields near their relevant content and use a supported Upload field or `PayloadImageField` as a custom native field for the existing relationship path. The latter reuses FileTrigger and the same uploader; it changes only the native field value and joins the existing draft/publish writer, with no large picker or new endpoint.

`PayloadMediaUpload` uses Payload's authenticated multipart protocol after the official FileTrigger. Configure the media collection endpoint; no intermediate full-screen picker is required. The host must enforce role, MIME/byte signatures/size, draft read isolation, immutable file identity and no physical delete. Stable access-checked URLs must not become arbitrary remote proxies or public optimization caches.

`PayloadMediaPublication` takes media and auth collection keys plus staff/publisher checks. Its server-only uploader/fingerprint fields require a separately authorized additive migration; never auto-push or backfill a real database. The metadata fingerprint is not a byte digest. Reject same-ID byte/identity replacement server-side. Only unchanged, referenced, same-uploader assets may publish inside the page transaction. Missing provenance refuses automatic publication; already published media remains unchanged. The host must resolve and validate every actual reference in the snapshot before calling ensurePublished, and rollback all writes on failure.

The sample fixtures prove bounded factory behavior, not the target's production authentication or complete upload schema. Connect all ACL/hooks and test the actual native form path before enabling it.

For Payload admin branding, copy `PayloadAdminBrand.ts` from the integration templates and supply the host name, Logo/Icon component identifiers and same-origin SVG favicon. Merge its `components`/`meta` into the existing admin configuration, preserving other component slots. This uses Payload’s supported graphics and metadata APIs; it does not rename the underlying framework or remove third-party notices.
