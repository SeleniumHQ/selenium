<!--
Guidance for AI agents working in the Selenium monorepo.
Language-specific details live in respective subdirectories.
-->
See @.local/AGENTS.md for additional guidance

Selenium is a Bazel-built monorepo implementing the W3C WebDriver (and related) protocols,
shipping multiple language bindings plus Grid and Selenium Manager.
The repository README is aimed at contributors; end-user docs live elsewhere.

## Invariants (don't violate unless explicitly asked)
- Maintain API/ABI compatibility - users upgrade by changing only version number
- Avoid repo-wide refactors/formatting; prefer small, reversible diffs

## Toolchain
- The project uses Bazelisk with a hermetic Bazel toolset. Do not run tests or execute Selenium code assuming a language-specific local development environment is configured.
- Rakefile tasks are executed with a bundled jruby wrapped with `go`/`go.bat` and frequently used by CI jobs
- Prefer targeted Bazel commands; use `bazel query ...` to locate labels before build/test

## Execution model
- Use `bazel query` to explore build graph before reading files
- Attempt to execute Bazel commands directly. If prevented due to network/toolchain restrictions within the sandbox, fall back to suggesting copy/paste commands for the user on a separate line.
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

### Agent workspace
The `.local/` directory (gitignored) is available for generated artifacts or temporary files:
- Use `--output_base=.local/bazel-out` if bazel output directory restricted

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

## Formatting
After making code changes, always run (or instruct the user to run):
```
./go format
```
This invokes the Rake `:format` task, which:
- Runs `buildifier` on all Bazel (`BUILD`, `*.bzl`, `WORKSPACE`) files — always, for every change
- Runs `update_copyright` to add/refresh Apache license headers — always, for every change
- Runs formatters for all bindings by default (pass `-<lang>` flags to skip specific ones, e.g. `-java`)

`./go format` auto-fixes files in place. After running it, check `git diff` to see if any files were
modified — if so, those changes must be committed. CI runs `./go format` then fails if `git diff` is
non-empty, so un-formatted code will fail CI.
For stricter lint checks beyond formatting, use `./go lint`.

## General Guidelines
- Comments should explain *why*, not *what* - prefer well-named methods over comments
- PRs should focus on one thing; we squash PRs to default `trunk` branch
- Prefer copying files to deleting and recreating to maintain git history
- Avoid running `bazel clean --expunge`
- Run or suggest running `./go format` before pushing to prevent CI failures

## High risk changes (request verification before modifying unless explicitly instructed)
- Everything referenced above as high risk
- WebDriver/BiDi semantics, capability parsing, wire-level behavior
- Dependency updates / `MODULE.bazel` / repin flows
- Grid routing/distributor/queue logic

## After making code changes
- Call out any high risk areas touched
- Note cross-binding impact and any follow-up issues needed
