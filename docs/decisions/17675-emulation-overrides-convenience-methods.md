# 17675. Emulation overrides are exposed through named convenience methods

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17675

## Context

BiDi has a substantial emulation surface — the spec defines eleven `emulation.set*`
commands: `setGeolocationOverride`, `setLocaleOverride`, `setTimezoneOverride`,
`setScreenOrientationOverride`, `setUserAgentOverride`, `setNetworkConditions`,
`setForcedColorsModeThemeOverride`, `setScrollbarTypeOverride`, `setTouchOverride`,
`setScriptingEnabled`, and `setScreenSettingsOverride`. Together these cover most of what
users reach for when emulating a device or environment: location, locale, timezone, user
agent, color scheme, touch, offline.

Because the bindings generate one method per command directly from CDDL, all of this is
*already reachable* — but only in raw form: parameter names and shapes follow the wire
spec (`set_geolocation_override` with a coordinates descriptor, contexts/userContexts
lists), so a simple "set the location to Paris" is more ceremony than it should be, and
the available knobs are not discoverable as a coherent emulation API.

Unlike network body collectors, these are not protocol gaps — the commands exist and are
implemented. The only question is whether bindings wrap them in a friendly, discoverable,
*consistent* shape, the way Playwright exposes `set_geolocation`, `grant_permissions`, and
context emulation options (`locale`, `timezone_id`, `color_scheme`, `user_agent`,
`offline`, `has_touch`). A further force: these overrides are **dynamic** in BiDi (apply
mid-session), which is more flexible than Playwright's mostly-at-context-creation model —
the wrappers should preserve that.

## Decision

Bindings expose **named convenience methods on the emulation module**, one per common
override, with friendly arguments and binding-natural enums — delegating to the generated
`emulation.set*Override` commands. The raw generated methods remain for full-fidelity or
less-common parameters.

Normative requirements:

- Cover at least the high-use overrides: geolocation, locale, timezone, user agent,
  network conditions (offline), forced-colors/color-scheme, and touch.
- Methods accept friendly positional/named arguments (e.g. `latitude`, `longitude`),
  not raw wire descriptors, and validate enum-like values.
- Scope arguments (`contexts` / `user_contexts`) are accepted as optional parameters so
  overrides can be global or scoped, matching the protocol (a `user_context` is the isolation
  unit — see [17681](17681-browsing-contexts-exposed-as-handle-objects.md)).
- Overrides apply dynamically and a "clear/reset" path is documented for those the spec
  supports (passing the null/empty override).
- Method **names and argument names are consistent across bindings** (allowing for each
  language's casing convention) so documentation and user knowledge transfer.

Code sketch — Python (reference implementation):

```python
driver.emulation.set_geolocation(latitude=48.8584, longitude=2.2945, accuracy=10)
driver.emulation.set_locale("fr-FR")
driver.emulation.set_timezone("Europe/Paris")
driver.emulation.set_user_agent("Mozilla/5.0 ...")
driver.emulation.set_network_conditions(offline=True)
driver.emulation.set_forced_colors("active")
driver.emulation.set_touch(enabled=True, max_touch_points=5)

# raw escape hatch remains:
driver.emulation.set_geolocation_override(<wire params>)
```

Code sketch — other bindings (idiomatic shape, same semantics):

```javascript
await driver.emulation().setGeolocation({ latitude: 48.8584, longitude: 2.2945 });
await driver.emulation().setTimezone('Europe/Paris');
```

## Considered options

- **Named convenience methods over the generated commands (chosen)** — discoverable,
  friendly, consistent across bindings; preserves dynamic application and scoping; keeps
  the raw methods as an escape hatch.
- **Leave the raw generated methods as the only API** — zero new code, but the emulation
  surface stays undiscoverable and every call carries wire-shape ceremony. Rejected: the
  generated methods are a transport, not an ergonomic API.
- **Bundle emulation into capabilities / session-creation options only** — matches some of
  Playwright's model, but throws away BiDi's dynamic mid-session application, which is a
  genuine advantage. Rejected: would be a downgrade from what the protocol allows.

## Consequences

- Device/environment emulation becomes discoverable and consistent across bindings with
  minimal new surface (thin wrappers).
- A naming decision is locked in across five bindings; getting the names right here avoids
  per-binding drift. The binding-status table tracks convergence.
- The wrappers are thin and low-risk; raw methods are untouched, so this is purely
  additive.
- Some overrides (e.g. screen settings, scrollbar type) are left to the raw methods until
  there is demonstrated demand — the decision deliberately scopes the convenience set to
  high-use overrides rather than wrapping all eleven.

## Binding status

| Binding    | Status  | Notes / tracking link                                                  |
|------------|---------|------------------------------------------------------------------------|
| Java       | pending |                                                                        |
| Python     | pending | all 11 `emulation.set*Override` generated (raw); friendly wrappers not yet built |
| Ruby       | pending |                                                                        |
| .NET       | pending |                                                                        |
| JavaScript | pending |                                                                        |

## Appendix

The eleven `emulation.*` commands in the BiDi spec: `setGeolocationOverride`,
`setLocaleOverride`, `setTimezoneOverride`, `setScreenOrientationOverride`,
`setUserAgentOverride`, `setNetworkConditions`, `setForcedColorsModeThemeOverride`,
`setScrollbarTypeOverride`, `setTouchOverride`, `setScriptingEnabled`,
`setScreenSettingsOverride`. All take optional `contexts`/`userContexts` scoping. These
are existing, implemented commands; this decision is about the binding-side convenience
layer, not protocol support.
