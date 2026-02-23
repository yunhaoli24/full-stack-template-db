#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  create_mr.sh [--target-branch BRANCH] [--title TITLE] [--description DESC]
               [--draft] [--yes] [--fill]

Options:
  -b, --target-branch   Target branch, default: origin default branch
  -t, --title           Merge request title (optional)
  -d, --description     Merge request description (optional)
      --draft           Create draft MR
  -y, --yes             Skip confirmation
  -f, --fill            Fill title/description from commit info
  -h, --help            Show this help
EOF
}

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1" >&2
        exit 1
    fi
}

target_branch=""
title=""
description=""
is_draft="false"
auto_yes="false"
use_fill="false"

while [[ $# -gt 0 ]]; do
    case "$1" in
        -b|--target-branch)
            target_branch="${2:-}"
            shift 2
            ;;
        -t|--title)
            title="${2:-}"
            shift 2
            ;;
        -d|--description)
            description="${2:-}"
            shift 2
            ;;
        --draft)
            is_draft="true"
            shift
            ;;
        -y|--yes)
            auto_yes="true"
            shift
            ;;
        -f|--fill)
            use_fill="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown argument: $1" >&2
            usage
            exit 1
            ;;
    esac
done

require_cmd git
require_cmd glab

current_branch="$(git branch --show-current)"
if [[ -z "${current_branch}" ]]; then
    echo "Cannot detect current branch." >&2
    exit 1
fi

if [[ "${current_branch}" == "main" || "${current_branch}" == "master" ]]; then
    echo "Refuse to create MR from ${current_branch}. Switch to a feature/fix branch first." >&2
    exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
    echo "Missing git remote 'origin'." >&2
    exit 1
fi

if [[ -z "${target_branch}" ]]; then
    origin_head_ref="$(git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null || true)"
    if [[ -n "${origin_head_ref}" ]]; then
        target_branch="${origin_head_ref##*/}"
    else
        target_branch="$(git remote show origin 2>/dev/null | sed -n 's/.*HEAD branch: //p' | head -n 1)"
    fi
fi

if [[ -z "${target_branch}" ]]; then
    target_branch="master"
fi

cmd=(
    glab mr create
    --source-branch "${current_branch}"
    --target-branch "${target_branch}"
)

if [[ "${is_draft}" == "true" ]]; then
    cmd+=(--draft)
fi

if [[ "${auto_yes}" == "true" ]]; then
    cmd+=(--yes)
fi

if [[ -n "${title}" ]]; then
    cmd+=(--title "${title}")
fi

if [[ -n "${description}" ]]; then
    cmd+=(--description "${description}")
fi

if [[ "${use_fill}" == "true" ]]; then
    cmd+=(--fill)
fi

echo "Running: ${cmd[*]}"
"${cmd[@]}"
