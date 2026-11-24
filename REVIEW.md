# PR review guidance

Guidance for agentic review of Selenium pull requests.
The project rules live in `AGENTS.md` and the per-binding `*/AGENTS.md` files; this file says how to apply them in review.
Review the changed behavior, not just the changed lines, and use surrounding context.

## Prioritize (potentially blocking)
- Correctness of WebDriver/BiDi wire behavior and capability/JSON parsing, including edge cases.
- Breaking changes to public API (defined below) without a deprecation and a pointer to the replacement.
- Test coverage: see Tests below.
- Security: no committed secrets; untrusted input and capability/JSON parsing; Grid auth/authorization and routing. If a concern is speculative, state the assumption that makes it exploitable.

## Public API
The compatibility and deprecation rules in `AGENTS.md` protect what users of released artifacts call or configure:
- the published Java (including Grid), Python, Ruby, JavaScript, and .NET packages, except code a binding marks internal (such as Ruby `@api private`)
- Grid's command-line flags, configuration, and HTTP endpoints
- Selenium Manager's command-line arguments and JSON output; its Rust crate is not published, so `pub` items are internal

They do not cover test code and test helpers, Bazel rules, rake tasks, or CI workflows and scripts.
Replacing the oldest CDP version when adding a new one is routine, not a removal.

## Cross-binding parity
- When bindings behave differently, the W3C spec (for BiDi, `common/bidi/schema.json`) decides which one is right, not another binding.
- If user-visible behavior changes in one binding and the others are not updated, ask for a follow-up to be noted. This does not block the PR.

## Extra scrutiny
Give these high-risk areas extra attention even when the diff looks small:
WebDriver/BiDi semantics, capability parsing, wire-level behavior, Grid routing/distributor/queue,
dependency updates / `MODULE.bazel` / repin flows, `javascript/atoms` (shipped inside every binding),
and `common/bidi/schema.json` and the BiDi generators (they change the generated API of several bindings at once).

## Do not comment on (reduce noise)
- Formatting, line length, and whitespace: `./go format` runs in CI.
- Test results and CI status: evaluated separately.
- The contents of vendored code under `third_party/`, but do flag an edit to it that the PR does not explain. `third_party/bazel/*.patch` (applied through `MODULE.bazel`) and `third_party/dotnet/devtools/` are maintained in this repo and get normal review.
- Missing end-user documentation: it lives in the SeleniumHQ/seleniumhq.github.io repository.

## Tests
- Bug fixes should add a regression test if they would provide a meaningful signal of the correctness of future code changes.
- New public API or protocol surface should come with a test that exercises it. The Java, Python, and JavaScript BiDi layers are generated at build time, so a change to `common/bidi/schema.json` or a generator adds API to them with no diff in those bindings; ask which tests cover the new commands, events, or fields.
- When suggesting a test, name the specific scenario and the failure it would catch, not "more tests" generically.
- Don't ask for tests of Bazel rules, rake tasks, CI workflows, or release scripts unless that code already has a test target.

## Review comments
- Flag significant unrelated changes as out of scope if they confuse the intention of the PR.
- Make each comment actionable: the concrete risk, why it matters, and the smallest fix. Label severity, be concise, and don't leave duplicate comments for one root cause.
- Style, naming, and comment findings are never High severity.
- If nothing meaningful is found, leave no findings; do not invent comments.
