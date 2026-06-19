# 17681. Browsing contexts are exposed as handle objects

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17681

## Context

Working with more than one tab/window over BiDi is awkward today because there is no
object that represents a single browsing context. The binding exposes a flat module —
every operation is called on one shared instance and takes the context id explicitly:

```python
ctx = driver.browsing_context.create(type=WindowTypes.TAB)        # returns a bare string id
driver.browsing_context.navigate(context=ctx, url="https://...")
driver.browsing_context.capture_screenshot(context=ctx)
driver.browsing_context.close(ctx)
```

This has two costs that compound for parallel work:

1. **The user threads the context id through every call by hand.** There is no handle to
   curry, so multi-tab code is verbose and error-prone, and event handlers cannot naturally
   mean "this tab".
2. **There is no clean unit to hand to a worker.** Driving N tabs concurrently means N
   workers each repeating the `context=` bookkeeping against one shared module object — no
   per-tab identity, no encapsulation.

Parallelisation is the motivating question. Selenium's BiDi transport is synchronous (one
WebSocket per driver); concurrency, when wanted, comes from threads. But threads have
nothing tab-shaped to own. Making one context per worker safe and ergonomic requires (a) a
per-context object and (b) a transport that is correct under concurrent use — the latter is
a per-binding internal (see Consequences) and not decided here.

Playwright is the reference: it exposes Browser → BrowserContext → Page, and **every
operation lives on the object** (`page.goto()`, `page.screenshot()`), never
`goto(context_id, url)`. That object identity is exactly what makes
`asyncio.gather(page_a.goto(...), page_b.goto(...))` — or a thread per page — trivially
safe, because there is no shared mutable state to coordinate.

Isolation is the same question one level up. Playwright's `BrowserContext` is an isolated
partition (separate cookies/storage) that *owns* its pages; BiDi's equivalent is the **user
context** (`browser.createUserContext`), which the spec defines as a collection of top-level
contexts with its own storage/cookie/permission/proxy partition. Crucially, a browsing
context's user context is **fixed when it is created and cannot be reassigned** — the protocol
has no "move to another user context" command, and child contexts inherit their parent's. So
the isolation unit cannot be bolted on beside `create()` after the fact; it and the per-context
handle are one object-model question, and are decided here together. Most users, though, only
ever want "an isolated tab, or not" — they should not have to learn an isolation object to get
it.

## Decision

Bindings expose a **per-browsing-context handle object** bound to a single context id.
Operations that target a context are available as methods on the handle, in addition to the
existing flat module API.

Normative requirements:

- `create(...)`, the entries of `get_tree(...)`, and
  `expect_page()`/`expect_popup()` (see
  [0001](0001-bidi-events-awaited-with-expect-context-managers.md)) return handle objects,
  not bare id strings. A handle exposes the context id for protocol-level use.
- The handle carries the per-context operations: `navigate`, `reload`, `activate`, `close`,
  `capture_screenshot`, `print`, `set_viewport`, `traverse_history`, `locate_nodes`,
  `handle_user_prompt`, and per-context event registration / `expect_*` waiters scoped to
  **this** context.
- The existing flat module API
  (`driver.browsing_context.navigate(context=id, ...)`, etc.) **remains** and is the
  compatibility surface; the handle delegates to it. This is additive.
- **Concurrency contract** (enabled by, but separate from, this decision): a single driver
  may be driven from multiple threads, one context per thread. Bindings state this contract
  explicitly and ensure their transport upholds it (per-binding internal work — lock the
  message/callback state, signal command completion without busy-waiting, bound event
  dispatch).
- The cross-binding **name** of the handle is part of this decision (candidates: a
  `Page`-like object, `Tab`, `BrowsingContextHandle`). One name, adapted to each language's
  casing.

Code sketch — Python (reference target):

```python
tab = driver.browsing_context.create(type=WindowTypes.TAB)   # -> handle, not a bare id
tab.navigate("https://example.com")
tab.capture_screenshot()
tab.add_event_handler("load", on_load)        # scoped to THIS context
with tab.expect_navigation(url="**/dashboard"):
    tab.click_somehow()
tab.close()

# parallelism becomes clean — one object per worker, ids hidden:
from concurrent.futures import ThreadPoolExecutor
tabs = [driver.browsing_context.create(type=WindowTypes.TAB) for _ in range(4)]
with ThreadPoolExecutor() as ex:
    ex.map(lambda t: t.navigate(url), tabs)   # safe under the concurrency contract
```

Code sketch — other bindings (idiomatic shape, same semantics):

```javascript
const tab = await driver.browsingContext().create({ type: 'tab' });  // -> handle
await tab.navigate('https://example.com');
await Promise.all(tabs.map(t => t.navigate(url)));
```

### User contexts (the isolation unit)

Because a context's user context is fixed at creation (see Context), the isolation unit is the
**factory** for the contexts in it, not an attach-after API. Two entry points cover the two
real needs:

- **The common case is a boolean on creation.** `create(..., isolated=True)` returns an
  ordinary browsing-context handle whose context lives in a fresh user context. **Closing that
  handle also removes the user context it created** (which, per spec, closes any child contexts
  and discards that partition's storage — `removeUserContext` is irreversible). The user never
  touches an isolation object. This is the 80% path.
- **The explicit case is the factory.** `browser.create_user_context(...)` returns the user
  context, and browsing contexts are created *from* it
  (`user_context.create_browsing_context(...)`). Its lifetime is **caller-managed**
  (`remove()`), because one user context may own several tabs. Use this when tabs must share an
  isolated partition, or to set per-partition options.
- **A new user context inherits the session's options.** Whether created via `isolated=True` or
  `create_user_context()`, an unset `acceptInsecureCerts` / `proxy` / `unhandledPromptBehavior`
  **defaults to the value the session was started with** (from its `options`), not to the
  browser default; explicit arguments override. An isolated tab therefore behaves like the
  session the user configured.
- **The isolation types are binding-internal.** The user-context object and the handle types
  are private/implementation structures — returned and usable, but not a prominent public class
  to learn. Bindings keep the surface minimal (id access, `remove`, the factory method), since
  the overwhelming majority of use is `isolated=True`.
- **The default user context** is reachable through the same model, so ordinary (non-isolated)
  tabs are not a special case.

```python
# 80% — isolation on/off, zero config, returns a normal tab handle
tab = driver.browsing_context.create(type=WindowTypes.TAB, isolated=True)
tab.navigate("https://example.com")
tab.close()                       # also removes the user context it created (storage discarded)

# explicit — several tabs in one isolated partition, or per-partition options
uc = driver.browser.create_user_context(proxy=...)   # inherits session opts unless overridden
a  = uc.create_browsing_context()
b  = uc.create_browsing_context()                     # same isolated partition
uc.remove()
```

## Considered options

- **Per-context handle object, flat API retained (chosen)** — gives multi-tab code an
  object per context, hides ids, makes one-context-per-worker parallelism clean, and is
  purely additive. Matches the model users know from Playwright.
- **Keep only the flat `context=`-passing API** — no new surface, but leaves the
  id-threading verbosity and gives parallel workers no encapsulated unit. Rejected: it is
  the problem being solved.
- **Adopt a full async/`Page` object model (asyncio-native, like Playwright)** — the most
  capable model, but a major architectural change to a synchronous binding. Rejected
  here as out of scope; it deserves its own RFC. A synchronous handle plus the concurrency
  contract covers the bulk of real parallel use.
- **Introduce a universal GUID object registry (Playwright-style routing)** — unnecessary:
  BiDi already keys everything by `context`/`navigation`/`realm` ids. Rejected in favour of
  routing events by the existing context id into the relevant handle.
- **Isolation as a boolean on `create`, isolation object kept internal (chosen)** — the 80% who
  just want an isolated tab get `isolated=True` and never meet an isolation object; the few who
  need a shared partition or per-partition options use the explicit factory. Matches Playwright's
  split (`browser.new_page()` shortcut vs `new_context()`), but keeps boolean ergonomics.
- **Expose user context only as a first-class public object (Playwright `BrowserContext` style),
  no shortcut** — rejected: forces everyone who wants a single isolated tab to learn a two-step
  object model they otherwise never need.
- **Put the per-partition knobs (proxy/certs/prompt) on `create(...)` alongside `isolated`** —
  rejected: conflates per-partition options with per-tab creation. Those options belong on
  `create_user_context()`; `isolated=` stays zero-config and inherits the session's options.

## Consequences

- Multi-tab and parallel code becomes object-oriented and id-free; an instance per worker
  removes the shared-state coordination that the flat API forces.
- A new handle type per binding, and `create`/`get_tree`/`expect_page` return types change
  from bare ids to handles — bindings introduce this additively (the handle still surfaces
  the id; the flat API is unchanged) and document the new return shape. The same applies to
  `create_user_context`/`get_user_contexts`, which now return user-context handles. Making the
  handle a string-compatible id wrapper (equality/hash/serialization unchanged) keeps these
  return-type changes non-breaking.
- **Prerequisite, not part of this record:** the transport must be safe and efficient under
  concurrent use (no busy-wait, locked shared state, bounded event dispatch). That is a
  per-binding internal change with its own tests; this decision only states the contract it
  must satisfy.
- **User contexts are folded into this object model** (this decision absorbs what would have
  been a separate record): `isolated=True` for the common case, the `create_user_context()`
  factory for the explicit case, session-option inheritance, and internal/private isolation
  types. Specific follow-on effects:
  - **Behaviour change to flag:** a user context created with an unset option now inherits the
    *session's* option rather than the *browser* default — e.g. `create_user_context(proxy=None)`
    yields the session's proxy. Bindings document this.
  - **High-risk wire mapping (capability/wire-level — verify per binding):** translating the
    session's classic capabilities into BiDi user-context parameters. `acceptInsecureCerts` is a
    clean bool; `proxy` maps the W3C proxy capability to BiDi's proxy-configuration union;
    `unhandledPromptBehavior` maps the classic string to a `UserPromptHandler`, with the classic
    "… and notify" variants mapped to their base action (BiDi surfaces prompts via events
    regardless). Capture from the `options` object at construction (otherwise discarded), with
    the negotiated capabilities as the fallback for Remote attach.
  - **Lifecycle:** closing an `isolated=True` handle removes the user context it created
    (irreversible, discards storage); the explicit factory's lifetime is caller-managed because
    it can own several tabs.
- Per-context event handlers require the subscription layer to track scope per context
  (today some bindings key subscriptions by event name only, so context scoping is honoured
  only for the first subscriber) — bindings fix this as part of adopting handle-scoped
  events.

## Binding status

| Binding    | Status  | Notes / tracking link                                                |
|------------|---------|----------------------------------------------------------------------|
| Java       | pending |                                                                      |
| Python     | pending | flat module API only (`browsing_context.<op>(context=id)`); no handle object yet |
| Ruby       | pending |                                                                      |
| .NET       | pending |                                                                      |
| JavaScript | pending |                                                                      |

## Appendix

Relevant BiDi surface: `browsingContext.create` (`type: "tab" | "window"`, optional
`userContext`), `browsingContext.getTree`, and the per-context commands
(`navigate`, `reload`, `activate`, `close`, `captureScreenshot`, `print`, `setViewport`,
`traverseHistory`, `locateNodes`, `handleUserPrompt`). Every browsing-context event already
carries a `context` id, which is what lets events route to the right handle.

Isolation unit (verified against the spec): `browser.createUserContext`
(params `acceptInsecureCerts`, `proxy`, `unhandledPromptBehavior`), `browser.getUserContexts`,
and `browser.removeUserContext` (which closes all the user context's tabs and permanently
deletes its storage; the `"default"` user context always exists and cannot be removed).
`browsingContext.Info` carries a `userContext` field, so `getTree` reports each context's
partition. A user context is a collection of top-level contexts with its own
storage/cookie/permission/proxy partition, fixed at creation and inherited by child contexts;
there is **no** command to move a context to a different user context. This is the protocol
fact that makes the user context the *factory* for its browsing contexts.

No new wire protocol is required — this decision is about the binding-side object model
(handles, the `isolated=` shortcut, the user-context factory, session-option inheritance) and
the concurrency contract around it.
