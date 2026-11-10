# PR review guidance

Guidance for agentic review of Selenium pull requests.
Review the changed behavior, not just the changed lines, and use surrounding context.

## Prioritize (potentially blocking)
- Correctness of WebDriver/BiDi wire behavior and capability/JSON parsing, including edge cases.
- Backward compatibility: users upgrade by changing only the version number — flag any public API or behavior break.
- Public functionality removed or changed without a deprecation and a pointer to the replacement.
- Test coverage — see Tests section below.
- Security: no committed secrets; untrusted input and capability/JSON parsing; Grid auth/authorization and routing. If a concern is speculative, state the assumption that makes it exploitable.
- Cross-binding parity: if user-visible behavior changes in one binding, confirm the others are updated or a follow-up is noted.

## Extra scrutiny
Give these high-risk areas extra attention even when the diff looks small:
WebDriver/BiDi semantics, capability parsing, wire-level behavior, Grid routing/distributor/queue,
dependency updates / `MODULE.bazel` / repin flows, and `javascript/atoms` (high blast radius).

## Do not comment on (reduce noise)
- Formatting and style — evaluated separately.
- Test results and CI status — evaluated separately.
- `third_party/` (read-only) — unless the change is unexpected.
- Documentation updates — Selenium's end-user docs live elsewhere.

## Tests
- Bug fixes should add a regression test if they would provide a meaningful signal of the correctness of future code changes.
- When suggesting a test, name the specific scenario and the failure it would catch, not "more tests" generically.

## Review comments
- Flag significant unrelated changes as out of scope if they confuse the intention of the PR.
- Make each comment actionable: the concrete risk, why it matters, and the smallest fix. Label severity, be concise, and don't leave duplicate comments for one root cause.
- If nothing meaningful is found, leave no findings — do not invent comments.
