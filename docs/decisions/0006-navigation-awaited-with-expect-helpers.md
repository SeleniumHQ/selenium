# 0006. Navigation is awaited with `expect_navigation` / `wait_for_url` / `wait_for_load_state`

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17676

## Context

A click that triggers navigation is one of the most common sources of flaky tests. The
classic pattern — perform the action, then wait for a condition (URL, element, readyState)
— races: the navigation can begin and even complete between the action and the wait, so
the wait either observes the wrong page or times out. Selenium users work around this with
ad-hoc `WebDriverWait` conditions and staleness checks.

BiDi emits the full navigation lifecycle as events: `browsingContext.navigationStarted`,
`navigationCommitted`, `domContentLoaded`, `load`, `fragmentNavigated`,
`navigationFailed`, `navigationAborted`, and `historyUpdated`. With the `expect_*`
primitive from [0001](0001-bidi-events-awaited-with-expect-context-managers.md) these can
be turned into the race-free navigation waits users expect.

Playwright provides exactly this: `page.expect_navigation()` (arm-before-action context
manager), `page.wait_for_url(url)`, and `page.wait_for_load_state(state)` with
`"commit" | "domcontentloaded" | "load"` levels. The shape is well established.

## Decision

Bindings expose three navigation-waiting helpers on the browsing-context API:

- **`expect_navigation(url=None, wait_until="load", timeout=...)`** — a context manager
  (or block, per binding idiom) that arms before the user action and resolves once a
  matching navigation reaches the requested lifecycle level. `url` accepts a glob or
  predicate; omitting it matches the next navigation.
- **`wait_for_url(url, wait_until="load", timeout=...)`** — waits until the context's URL
  matches (glob or predicate). If already matching, returns immediately.
- **`wait_for_load_state(state="load", timeout=...)`** — waits until the current
  navigation reaches `state`; returns immediately if already reached.

Normative requirements:

- `wait_until` / `state` accept a common, ordered set: **`commit`** (response committed,
  earliest), **`domcontentloaded`**, **`load`** (default). Bindings MAY add
  `networkidle`-style levels but it is not required and not the default.
- `expect_navigation` arms the subscription before the action (no race), per
  [0001](0001-bidi-events-awaited-with-expect-context-managers.md).
- Failed/aborted navigations (`navigationFailed`/`navigationAborted`) surface as the
  binding's error within the wait, not as a silent timeout.
- These complement, and do not replace, existing `WebDriverWait`/expected-conditions.

Code sketch — Python (reference implementation):

```python
# Race-free: arm before the click that navigates
with driver.browsing_context.expect_navigation(url="**/dashboard", wait_until="load"):
    driver.find_element(By.ID, "login").click()
# now reliably on /dashboard

driver.browsing_context.wait_for_url("**/checkout/**", timeout=10)
driver.browsing_context.wait_for_load_state("domcontentloaded")
```

Code sketch — other bindings (idiomatic shape, same semantics):

```java
try (var nav = driver.browsingContext().expectNavigation(url -> url.endsWith("/dashboard"))) {
    loginButton.click();
    nav.value();   // resolves at "load"
}
driver.browsingContext().waitForUrl("**/checkout/**");
```

## Considered options

- **`expect_navigation` + `wait_for_url` + `wait_for_load_state` (chosen)** — covers both
  the arm-before-action case (`expect_navigation`) and the "I'm already navigating, wait
  for it" case (`wait_for_*`); mirrors the established Playwright shape; built on the
  existing `expect_*` primitive and navigation events.
- **Only document `WebDriverWait` recipes** — no new API, but leaves the navigation race
  unsolved and every user re-deriving the same fragile conditions. Rejected.
- **A single `navigate(..., wait_until=...)` parameter only** — fine when the binding
  *initiates* the navigation, but does nothing for navigations triggered by a user action
  (a click), which is the common, racy case. Rejected as sufficient on its own; the
  parameter can still exist for binding-initiated navigation.

## Consequences

- The most common flaky-test pattern (click-then-navigate) gets a race-free, consistent
  solution across bindings.
- Requires [0001](0001-bidi-events-awaited-with-expect-context-managers.md) to land first
  (shared `expect_*`/subscription primitive).
- A shared `wait_until` vocabulary (`commit`/`domcontentloaded`/`load`) is fixed across
  bindings; this is a small cross-binding naming commitment tracked in the status table.
- No deprecations; existing waits are unaffected.

## Binding status

| Binding    | Status  | Notes / tracking link                                              |
|------------|---------|--------------------------------------------------------------------|
| Java       | pending |                                                                    |
| Python     | pending | navigation events available; `navigate(wait=...)` exists; `expect_navigation`/`wait_for_*` not yet built |
| Ruby       | pending |                                                                    |
| .NET       | pending |                                                                    |
| JavaScript | pending |                                                                    |

## Appendix

Navigation lifecycle events in the BiDi spec: `browsingContext.navigationStarted`,
`navigationCommitted`, `domContentLoaded`, `load`, `fragmentNavigated`,
`navigationFailed`, `navigationAborted`, `historyUpdated`. The `wait_until` levels map to
`navigationCommitted` (commit), `domContentLoaded`, and `load`. No new wire protocol is
required.
