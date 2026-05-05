---
phase: 1
slug: premium-ui-foundations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x (Wave 0 Install) |
| **Config file** | `frontend/vite.config.ts` (to be updated) |
| **Quick run command** | `npm test -- frontend` |
| **Full suite command** | `npm test -- frontend` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- frontend`
- **After every plan wave:** Run `npm test -- frontend`
- **Before /gsd:verify-work:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | UI-01 | — | N/A | install | `npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | UI-01 | — | N/A | unit | `npm test -- src/index.css` | ✅ / ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | UI-04 | — | N/A | unit | `npm test -- src/lib/motion.ts` | ✅ / ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `frontend/src/tests/setup.ts` — Vitest setup
- [ ] `frontend/vite.config.ts` — Vitest configuration
- [ ] `npm install -D vitest` — Test framework installation

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Smooth Page Transitions | UI-04 | Visual motion is subjective and hard to automate perfectly in JSDOM | Manually navigate between routes and verify the "Subtle Slide" animation curve |
| Micro-interactions | UI-04 | Button hover/active states | Verify hover states on premium buttons feel "snappy" but soft |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
