# Features

| Document                                                    | State                    | Purpose                                                      |
| ----------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| [001 — App foundation](001-app-foundation.md)               | Initial navigation shell | Expo setup, shared UI, and honest unconnected screens        |
| [002 — Project work](002-project-work.md)                   | Planned workflows        | Product scope and ownership for the first connected features |
| [003 — Offline photo capture](003-offline-photo-capture.md) | Spike, not device-tested | Sign-in, saved projects, camera and the offline upload queue |

## Feature document format

Use the smallest document that explains:

- **What it is:** the user need and scope.
- **Owns:** the feature's responsibility and necessary boundaries.
- **Should do:** expected behavior.
- **Must not do:** meaningful exclusions and invariants.
- **Current state:** implemented behavior, dependencies, and remaining work.

Split a scope document into separate feature documents when implementation needs a distinct contract. Do not create speculative documents for every future screen. Keep implementation steps in [execution plans](../exec-plans/README.md).
