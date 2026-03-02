# GitLab CLI Workflow Reference

## Create MR

```bash
glab mr create --source-branch <branch> --target-branch <target> --fill --draft
```

## List and inspect pipelines

```bash
glab ci status --branch <branch> --compact
glab ci list --ref <branch> --per-page 10
glab ci view --branch <branch>
```

## Debug failed jobs

```bash
glab ci trace <job-id>
glab ci retry <job-id> --pipeline-id <pipeline-id>
glab ci cancel pipeline <pipeline-id>
```

## Useful support commands

```bash
glab auth status
glab repo view
glab mr list --source-branch <branch>
```
