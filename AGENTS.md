# JobLens mobile app

This repository contains the Expo app for iOS and Android. It is the mobile client for project work in JobLens; Laravel remains the application backend.

## Start here

Read the current request, then only the documentation relevant to the change:

| Need                                       | Read                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| Run the app and available commands         | [README.md](README.md)                                       |
| Find product and engineering documentation | [docs/INDEX.md](docs/INDEX.md)                               |
| Ownership and integration boundaries       | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                 |
| Visual and interaction decisions           | [docs/UI.md](docs/UI.md)                                     |
| Implementation and validation workflow     | [docs/engineering/WORKFLOW.md](docs/engineering/WORKFLOW.md) |

Scoped guidance lives in [src/AGENTS.md](src/AGENTS.md) and [docs/AGENTS.md](docs/AGENTS.md).

## Working defaults

- Keep the app focused on projects. The dashboard is a feed of recent project updates. Checklists can be completed here; checklist creation stays in the desktop app.
- Follow current user direction and reconcile affected documentation. Completed plans describe history, not permanent requirements.
- Prefer ordinary Expo, React Native, React, and TypeScript patterns. Start with direct code and small components; add abstractions or dependencies when an implemented need justifies them.
- Keep feature responsibilities separate. Share a component or utility when it has a real second use, without creating generic service, repository, or plugin layers.
- Treat server authorization and organization boundaries as authoritative. Never invent API routes, credentials, successful requests, or connected states.
- Keep this public repository free of secrets, private backend documents, customer data, and real customer media. Public app configuration cannot hold secrets.
- Preserve unrelated work. Make focused changes and update the relevant feature document when behavior or ownership changes.
- Use the documented validation commands for the affected work. Report what ran, what passed, and any remaining device or integration checks accurately.

Use [execution plans](docs/exec-plans/README.md) for substantial work. Routine fixes do not require a plan or a new approval step.
