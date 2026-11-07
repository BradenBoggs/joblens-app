# Execution plans

Use a plan for substantial work: a new connected feature, a change spanning several responsibilities, or work with important unresolved integration steps. Small, straightforward fixes can proceed without one.

Keep a plan limited to:

1. The goal and scope of this change.
2. The decisions or dependencies needed to proceed.
3. Key implementation steps.
4. Checks that establish the intended behavior.
5. Current status and remaining work.

Use a descriptive filename. Update the plan as work changes, and identify completion and any remaining limitations when finished. Record the validation actually performed; never equate a type check or web preview with testing a native build on a device.

Completed plans are historical records. Move lasting product or architecture decisions into their authoritative documents and link to them. A past plan must not force obsolete steps or an additional approval flow for routine work.

## Records

- [002 — Photo upload spike](active/002-photo-upload-spike.md): active; offline capture and upload against the Laravel mobile API.
- [001 — Expo foundation](completed/001-expo-foundation.md): initialization, actual verification, and remaining integration/device work.

Put a substantial plan in `active/` while it is being implemented, then move it to `completed/` when its scope is finished. Create the active directory when the first plan needs it.
