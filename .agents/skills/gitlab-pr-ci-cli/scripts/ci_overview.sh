#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  ci_overview.sh [--branch BRANCH] [--repo REPO] [--per-page N] [--status STATUS]

Options:
  -b, --branch      Branch name (default: current git branch)
  -R, --repo        Optional repo override for glab (e.g. group/project)
  -p, --per-page    Number of pipelines to list (default: 5)
  -s, --status      Optional status filter (failed, success, running, ...)
  -h, --help        Show this help
EOF
}

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1" >&2
        exit 1
    fi
}

branch=""
repo=""
per_page="5"
status=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -b|--branch)
            branch="${2:-}"
            shift 2
            ;;
        -R|--repo)
            repo="${2:-}"
            shift 2
            ;;
        -p|--per-page)
            per_page="${2:-}"
            shift 2
            ;;
        -s|--status)
            status="${2:-}"
            shift 2
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

if [[ -z "${branch}" ]]; then
    branch="$(git branch --show-current)"
fi

if [[ -z "${branch}" ]]; then
    echo "Cannot detect branch. Use --branch explicitly." >&2
    exit 1
fi

extra_repo_args=()
if [[ -n "${repo}" ]]; then
    extra_repo_args=(-R "${repo}")
fi

echo "== CI status (${branch}) =="
glab ci status --branch "${branch}" --compact "${extra_repo_args[@]}"

echo
echo "== Recent pipelines (${branch}, limit ${per_page}) =="
list_cmd=(
    glab ci list
    --ref "${branch}"
    --per-page "${per_page}"
    "${extra_repo_args[@]}"
)

if [[ -n "${status}" ]]; then
    list_cmd+=(--status "${status}")
fi

"${list_cmd[@]}"
