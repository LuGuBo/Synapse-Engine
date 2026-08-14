# Workflow: Git & GitHub Operations via MCP

This workflow defines the operational steps for using the **GitHub MCP Server** tools instead of CLI git commands during the development lifecycle.

## Prerequisites
- A valid `GITHUB_TOKEN` or `GITHUB_PERSONAL_ACCESS_TOKEN` must be available in the OS environment.
- The repository must be configured on GitHub (e.g., `LuGuBo/Aevum-Oikos` or `LuGuBo/aevum-kyber`).

---

## 🚀 Phase 1: Task Initialization (Branching)
Instead of running `git checkout -b <branch-name>`:
1. Identify the base branch (usually `main` or `master`).
2. Call `github-mcp-server/create_branch` with the target branch name and base SHA/ref.
3. Locally, run `git checkout <branch-name>` or `git pull` if necessary to sync the local workspace environment.

---

## 🔍 Phase 2: Remote Code & Resource Ingestion
When requested to analyze or load context from a remote repository, or when reviewing existing PRs/Issues:
- **Search repositories**: Use `github-mcp-server/search_repositories` or `github-mcp-server/search_code`.
- **Read file content**: Use `github-mcp-server/get_file_contents` to read a file from a specific branch or commit without checking it out locally.
- **List PR details**: Use `github-mcp-server/get_pull_request_files` to inspect file diffs in a PR.

---

## 🛠️ Phase 3: Commits & Code Pushing
- For localized surgical file updates: Use `github-mcp-server/create_or_update_file` to write directly to the branch.
- For bulk changes: Git CLI may be used locally (`git commit -m "..."`), but pushing can be executed or verified via MCP or standard push hooks.
- **Attribute Commits**: Ensure all commits retain:
  ```
  Co-Authored-By: Antigravity AI Agent <noreply@google.com>
  ```

---

## 🏁 Phase 4: Integration & Pull Request Lifecycle
Instead of opening the browser to create PRs or checking status via git CLI:
1. **Create Pull Request**: Invoke `github-mcp-server/create_pull_request` with the title, body (in Portuguese if user-facing, or English for system rules), head branch, and base branch.
2. **Track PR Status**: Call `github-mcp-server/get_pull_request_status` to ensure checks are passing.
3. **Merge Pull Request**: When approved and TDD gates pass, call `github-mcp-server/merge_pull_request`.
