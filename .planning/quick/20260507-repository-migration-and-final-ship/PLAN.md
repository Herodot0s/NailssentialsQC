---
title: Repository Migration and Final Ship
slug: repository-migration-and-final-ship
status: in-progress
date: 2026-05-07
---

# Plan: Repository Migration and Final Ship

The goal is to prepare the current state of the project for shipment to a new repository: `https://github.com/Herodot0s/NailssentialsQC.git`.

## Steps

1. **Clean up and Commit**: Commit all current pending changes to the local branch to ensure no work is lost and the codebase is in a stable state.
2. **Configure New Remote**: Rename the current `origin` to `legacy` and add the new repository as the new `origin`.
3. **Final Push**: Push the current branch and all tags to the new `origin`.
4. **Update STATE.md**: Mark this quick task as complete.

## Verification
- [ ] `git remote -v` shows the new URL as `origin`.
- [ ] `git push origin` succeeds.
