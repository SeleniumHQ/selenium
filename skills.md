# Selenium Repository Skills Guide

This document captures best practices for contributors and coding agents working in the Selenium monorepo.

## Purpose

Use this guide to make safe, focused changes across Selenium's multi-language bindings while staying aligned with Bazel-based workflows and project invariants.

## Core Principles

- Preserve API and ABI compatibility unless explicitly asked to break it.
- Prefer small, reversible diffs over broad refactors.
- Avoid repo-wide formatting changes.
- Treat `third_party/` as read-only and `bazel-*/` as generated output.
- Prefer targeted Bazel commands and discover labels with `bazel query` before build and test.
- For user-visible behavior changes, compare with at least one other binding (Java, Python, Ruby, .NET, JavaScript).
- If behavior is shared (protocol, remote transport, serialization), call out parity follow-up work.

## High-Risk Areas

Request explicit verification before making substantial changes in:

- `common/` and `common/src/`
- `javascript/atoms/`
- `rust/` (Selenium Manager)
- `scripts/`, `rake_tasks/`, `.github/`, and `Rakefile`
- WebDriver and BiDi wire semantics, capability parsing, or Grid routing/distributor logic
- Build dependency wiring (`MODULE.bazel`, repin flows)

## Universal Bazel Workflow

1. Find likely targets with query:

```bash
bazel query 'kind(".* rule", //path/to/area/...)'
```

2. Build only affected targets:

```bash
bazel build //path/to/area:target
```

3. Run the smallest meaningful tests first:

```bash
bazel test //path/to/area:target --test_output=all --cache_test_results=no
```

4. Expand test scope only when the focused tests pass.

### Useful Test Flags

- `--test_size_filters=small` for fast unit-style tests
- `--test_output=all` to show test output
- `--cache_test_results=no` to force a rerun during debugging

### Sandbox Notes

If output directory permissions are restricted, use:

```bash
bazel --output_base=.local/bazel-out <command>
```

## Skill Matrix By Language

Use each language section as a practical checklist before opening a PR.

### Python Skill

- Code location: `py/selenium/`
- Build:

```bash
bazel build //py/...
```

- Tests:

```bash
bazel test //py/...
```

- Browser-focused patterns:

```bash
bazel test //py:test-chrome
bazel test //py:test-firefox-bidi
```

- Type hints: prefer union syntax (`str | None`) over `Optional[str]`.
- Runtime baseline: Python 3.10+.
- Logging: use `logging.getLogger(__name__)` and leveled messages.
- Deprecation: use `warnings.warn(..., DeprecationWarning, stacklevel=2)`.
- Public docs: use Google-style docstrings.

### Ruby Skill

- Code location: `rb/lib/selenium/webdriver`
- Tests: `rb/spec/unit/`, `rb/spec/integration/`
- Type signatures: `rb/sig/`
- Build:

```bash
bazel build //rb/...
```

- Test discovery:

```bash
bazel query 'kind(".*(test|suite) rule", //rb/...)'
```

- Logging: use `WebDriver.logger` with warning/info/debug levels.
- Deprecation: use `WebDriver.logger.deprecate(...)` with an explicit replacement.
- Internal APIs: mark with `@api private` in YARD comments.
- Public API changes: update corresponding `.rbs` files.
- Public docs: use YARD annotations.

### .NET (C#) Skill

- Core code: `dotnet/src/webdriver/`
- Support code: `dotnet/src/support/`
- Tests: `dotnet/test/common/`
- Build:

```bash
bazel build //dotnet/...
```

- Test discovery:

```bash
bazel query 'kind(".*(test|suite) rule", //dotnet/...)'
```

- Logging: use `OpenQA.Selenium.Internal.Logging` and `Log.GetLogger<T>()`.
- Deprecation: use `[Obsolete("Use NewMethod instead")]`.
- Async direction: prefer async-compatible changes when adding new APIs.
- Public docs: use XML documentation comments.

### Java Skill

- Java bindings: `java/src/`, `java/test/`
- Grid code: `java/src/org/openqa/selenium/grid/`
- Build:

```bash
bazel build //java/...
bazel build grid
```

- Test discovery:

```bash
bazel query 'kind(".*(test|suite) rule", //java/...)'
```

- Logging: use `java.util.logging.Logger` with warning/info/fine.
- Deprecation: use `@Deprecated(forRemoval = true)` with migration path.
- Public docs: use Javadoc for public APIs.

### JavaScript Skill

- Library: `javascript/selenium-webdriver/lib/`
- Tests: `javascript/selenium-webdriver/test/`
- Build:

```bash
bazel build //javascript/selenium-webdriver/...
```

- Test discovery:

```bash
bazel query 'kind(".*(test|suite) rule", //javascript/selenium-webdriver/...)'
```

- Logging: use module logger via `logging.getLogger(...)`.
- Deprecation: emit warning with clear replacement path.
- Public docs: use JSDoc.

## Cross-Binding Consistency Checklist

Before merging user-visible behavior changes:

1. Search comparable behavior in at least one other binding.

```bash
rg '<feature_or_api_name>' java/ py/ rb/ dotnet/ javascript/selenium-webdriver/
```

2. Record whether behavior is intentionally aligned or intentionally divergent.
3. If divergent, include a follow-up issue or rationale in the PR description.

## Pre-PR Checklist

- Target labels discovered with `bazel query`.
- Changed targets build successfully.
- Focused tests pass with `--test_output=all` where useful.
- Cross-binding review completed for user-visible behavior.
- High-risk changes called out clearly.
- Formatting and linting run via repo tooling when applicable (`./scripts/format.sh` or `./go all:lint`).

## Ownership And Maintenance

Update this guide when any of the following changes:

- Language layout paths
- Bazel target conventions
- Logging, deprecation, or public documentation conventions
- High-risk area definitions

Treat the language-specific AGENTS files as source of truth and keep this file synchronized with them.
