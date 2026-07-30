<!--
Guidance for AI agents working in the Selenium monorepo.
Language-specific details live in respective subdirectories.
-->
## Overview

Selenium is a Bazel-built monorepo implementing the W3C WebDriver (and related) protocols,
shipping multiple language bindings plus Grid and Selenium Manager.
The repository README is aimed at contributors; end-user docs live elsewhere.

### Local contributor customization
- The `.local/` directory is available for customization, generated artifacts, scratch work, and temporary files. It is ignored by Git except for `.local/README.md`.
- A contributor may create `.local/AGENTS.md` for personal repo-specific instructions and preferences. Before beginning any task, check whether `.local/AGENTS.md` exists; if it exists, read it with your file-reading tool and apply it as the contributor's local instruction overlay.
- If `.local/agent/skills/` exists, inspect its `*/SKILL.md` files and treat them as additional user-defined skills.

## Invariants (don't violate unless explicitly asked)
- Maintain API/ABI compatibility by default (users upgrade by changing only the version number); public functionality may be removed only after it has gone through the [Deprecation policy](#deprecation-policy) below
- Avoid repo-wide refactors/formatting; prefer small, reversible diffs

## Toolchain
- The project uses Bazelisk with a hermetic Bazel toolset. Do not run tests or execute Selenium code assuming a language-specific local development environment is configured.
- Rakefile tasks are executed with a bundled jruby wrapped with `go`/`go.bat` and frequently used by CI jobs
- Prefer targeted Bazel commands; use `bazel query ...` to locate labels before build/test

## Execution model
- Use `bazel query` to explore build graph before reading files
- Attempt to execute Bazel commands directly. If prevented due to network/toolchain restrictions within the sandbox, fall back to suggesting copy/paste commands for the user on a separate line.
- When the default output directory is restricted or when working in a git worktree, isolate build output with `--output_base`. It is a startup flag, so it goes *before* the command, and anchor it to the worktree root so it resolves the same from any directory: `bazel --output_base="$(git rev-parse --show-toplevel)/.local/output-base" build //...` (not after `build`/`test`/`query`).

## Repo layout
Bindings (see `AGENTS.md` in each directory for language-specific details):
- Java: `java/`
- Python: `py/`
- Ruby: `rb/`
- JavaScript: `javascript/selenium-webdriver/`
- .NET: `dotnet/`

Shared/high-risk areas:
- `rust/` (Selenium Manager, see `rust/AGENTS.md`)
- `common/` (build/test wiring; affects multiple areas)
- `common/src/` (test HTML fixtures)
- `javascript/atoms/` (shared JS atoms; high blast radius)
- `scripts/`, `rake_tasks/`, `.github/`, `Rakefile` (tooling/build)
- `third_party/` treat as read-only
- `bazel-*/` treat as generated output

## Cross-binding consistency checks
When changing user-visible behavior, compare with at least one other binding:
- Example: `rg <term> java/ py/ rb/ dotnet/ javascript/selenium-webdriver/`

If behavior is shared/low-level (protocol, serialization, "remote"/transport), suggest follow-up parity work or to file an issue

## Testing
When implementing solutions prefer writing a test for it first 
Prefer small (unit) tests over browser tests for speed/reliability
Avoid mocks—they can misrepresent API contracts

Useful flags:
- `--test_size_filters=small` (unit tests only)
- `--test_output=all` (display console output)
- `--cache_test_results=no` (force re-run)
See language-specific AGENTS.md for applicable testing usage

## Logging
Add logging where users may need insight into what's happening
See language-specific AGENTS.md for applicable logging usage

## Deprecation policy
This project does not follow semantic versioning (semver); before removing public functionality, mark it as deprecated with a message pointing to the alternative.
See language-specific AGENTS.md for applicable deprecation usage

## General Guidelines
- Comments should explain *why*, not *what* - prefer well-named methods over comments
- PRs should focus on one thing; we squash PRs to default `trunk` branch
- Prefer copying files to deleting and recreating to maintain git history
- Avoid running `bazel clean --expunge`
- Formatting: 
  - `./scripts/format.sh` without arguments will run everything similar to running `./go format` but with failure information; With `--pre-commit` flag it only checks staged changes; With `--pre-push` flag it only checks committed changes with trunk.
  - If `./scripts/format.sh` is already referenced in a pre-commit or pre-push hook, let the hooks handle formatting 
  - If not, run or suggest `./scripts/format.sh --pre-push` before pushing to avoid CI formatter failures

## High risk changes (request verification before modifying unless explicitly instructed)
- Everything referenced above as high risk
- WebDriver/BiDi semantics, capability parsing, wire-level behavior
- Dependency updates / `MODULE.bazel` / repin flows
- Grid routing/distributor/queue logic

## After making code changes
- Call out any high risk areas touched
- Note cross-binding impact and any follow-up issues needed

## Reviewing pull requests
See `.github/pr_review.md` for agentic review priorities and scope.
