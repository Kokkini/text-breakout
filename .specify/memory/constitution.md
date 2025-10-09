<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A → concrete static-site principles defined
- Added sections: Additional Constraints; Development Workflow
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated
  - .specify/templates/tasks-template.md ✅ updated
  - .specify/templates/spec-template.md ✅ no change
  - .specify/templates/checklist-template.md ✅ no change
  - .specify/templates/agent-file-template.md ✅ no change
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; set once known
-->

# Text Breakout Constitution

## Core Principles

### I. Static-Only Delivery (NON-NEGOTIABLE)
All user-facing functionality MUST be delivered as static assets (HTML, CSS, JS,
images, fonts). No server-side code or stateful backend may be introduced.
Client-side logic is permitted, but deployment MUST remain compatible with
static hosting providers.

Rationale: Guarantees low operational complexity, zero backend maintenance, and
portable deployments.

### II. No Secrets in the Client
The codebase MUST NOT embed secrets, private keys, or credentials. Any external
service used MUST support public, unauthenticated access or tokenless read-only
endpoints. If write or privileged access is ever required in future, governance
amendment is required prior to implementation.

Rationale: Client-side code is fully inspectable; secrets cannot be protected.

### III. Performance Budget
The project MUST meet the following budgets on a mid-range device over typical
mobile conditions:
- LCP ≤ 2.5s
- CLS ≤ 0.1
- JS shipped ≤ 200KB gzip (initial), images optimized and lazy-loaded

Rationale: Ensures fast experiences on constrained devices and networks.

### IV. Accessibility AA
Pages MUST meet WCAG 2.1 AA: semantic HTML, focus visibility, color contrast,
keyboard operability, and ARIA only where necessary. Automated checks (e.g.,
axe/lighthouse) SHOULD report no critical violations before release.

Rationale: Inclusive access and legal compliance.

### V. Simplicity and Stability
Prefer vanilla web platform features and minimal tooling. Introduce dependencies
only when they materially reduce complexity. Breaking changes to URLs or public
behaviors MUST be versioned and documented in `docs/`.

Rationale: Smaller surface area improves maintainability and reliability.

### VI. Single Application Structure
The project MUST maintain a single entry point at the root (`index.html`) that
integrates all functionality. Features MUST be built upon existing application
structure rather than creating parallel systems or duplicate entry points.

Rationale: Ensures unified user experience, reduces complexity, and maintains
consistency with existing application patterns.

## Additional Constraints

- Hosting: Any static hosting (e.g., GitHub Pages, Netlify). No server runtime.
- Data: Content MUST be bundled at build time or fetched from public, CORS-
  enabled read-only endpoints. Offline or fallback behavior SHOULD be provided
  where trivial (e.g., cache-first for static assets).
- Security Headers: Provide guidance for CSP, SRI for third-party scripts,
  `Referrer-Policy`, and `X-Content-Type-Options` via hosting config where
  supported.
- Application Structure: All features MUST be integrated into the single root
  `index.html` file. No parallel application structures or duplicate entry points
  are permitted. New functionality MUST extend existing application patterns.

## Development Workflow

- Branching: feature branches named `###-feature-name`.
- Reviews: Each PR MUST include a performance and accessibility check result
  (Lighthouse/axe screenshots or text) and a Constitution Check acknowledgment.
- Testing: Visual verification across at least one desktop and one mobile
  viewport. Automated linting and build MUST pass.
- Releases: Each deploy increments a project changelog entry; breaking changes
  require a migration note.
- Structure Validation: All features MUST be verified to integrate into the single
  root `index.html` without creating parallel application structures.

## Governance

- Supremacy: This constitution supersedes other practices.
- Amendments: Proposals MUST specify diff, rationale, and migration impact, and
  obtain approval before merging. On approval, update version and dates below.
- Versioning Policy: Semantic versioning for this document.
  - MAJOR for backward-incompatible governance changes.
  - MINOR for added or expanded principles.
  - PATCH for clarifications without semantic impact.
- Compliance: PR reviewers MUST gate on the Core Principles and Constraints.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-01-27