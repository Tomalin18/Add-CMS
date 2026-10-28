# Component provenance

The bundled source is the project's integration code around public OSS APIs. It does not contain a copied paid editor template, GPL/AGPL/SSPL implementation, or a cosmetically rewritten restricted implementation.

- Puck 0.23.0 (MIT): mapped renderer, inline rich text, public UI/history APIs. Exact v0.23.0 LICENSE is retained.
- Tiptap 3.32.0 (MIT): core commands, Image, YouTube, DragHandle/NodeRange. Local video is a native HTML video atom adapter, not a claimed official extension-video.
- React Aria Components 1.22.1 (Apache-2.0): actual select/combobox/color/dialog controls; Radix context/dropdown menus (MIT), Floating UI positioning (MIT), Lucide icons (ISC with Feather MIT notice) retain installed license texts.
- Plate's published FontSizeToolbarButton interaction was researched as a reference for editable size choices. No Slate plugin, block transform or Plus component was copied; its previously retained MIT notice is included separately. This is not a dependency or claim of plug-and-play compatibility.
- Runtime notices and exact artifacts/integrities are generated from the pinned runtime dependency closure, not inferred from Puck's root SPDX. `notices/runtime-audit.json` and `RELEASE-GATE.json` describe an extracted candidate; the source checkout uses `notices/portable-release-review.json`.

Unresolved source provenance must stay blocked. The ScrollBar notice is retained from official source proven to reproduce all 12 npm 2.3.8 executable files byte-for-byte; its license-only commit adds no source changes. This is not represented as a historical notice shipped inside the npm release. Host framework build bundles need their own review; excluding them here does not clear the original host's distribution obligations.

The clean full runtime audit additionally found client-only@0.0.1 without a full notice; exact npm metadata has no repository/gitHead/author. This is a separate unresolved gate, not an assumption borrowed from ScrollBar. See the applicable source review or archive release gate above.

The optional backend fixture is a separate dependency closure. In extracted artifacts, `notices/integration-audit.json` records installed exact metadata. In this source checkout, `notices/portable-release-review.json` records the optional backend review, including exact dependency paths, retained notices and LGPL native component limits. Selected exact-release license texts are retained in `notices/payload-backend-THIRD-PARTY-NOTICES.txt`; this is not full closure clearance. Platform-optional artifacts not installed on the evaluation machine are not cleared. The editor runtime's two exact-notice gaps are not a full backend audit. No backend dependency code is bundled in source-only delivery.
