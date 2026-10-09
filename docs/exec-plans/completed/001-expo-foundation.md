# 001 — Expo foundation

Status: implementation complete. Native device builds and backend integration remain separate work.

## Goal and scope

Initialize the empty `joblens-app` repository with a usable Expo foundation and concise agent/document structure. The owner's initial mobile scope is project work: a recent-project-update feed, projects, media, checklist completion, collections, markup, sharing, and upload requests. Checklist creation stays in the desktop app.

## Implementation

- Started from the stable Expo SDK 57 template's supported dependency set, then removed its demonstration UI and experimental opt-ins.
- Added Feed and Projects tabs, a limited account screen, and missing-route recovery. Screens explicitly say the account/data connection is unavailable; there are no invented records or requests.
- Reused the JobLens mark and added shared native typography, color, spacing, and control tokens.
- Kept routes thin and placed screens with their feature owners. No speculative feature folders, API endpoints, data stores, or upload infrastructure were added.
- Added npm lockfile, Node guidance, formatting/lint/type checks, Expo health checks, EAS build profiles, CI, and concise agent/feature/workflow docs.
- Recorded the native/backend ownership boundary. The app will consume a verified API and the existing shared media ingestion path.

## Verification performed

| Check                             | Result                                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean `npm ci`                    | Passed                                                                                                                                        |
| `npm run check`                   | TypeScript, ESLint, and Prettier passed                                                                                                       |
| `CI=1 npm run check:dependencies` | Dependencies match the installed Expo SDK                                                                                                     |
| `npm run doctor`                  | 21/21 checks passed                                                                                                                           |
| `CI=1 npm run export`             | iOS, Android, and web production bundles generated                                                                                            |
| Web navigation smoke test         | Feed opens; Projects navigation, account open/close, direct account entry, and missing-route recovery pass; no uncaught browser errors        |
| Web visual inspection             | 390 × 844 phone and 1024 × 768 tablet previews inspected; no horizontal overflow; primary action has a usable touch target and tab labels fit |
| Documentation links               | All repository-relative links resolve                                                                                                         |

Local JavaScript checks ran on Node 24.19.0/npm 11.9.0, which meet the SDK minimum. CI is configured for Node 22 LTS. The optional browser smoke test used a temporary Chromium harness outside the app dependency tree; no browser-testing infrastructure was added to this initial app.

Visual review caught a lost Pressable style through a link wrapper and clipped tab labels. The navigation controls now use ordinary Router navigation handlers; tab height accounts for safe area and font scale. The production bundles and navigation checks passed after those repairs.

## Remaining work

1. Establish the native authentication, membership/project access, and project-feed API contract in the Laravel backend. Then connect the first read-only project slice.
2. Implement the [project workflows](../../features/002-project-work.md) in cohesive slices with the corresponding server support.
3. Link the real Expo project and complete iOS/Android development builds. Verify native back/navigation, direct links, safe areas, rotation, larger text, screen readers, and final launcher/splash appearance.

No native binary was compiled or signed, no device acceptance was claimed, and no store app, EAS account linkage, backend change, or release was created by this foundation. This record describes the initialization; current product and architecture documents own future decisions.
