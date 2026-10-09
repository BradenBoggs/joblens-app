# Documentation guidance

- Keep documents short enough to use while implementing. Explain the feature, its owner, intended behavior, boundaries, and current state.
- Update the existing authoritative document before adding another one. Keep [INDEX.md](INDEX.md) useful as a small navigation map.
- Distinguish implemented behavior from planned scope. Screens, API integration, and device validation are separate milestones.
- Record settled decisions in feature or architecture documents. Keep implementation steps and remaining work in execution plans.
- Follow current user direction when it changes an earlier decision; update the affected text instead of accumulating contradictory appendices.
- Do not turn examples, old plans, or speculative future needs into mandatory architecture. Avoid repeating the same rule across feature documents.
- Document an external API only after checking the actual contract. Include the source of a dependency or API decision when it affects implementation.
- Write original public documentation. Do not copy private backend instructions, customer records, secrets, or time-sensitive vendor price tables into this repository.

Use [features/README.md](features/README.md) for the feature format and [exec-plans/README.md](exec-plans/README.md) for the plan format.
