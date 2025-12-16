<!--
Guidance for AI agents working in the Selenium monorepo.
Language-specific details live in respective subdirectories.
-->

Selenium is a Bazel-built monorepo implementing the W3C WebDriver (and related) protocols,
shipping multiple language bindings plus Grid and Selenium Manager.
This repo’s README is for contributors; usage docs live elsewhere.

If the user is asking a question (no code changes), answer directly—do not propose plans/checklists.
If the user requests a code change, follow the guidance below.

## Invariants (do not violate these unless explicitly asked)
- Treat `bazel-*` directories as generated build output.
- Treat `third_party/` as read-only.
- Preserve Apache 2.0 headers and NOTICE/LICENSE content.
- Avoid repo-wide refactors/formatting. Prefer small, reversible diffs.

## Bindings
- Java code is in `java/`, see `java/AGENTS.md`
- Python code is in `py/`, see `py/AGENTS.md`
- Ruby code is in `rb/`, see `rb/AGENTS.md`
- JavaScript code is in `javascript/selenium-webdriver/`, see `javascript/selenium-webdriver/AGENTS.md`
- .NET code is in `dotnet/`, see `dotnet/AGENTS.md`

When changing behavior, compare to the equivalent areas in at least one other binding:
- `rg <term> java/ py/ rb/ dotnet/`

## Description of other directories
- `javascript/atoms/` Google closure code implemented in drivers (high risk)
- `rust/` — Selenium Manager + Rust components, see `rust/AGENTS.md`
- `common/` — shared code and build/test wiring
- `common/src/` — HTML code used by tests (high risk to break tests)
- `scripts/`, `rake_tasks/`, `.github/`, `Rakefile` — tooling and Bazel wrappers (high risk)

## Toolchain + entrypoints
- Expect Bazelisk + JDK 17+ (JAVA_HOME should point to a JDK)
- CI and testing executed via GitHub Actions (`.github/`)
- Use targeted bazel commands as necessary. not scripts or wrappers meant for CI tooling
- Use `bazel query ...` to locate exact labels before building/testing.

### Testing
- Use binding's documented testing guidance (see `<dir>/AGENTS.md`)
- Consider these flags when testing locally:
  - `--pin_browsers` (browsers and drivers managed by Bazel)
  - `--test_output all|streamed` (to debug output)
  - `--cache_test_results=no` (ignore cached tests)
  - `--test_env X=y` (if you need to pass in an environment variable for the test)

## Dependencies & lockfiles
- Don’t hand-edit lockfiles (`pnpm-lock.yaml`, `multitool.lock.json`, `Cargo.Bazel.lock`, etc).
- Use the binding’s documented update/repin flow (see `<dir>/AGENTS.md`).

## High risk changes
Unless specifically instructed, ask for verification before making changes to these things or anything referenced above as high risk
- WebDriver/BiDi semantics, capability parsing, wire-level behavior
- Dependency updates and `MODULE.bazel` changes
- Grid routing/distributor/queue logic

## Execution model (important)
In many AI-agent environments, Bazel cannot run (insufficient network/toolchain/browser access).
Agents MUST:
- Never claim commands/tests were executed unless the user provides output.
- Provide copy/paste-ready commands for the user to run in an admin terminal.
- Ask for the exact output needed (errors, failing targets, stack traces), then iterate.

### When proposing verification:
- Prefer the narrowest Bazel labels and smallest test set.
- Prefer `./go <task>` when it exists (it matches CI/release flows).
- Provide commands in the order they should be run, one block at a time.

### Terminal run requested
Use this format:
Goal: <specify the reason for executing the Bazel command>
Run:
bazel <command> '...'
Paste back:
the command output + any errors

## After making code changes
- Report any high risk changes made
- Report the exact Bazel commands run with results
- Report any expected cross-binding impact and follow-up issues needed
- Request to run linting command: `./scripts/format.sh` 
