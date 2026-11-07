# 002 — Project work

## What it is

The first connected JobLens mobile scope: work on projects from the field. The home dashboard is a feed of recent project updates. Authentication and context selection exist only to give users access to their permitted projects.

## Ownership and intended behavior

Capture and upload is implemented as a spike ([003](003-offline-photo-capture.md)); the other workflows below are planned.

| Area               | Mobile responsibility                                                                               | Boundary                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Project feed       | Show recent updates from permitted projects and open the related project context                    | Use server-provided activity; do not infer events from unrelated data or turn this into a business dashboard |
| Projects           | Find, open, and work within permitted projects using backend-supported actions                      | Laravel owns project records, validation, organization membership, and permissions                           |
| Capture and upload | Capture photos/videos or select existing files, then show authorized transfer progress and outcomes | Capture and upload remain separate concerns; use the shared backend ingestion path                           |
| Media management   | Browse and inspect project media and perform supported management actions                           | Do not own storage, original processing, retention, or deletion policy                                       |
| Checklists         | View assigned or available project checklists, complete items, and show their state                 | Creating checklists, editing their structure, and managing templates stay in the desktop app                 |
| Collections        | Organize and view selections of existing project media                                              | Reference media records; do not duplicate ingestion or file storage                                          |
| Markup             | Annotate an image and save an associated result                                                     | Preserve the original; agree the persistence contract before implementation                                  |
| Sharing            | Create and manage permitted project or media sharing links and invoke the native share interface    | Laravel owns link access and expiry rules                                                                    |
| Upload requests    | Create, share, and manage project upload requests                                                   | Laravel owns public contribution rules; requested capture items are not project checklist items              |

## Should do

- Keep the project and relevant action clear throughout a workflow.
- Use the user's permitted organization and project context for every request.
- Show server-backed state accurately, including processing, errors, and unavailable actions.
- Preserve original media and reuse resource identifiers across media, collections, and markup.
- Connect features directly where necessary through small, explicit interfaces. Shared project/media context does not require a generic event bus or a new framework.

## Must not do

- Add billing, subscription management, team administration, CRM, or other workflows unrelated to project work.
- Create checklists or checklist templates in the mobile app.
- Duplicate backend business rules or treat hidden buttons as authorization.
- Promise offline completion or real-time delivery for a workflow before it is designed and implemented. Photo capture is offline first ([003](003-offline-photo-capture.md)).

## Current state and next dependency

Sign-in, the project list and photo capture/upload use the Laravel mobile API ([003](003-offline-photo-capture.md)). The other workflows need their own API endpoints and device checks. Add focused feature documents as those contracts become concrete.
