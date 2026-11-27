# Mobile UI

## Direction

JobLens should feel practical, clear, and dependable for project work in the field. Use a light canvas, strong text hierarchy, simple surfaces, and restrained orange accents. The foundation uses native system fonts.

Shared tokens in `src/theme/tokens.ts` are the source of truth for visual values, and they match the variables in the JobLens UI Systems Figma file. Brand orange is `#FF6A21`, primary text is `#111827`, and secondary text is `#56698A`. Use white and pale slate (`#F0F4F8`) surfaces. Avoid gradients, decorative dashboards, or a separate style for each feature.

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

The current type scale is 24/30 bold for screen titles, 20/28 semibold for headings, 16/24 for body text, 14/20 semibold for labels, 13/20 for metadata, 16/24 semibold for bar titles, and 12/18 for bar subtitles and tab labels. These are native logical units; keep system font scaling enabled. Use 20-point phone gutters, 16–24-point content spacing, 8-point corner radii, and a minimum 48-point control target. See `src/theme/tokens.ts` for the implemented values.

## App shell

Every screen is built on `AppShell` (`src/components/shell/`). It has three slots: a top bar, the content, and a bottom bar. Each page decides what goes in the two bar slots, so the bars change or disappear from page to page. An empty slot hides that bar and the content takes its space.

| Page kind                     | Top bar                                                                  | Bottom bar                         |
| ----------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| Main tab (Feed, Projects…)    | `MainTopBar`: JobLens mark, optional actions, account avatar             | `MainTabBar`                       |
| Page opened from another page | `PageTopBar`: back button, centred title and subtitle, up to two actions | None, or a bar built for that page |
| Full-screen task (camera)     | None                                                                     | None                               |
| Signed out                    | None                                                                     | None                               |

- Main tabs get their bars from `MainTabShell` in the route file. Any other page renders `AppShell` itself and passes its own bars.
- Build a new bar from the parts, not from scratch: `TopBar` has `left`, `center`, `right` and `below` slots; `BottomBar` takes `BottomBarItem`s or any other controls.
- Bar buttons are drawn at 40 points with a 48-point touch area. Their sizes and corner shape are the `shell` tokens.
- The centred title is one line and shortens with an ellipsis. Put longer context in the page content.
- The bars own the safe areas at their edge. Screens inside the shell do not add status bar or home indicator padding.
- The navigators draw no headers or tab bars. The system back gesture and the Android back button behave like the back button.

## Navigation

- **Feed:** recent updates from permitted projects. It is not a business metrics dashboard.
- **Projects:** find and open permitted projects; project workflows belong within that context.
- **Uploads:** photos saved on the phone that are waiting to reach JobLens.
- **Account:** identity and access support, opened from the avatar in the top bar. Keep billing, team administration, and organization configuration in the desktop app.

Keep navigation visible and predictable. Do not add a top-level tab for every planned project feature. The project detail structure can grow when those workflows are implemented.

## States and interactions

The foundation is unconnected. Explain that limitation plainly, without presenting fabricated projects or an empty state that implies a successful server response. Do not place active-looking controls on screens when they have no meaningful action.

Connected features should distinguish loading, a confirmed empty result, a failed request, and missing permission. Preserve useful context after errors and provide recovery when it exists. Confirm consequential actions through the interaction appropriate to that action; do not add confirmation dialogs to routine navigation.

Accessibility labels should describe icon-only controls. Keep reading order sensible and test larger text alongside normal text. Request device permissions when a user begins the relevant capture or library action, with an explanation tied to that task.
