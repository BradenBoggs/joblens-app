# App source guidance

Use [architecture](../docs/ARCHITECTURE.md) for ownership and API changes, [UI guidance](../docs/UI.md) for presentation, and the relevant [feature document](../docs/features/README.md) for product behavior. Read what the task needs.

- Keep `app/` route files thin: compose navigation and render feature screens. Route files should not accumulate feature logic.
- Build every screen on `AppShell` and fill its top and bottom bar slots; see [App shell](../docs/UI.md#app-shell). Do not turn navigator headers or tab bars back on.
- Put feature screens and their local components together in `features/`. Use shared components and theme tokens for UI that is actually reused.
- Use strict TypeScript and React Native `StyleSheet` for the foundation. Prefer platform and Expo primitives before adding packages.
- Add state at the narrowest useful scope. Do not introduce a global store, query layer, or persistence framework for the unconnected shell.
- Keep camera capture, upload transport, and gallery interaction as separate responsibilities. They can use the same server media identifiers without owning each other's behavior.
- Native code may request an authorized operation; it cannot grant permissions or decide organization access. Do not infer a supported mobile API from a web route.
- Keep originals intact. Future markup must save a separate result according to the backend contract; preview generation and media processing belong to Laravel.
- Give every screen that loads content a skeleton loading state (`Skeleton`, `SkeletonRows`) in the shape of the content, not a spinner.
- Show honest loading, empty, unavailable, and error states. An unconnected app must not display fabricated project activity, uploads, or a successful sign-in.
- Make controls accessible and usable with safe areas, larger text, and the platform keyboard. Avoid fixed-height text containers that clip content.

Add feature-specific guidance only when a real local distinction needs it. A folder does not need its own `AGENTS.md` by default.
