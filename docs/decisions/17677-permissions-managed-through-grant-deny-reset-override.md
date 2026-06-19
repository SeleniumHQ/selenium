# 17677. Browser permissions are managed through grant / deny / reset / override helpers

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17677

## Context

BiDi exposes a single permissions primitive: `permissions.setPermission`, which sets one
permission descriptor to a state (`granted` | `denied` | `prompt`) for an `origin`, with
optional `embeddedOrigin` and `userContext`. The generated bindings already surface this
as a raw `set_permission` command — but using it for the everyday cases (grant a
permission, deny it, reset to default, grant just for the duration of a block) means
remembering the state strings, repeating the descriptor/origin every call, and tracking
what was changed so it can be undone.

This pattern need not differ per binding, and there is a reference implementation to
anchor it: **PR [#17631](https://github.com/SeleniumHQ/selenium/pull/17631)** adds the
high-level Python permissions API described here — reviewers can see the exact shape "in
action" there. This record exists to make that a recorded *cross-binding* decision rather
than a Python-only choice, so Java, Ruby, .NET, and JavaScript converge on the same names
and semantics.

For comparison, Playwright offers `grant_permissions([...], origin=...)` and a bulk
`clear_permissions()` — no `deny` (denied is the browser default), no per-permission
reset, and no scoped temporary override. The proposal below is intentionally a superset.

## Decision

Bindings expose, on the permissions module, convenience methods over
`permissions.setPermission`:

- **`grant(descriptor, *, origin, user_context=None)`** — set to `granted`. Accepts a
  single permission name/descriptor **or a list** (grant several at once).
- **`deny(descriptor, *, origin, user_context=None)`** — set to `denied`.
- **`reset(descriptor=None, *, origin, user_context=None)`** — set to `prompt` (the
  browser default). With no descriptor, reset **every override applied through these
  helpers** (the binding tracks them client-side); with a descriptor or list, reset only
  those.
- **`override(descriptor, state, *, origin, user_context=None)`** — a context manager (or
  block) that applies `state` on enter and resets to `prompt` on exit, even if the body
  raises.
- The low-level **`set_permission(descriptor, state, origin, user_context=None,
  embedded_origin=None)`** remains the full-fidelity escape hatch (the only path to
  `embeddedOrigin`).

The `user_context` argument scopes the override to one isolation unit; it accepts a
user-context handle from `create_user_context()` or a context made with `isolated=True` (see
[17681](17681-browsing-contexts-exposed-as-handle-objects.md)). When omitted, the override
applies to the default user context.

Normative requirements:

- `reset()` with no argument cleans up only overrides applied via grant/deny/override —
  not overrides applied directly through `set_permission`. This is documented behaviour.
- **`origin` handling must be resolved consistently across bindings** (see Consequences):
  the spec marks `origin` as required, so the binding must either require it on the
  convenience methods or define a single, documented default — silently omitting it is not
  acceptable.
- State values are validated against `granted` | `denied` | `prompt`.

Code sketch — Python (reference implementation, PR #17631):

```python
driver.permissions.grant("geolocation", origin=origin)
driver.permissions.grant(["geolocation", "camera"], origin=origin)
driver.permissions.deny("geolocation", origin=origin)
driver.permissions.reset("geolocation", origin=origin)   # one
driver.permissions.reset()                               # all tracked overrides

with driver.permissions.override("geolocation", "granted", origin=origin):
    ...                                                  # reset to prompt on exit

# full-fidelity escape hatch (only path to embedded_origin):
driver.permissions.set_permission("geolocation", "granted", origin)
```

Code sketch — other bindings (idiomatic shape, same semantics):

```java
driver.permissions().grant("geolocation", origin);
try (var o = driver.permissions().override("geolocation", PermissionState.GRANTED, origin)) {
    ...   // reset to prompt on close
}
```

## Considered options

- **grant / deny / reset / override + low-level `set_permission` (chosen)** — covers the
  everyday cases with discoverable verbs, adds value over Playwright (deny, per-permission
  reset, scoped temporary override), and tracks overrides so cleanup is one call. Anchored
  by the working Python implementation in #17631.
- **Expose only the raw `set_permission`** — already generated, zero new surface, but
  pushes state-string memorization and manual undo-tracking onto every user. Rejected as
  the user-facing API; retained as the escape hatch.
- **Mirror Playwright exactly (`grant` + bulk `clear` only)** — familiar to Playwright
  users, but drops genuinely useful capability (deny, targeted reset, `override` block,
  `user_context` scoping) that the BiDi primitive supports for free. Rejected: needless
  downgrade.

## Consequences

- Permission management becomes a set of discoverable verbs consistent across bindings;
  temporary, exception-safe overrides are a first-class block.
- **Open cross-binding question to settle in review:** the CDDL marks `origin` as
  **required**, but the Python reference (#17631) currently defaults `origin=None` on the
  convenience methods and omits the field when absent — which emits a spec-non-conformant
  command whose behaviour is browser-dependent. This record's normative rule is that every
  binding must either require `origin` or adopt one documented default; the chosen
  resolution should be reflected back into #17631.
- `embeddedOrigin` is reachable only via `set_permission`; the convenience methods do not
  forward it (acceptable — it is a rare cross-origin-iframe case). Bindings MAY add it
  later if demand appears.
- No deprecations; the raw command is unchanged. Purely additive.

## Binding status

| Binding    | Status      | Notes / tracking link                                                        |
|------------|-------------|------------------------------------------------------------------------------|
| Java       | pending     |                                                                              |
| Python     | in progress | [#17631](https://github.com/SeleniumHQ/selenium/pull/17631) — high-level permissions API (grant/deny/reset/override) |
| Ruby       | pending     |                                                                              |
| .NET       | pending     |                                                                              |
| JavaScript | pending     |                                                                              |

## Appendix

Spec surface: `permissions.setPermission` with parameters
`{descriptor: {name}, state: "granted" | "denied" | "prompt", origin: text,
?embeddedOrigin: text, ?userContext: text}` (from the W3C Permissions BiDi extension).
`origin` is a required field in the CDDL — the basis for the origin-handling rule in the
Decision and the open question in Consequences. This decision concerns the binding-side
convenience layer, not protocol support.
