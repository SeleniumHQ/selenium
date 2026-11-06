# 17673. Storage exposes a typed cookie API and `storage_state` save/restore

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17673

## Context

BiDi exposes cookies through `storage.getCookies`, `storage.setCookie`, and
`storage.deleteCookies`. The wire shape is awkward for direct use: a cookie value is a
`network.BytesValue` (a `{type, value}` descriptor, not a plain string), and partitioning
is expressed through a `storage.PartitionDescriptor`. Bindings that surface the raw shape
(or raw dicts) push that ceremony onto users for the common case of "set a session
cookie".

Separately, the most common real-world need is **session reuse**: log in once, capture
the authenticated state, and restore it in later sessions so tests skip the login flow.
Playwright's `context.storage_state(path=...)` / `new_context(storage_state=...)` is its
single most-used auth pattern. Selenium has no equivalent — users hand-roll cookie dump
and replay, and cannot easily capture `localStorage`.

Two forces are in tension. Cookies are fully covered by the BiDi protocol. But
`localStorage`/`sessionStorage`/IndexedDB are **not** in the BiDi spec — capturing them
requires running script (`script.evaluate`) in each origin. A storage-state feature must
be honest about that split rather than implying protocol support it does not have.

Under [17670](17670-bidi-implementation-boundaries.md) this record specifies **supported,
protocol-neutral API**, not a BiDi-shaped module offered beside it: the surface named here
must not reference BiDi or hand the user a BiDi type, and the internal BiDi implementation
stays reachable only by composing it with the driver. It is additive to the Classic cookie
API (`driver.manage().addCookie()`, which is already conformant and may itself become
BiDi-backed) rather than a replacement, and earns first-class surface because it does things
the Classic API cannot express — `storage_state` save/restore and cookies scoped to a
specific user context.

## Decision

Bindings expose two cohesive storage conveniences:

1. A **typed `Cookie` value** for `set_cookie`/`get_cookies` that hides `BytesValue` and
   partition descriptors. It carries the familiar fields — `name`, `value`, `domain`,
   `path`, `secure`, `http_only`, `same_site`, and an expiry expressed in the binding's
   natural way (`expiry`/`max_age`). `get_cookies` returns these typed objects, not raw
   wire dicts. The type lives in a protocol-neutral namespace — never a BiDi-named one.
   Scoping a cookie to a user context is part of this surface (see
   [17681](17681-browsing-contexts-exposed-as-handle-objects.md)); cases it deliberately
   does not cover — arbitrary partition descriptors, raw byte values — are served by the
   internal implementation composed with the driver, not by extra parameters here.

2. A **`storage_state` save/restore** pair. `save_state` captures cookies **and** per-origin
   `localStorage` into a serializable document (JSON on disk or an in-memory object).
   `load_state` re-applies them into the current session. Documentation MUST state plainly
   what is and is not captured: IndexedDB is out of scope unless/until added, and because web
   storage is read from the page rather than from the protocol, only origins the session has
   actually loaded are captured. Which protocol services each part is an implementation
   detail users do not need to know ([17670](17670-bidi-implementation-boundaries.md)); the
   *limits it imposes on them* are not, and must be documented.

Code sketch — Python (reference implementation):

```python
# neutral namespace — the exact path is per binding, but never BiDi-named
from selenium.webdriver.common.storage import Cookie

# Typed cookie — no BytesValue / partition ceremony
driver.storage.set_cookie(Cookie(
    name="session", value="abc123", domain="example.com",
    path="/", secure=True, http_only=True, same_site="Lax", max_age=3600,
))
cookies = driver.storage.get_cookies(domain="example.com")  # -> list[Cookie]

# Auth reuse
driver.storage.save_state("auth.json")   # cookies + per-origin localStorage
# ... later, in a fresh session on the same origin ...
driver.storage.load_state("auth.json")
```

Code sketch — other bindings (idiomatic shape, same semantics):

```javascript
await driver.storage().setCookie({ name: 'session', value: 'abc123', domain: 'example.com', secure: true });
const state = await driver.storage().saveState();      // serializable object
await driver.storage().loadState(state);
```

## Considered options

- **Typed `Cookie` + `storage_state` capturing cookies and `localStorage` (chosen)** —
  removes the `BytesValue`/partition ceremony for the common case and delivers the
  high-value auth-reuse pattern, while being explicit about what it does and does not capture.
- **Cookie convenience only, no `storage_state`** — easy, but leaves the most-requested
  workflow (skip login by restoring state) unsolved. Rejected: misses the main prize.
- **`storage_state` over cookies only (no web storage)** — no dependency on executing
  script, but apps that keep auth tokens in `localStorage` would silently fail to
  restore, which is worse than not offering it. Rejected: correctness over convenience.
- **Plain dicts instead of a typed `Cookie`** — no new type to learn, but keeps users
  hand-assembling `BytesValue` and gives no discoverable field set or validation.
  Rejected: the ceremony is exactly what this record removes.

## Consequences

- The 90% cookie case becomes a one-liner; auth-heavy suites can skip repeated logins.
- A new `Cookie` value type per binding; `get_cookies` return type becomes typed objects
  (additive where today's API returned raw dicts — bindings already returning a cookie
  type are unaffected; document the shape).
- `storage_state` carries a **documented limitation**: web storage is captured from the page
  and IndexedDB is excluded. This is a deliberate, recorded scope boundary, not a bug.
- Because web storage is read by executing script, `save_state`/`load_state` touch each
  origin's document; behaviour across many origins should be specified per binding.
- A `Cookie` type in a neutral namespace is required by
  [17670](17670-bidi-implementation-boundaries.md); bindings that today return the BiDi
  cookie type from a supported surface bring it in line under the deprecation policy.

## Binding status

| Binding    | Status  | Notes / tracking link                                              |
|------------|---------|--------------------------------------------------------------------|
| Java       | pending |                                                                    |
| Python     | pending | `StorageCookie`/`CookieFilter`/`PartialCookie` dataclasses exist; typed `Cookie` + `storage_state` not yet built |
| Ruby       | pending |                                                                    |
| .NET       | pending |                                                                    |
| JavaScript | pending |                                                                    |

## Appendix

BiDi cookie surface: `storage.getCookies` (filterable), `storage.setCookie`
(`PartialCookie` with `value: network.BytesValue`, optional
`storage.PartitionDescriptor`), `storage.deleteCookies`. Web storage (`localStorage`,
`sessionStorage`) and IndexedDB have **no** BiDi commands; `storage_state` captures
`localStorage` by evaluating script per origin. This appendix describes the internal
implementation, which is why the decision documents the resulting *user-visible* limits
rather than the mechanism.
