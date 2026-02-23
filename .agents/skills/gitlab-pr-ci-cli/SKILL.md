---
name: gitlab-pr-ci-cli
description: Use GitLab CLI (`glab`) to create merge requests (PR/MR), inspect CI pipeline status, diagnose failed jobs, and run retry/cancel actions from terminal workflows. Trigger this skill when users ask to commit change, create/open an MR, check CI results for a branch, investigate CI failures, or confirm merge readiness.
---

# GitLab PR CI CLI

Use this skill to execute GitLab collaboration flow with `glab`: create MR from the current branch, inspect CI quickly, and handle failed jobs without leaving terminal.

## Preconditions

Run these checks first:

```bash
glab auth status
git remote -v
git branch --show-current
```

Avoid creating MR from `main` or `master`. Switch to a feature/fix branch before continuing.
Note: For this project, the target branch is `main`.

## Pre-Submit Quality Gate

Before creating or updating an MR, run code-quality checks via subagents:

1. Use `code-simplifier` subagent to simplify recently modified code without behavior changes.
2. Use `development-quality-check` subagent to enforce project standards and run checks.
3. Use `uv`-based execution for Python checks (either `uv run ...` directly or repository scripts that internally call `uv`).
4. Confirm verification commands pass:

```bash
# These scripts run Python tooling through uv internally
bash backend/scripts/shell/lint.sh
timeout 600 bash backend/scripts/shell/test.sh
```

If checks fail, fix issues first and then continue MR/CI operations.

## Create Merge Request (PR/MR)

Prefer the bundled script:

```bash
bash .agents/skills/gitlab-pr-ci-cli/scripts/create_mr.sh --target-branch main --draft
```

Use raw command when custom fields are needed:

```bash
glab mr create \
  --source-branch "$(git branch --show-current)" \
  --target-branch main \
  --title "Your MR title" \
  --description "Your MR description" \
  --yes
```

If branch is not pushed yet, push first:

```bash
git push -u origin "$(git branch --show-current)"
```

## Update Existing MR

Update MR title and description:

```bash
glab mr update <mr-id> \
  --title "New title" \
  --description "New description"
```

Mark MR as ready or draft:

```bash
glab mr update <mr-id> --ready
glab mr update <mr-id> --draft
```

## Check CI Pipeline Status

Prefer the bundled script for branch overview:

```bash
bash .agents/skills/gitlab-pr-ci-cli/scripts/ci_overview.sh --branch "$(git branch --show-current)"
```

Useful direct commands:

```bash
glab ci status --branch "$(git branch --show-current)" --compact
glab ci list --ref "$(git branch --show-current)" --per-page 5
glab ci trace <job-id>
```

## Handle Failures Quickly

Retry failed job:

```bash
glab ci retry <job-id> --pipeline-id <pipeline-id>
```

Cancel broken pipeline:

```bash
glab ci cancel pipeline <pipeline-id>
```

Open pipeline view in terminal UI or browser:

```bash
glab ci view --branch "$(git branch --show-current)"
glab ci view --branch "$(git branch --show-current)" --web
```

## Resources

- Script: `scripts/create_mr.sh`
- Script: `scripts/ci_overview.sh`
- Reference: `references/glab-workflow.md`
