# 17671. BiDi events are awaited with `expect_*` context managers

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17671

## Context

WebDriver BiDi is event-driven: navigation, network traffic, console output, user
prompts, and downloads all surface as asynchronous events. Today the only way a binding
exposes them is a fire-and-forget callback registration — e.g. Python's
`add_event_handler(event, callback)`, Java's `addListener`, JavaScript's `.on(...)`.

To *wait for* an event that a user action triggers (click a button, wait for the matching
network response), users must register a callback, stash the event into a shared variable
or queue, perform the action, then poll/wait. This has two problems:

1. **A time-of-check/time-of-use race.** If the event fires between "perform the action"
   and "start waiting", it is lost. Correctly ordered code must subscribe *before* the
   action — which the callback pattern does not make natural or obvious.
2. **No predicate.** Users hand-write loops that inspect each event to find the one they
   care about (a specific URL, a console error), reinventing the same filter every time.

Playwright solved this with `with page.expect_event(...) as info: action()`, where the
listener is armed on `__enter__` (before the action) and `info.value` blocks on
`__exit__` until a matching event arrives or the timeout elapses. This is the single most
common asynchronous pattern in browser automation, and Selenium has no equivalent.

The forces: the BiDi event surface already exists in every binding; the wire protocol
needs nothing new; the only question is the *shape* of the waiting API and whether it is
consistent across bindings.

## Decision

Every binding exposes an **`expect_*` family of context-manager (or block) helpers** that
arm a one-shot, predicate-filtered subscription before the user action and resolve to the
captured event after it.

Normative requirements for all bindings:

- The subscription is registered when the scope is entered, **before** the user action
  runs, eliminating the race.
- The helper accepts an optional **predicate/matcher** and an optional **timeout**
  (defaulting to the binding's standard wait timeout). For URL-shaped events a string
  **glob** is also accepted.
- On scope exit the captured event is retrieved synchronously; a timeout raises the
  binding's standard timeout error.
- A reusable **`Subscription`** primitive underlies the helpers: register/unregister are
  decoupled, detach is idempotent and lock-guarded, and a captured-event queue backs the
  wait. Bindings MAY expose this primitive directly.
- Existing callback registration (`add_event_handler`/`addListener`/`.on`) stays; this is
  additive.

Concrete shorthands each binding SHOULD provide (built on the generic primitive):
`expect_request`, `expect_response`, `expect_console_message`, `expect_navigation`
(see [17676](17676-navigation-awaited-with-expect-helpers.md)), `expect_user_prompt`
(see [17672](17672-user-prompts-handled-through-typed-handler-api.md)), `expect_download`,
and — for tabs/windows the page opens itself — `expect_page` / `expect_popup` over
`browsingContext.contextCreated`, returning the new context as a handle object
(see [17681](17681-browsing-contexts-exposed-as-handle-objects.md)).

Code sketch — Python (reference implementation):

```python
# Generic primitive
with driver.script.expect_event("log.entryAdded") as info:
    button.click()
entry = info.value

# Typed shorthands with predicate or glob
with driver.network.expect_response("**/api/search**") as info:
    search_button.click()
assert info.value.status == 200

with driver.network.expect_request(lambda r: r.method == "POST") as info:
    submit.click()

with driver.script.expect_console_message(lambda m: m.type == "error") as info:
    driver.execute_script("console.error('boom')")
print(info.value.text)
```

Code sketch — other bindings (idiomatic shape, same semantics):

```java
// Java — try-with-resources arms before the action
try (var expectation = driver.network().expectResponse(url -> url.contains("/api/"))) {
    button.click();
    Response response = expectation.value();
}
```

```javascript
// JavaScript — async block form
const response = await driver.network().expectResponse('**/api/**', async () => {
  await button.click();
});
```

## Considered options

- **`expect_*` context managers (chosen)** — arms before the action by construction;
  matches the dominant Playwright idiom users already know; predicate + timeout built in.
- **Document "subscribe first, then act" with the existing callbacks** — no new API, but
  leaves the race as a footgun, provides no predicate or timeout, and every user
  re-implements the capture-and-wait boilerplate. Rejected: solves nothing structurally.
- **A future/promise returned from a `waitForEvent(...)` call** — viable in async
  bindings, but in synchronous bindings it reintroduces the race (the call to start
  waiting happens after the action) unless wrapped in a block anyway. Rejected as the
  primary shape; bindings MAY offer it as a secondary convenience where idiomatic.

## Consequences

- Users get race-free, predicate-filtered event waiting with no boilerplate; the most
  common async pattern becomes a one-liner.
- Each binding gains a small reusable `Subscription` primitive; implementing it surfaces
  and forces fixes to event-dispatch thread-safety (callback maps must be lock-guarded,
  subscribe/unsubscribe I/O must not be held under a dispatch lock).
- The other `expect_*`-based decisions (navigation, downloads, user prompts, and the
  `expect_page`/`expect_popup` handles in
  [17681](17681-browsing-contexts-exposed-as-handle-objects.md)) build on this primitive, so
  this record should land first.
- The thread-safety fixes this surfaces (lock-guarded callback maps, non-busy-wait command
  completion, bounded event dispatch) are also the prerequisite for the multi-thread
  concurrency contract in [17681](17681-browsing-contexts-exposed-as-handle-objects.md).
- No deprecations. Existing callback APIs are unaffected.

## Binding status

| Binding    | Status      | Notes / tracking link                                           |
|------------|-------------|-----------------------------------------------------------------|
| Java       | pending     |                                                                 |
| Python     | in progress | `expect_*` + `Subscription` implemented; PR pending             |
| Ruby       | pending     |                                                                 |
| .NET       | pending     |                                                                 |
| JavaScript | pending     |                                                                 |

## Appendix

The BiDi events backing the shorthands already exist in the spec and are emitted by
current browsers: `network.beforeRequestSent`, `network.responseStarted`,
`network.responseCompleted`, `log.entryAdded`, `browsingContext.userPromptOpened`,
`browsingContext.downloadWillBegin`/`downloadEnd`, and the navigation events. No new wire
protocol is required — this decision is purely about the binding-side waiting API.
