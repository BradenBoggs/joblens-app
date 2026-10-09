# Mobile UI

## Direction

JobLens should feel practical, clear, and dependable for project work in the field. Use a light canvas, strong text hierarchy, simple surfaces, and restrained orange accents. The foundation uses native system fonts.

Shared tokens in `src/theme/` are the source of truth for visual values. Brand orange is `#FF5A1F`, primary text is `#101828`, and secondary text is `#667085`. Use white and pale slate surfaces. Avoid gradients, decorative dashboards, or a separate style for each feature.

## Hierarchy and layout

| Element              | Treatment                                                            |
| -------------------- | -------------------------------------------------------------------- |
| Screen title         | The strongest text on the screen; name the place or task clearly     |
| Section heading      | Smaller than the screen title and stronger than surrounding content  |
| Project or item name | Easy to scan before its metadata                                     |
| Body text            | Comfortable size and line height; concise, plain wording             |
| Supporting details   | Quieter color without making necessary information difficult to read |
| Primary action       | One clear emphasis for the current task                              |

Use spacing to group related information before adding more borders or cards. Let content grow with larger text. Respect safe areas and keyboard space. Use generous touch targets and labels that explain an action.

Orange is an accent, not a default text color. Use dark text on orange controls where needed for contrast; do not assume small white text is readable on brand orange. Communicate status with words or icons as well as color.

The current type scale is 24/30 bold for screen titles, 20/28 semibold for headings, 16/24 for body text, 14/20 semibold for labels, and 13/20 for metadata. These are native logical units; keep system font scaling enabled. Use 20-point phone gutters, 16–24-point content spacing, 8-point corner radii, and a minimum 48-point control target. See `src/theme/tokens.ts` for the implemented values.

## Navigation

- **Feed:** recent updates from permitted projects. It is not a business metrics dashboard.
- **Projects:** find and open permitted projects; project workflows belong within that context.
- **Account:** identity and access support. Keep billing, team administration, and organization configuration in the desktop app.

Keep navigation visible and predictable. Do not add a top-level tab for every planned project feature. The project detail structure can grow when those workflows are implemented.

## States and interactions

The foundation is unconnected. Explain that limitation plainly, without presenting fabricated projects or an empty state that implies a successful server response. Do not place active-looking controls on screens when they have no meaningful action.

Connected features should distinguish loading, a confirmed empty result, a failed request, and missing permission. Preserve useful context after errors and provide recovery when it exists. Confirm consequential actions through the interaction appropriate to that action; do not add confirmation dialogs to routine navigation.

Accessibility labels should describe icon-only controls. Keep reading order sensible and test larger text alongside normal text. Request device permissions when a user begins the relevant capture or library action, with an explanation tied to that task.
