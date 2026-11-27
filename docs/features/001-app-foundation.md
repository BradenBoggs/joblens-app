# 001 — App foundation

## What it is

The initial Expo application and navigation shell for JobLens on iOS and Android. It gives subsequent project features a consistent place to live.

## Owns

- Expo and TypeScript configuration, app startup, and Expo Router navigation.
- Home and Projects tabs, plus a limited account screen.
- Shared visual tokens and the components needed by these screens, including the app shell every screen is built on ([UI guidance](../UI.md#app-shell)).
- Developer setup, agent guidance, and a small documentation structure.

## Should do

- Open to a feed intended for recent project updates.
- Make Projects easy to reach and reserve space for future project workflows.
- Explain that backend connection is pending without implying the user is signed in.
- Keep route files thin and feature screens separate from shared presentation.
- Support readable text, accessible controls, and safe-area layout.

## Must not do

- Invent authentication, credentials, project records, API endpoints, or successful network operations.
- Build billing, organization administration, sales, or unrelated business dashboards.
- Install infrastructure for future workflows before there is an implemented need.

## Current state

The foundation provides the navigation shell: a top bar slot, content, and a bottom bar slot that each page fills. The shell has not been checked on a device. Sign-in, Projects and Uploads are now connected through [003 — Offline photo capture](003-offline-photo-capture.md); Home is still unconnected. The planned workflows are recorded in [002 — Project work](002-project-work.md). Use the [engineering workflow](../engineering/WORKFLOW.md) and completion records for validation results; this document is not evidence that a device build or backend integration has passed.
