# 0010. BiDi is exposed in three layers: a Classic-compatible surface, explicit BiDi modules, and raw protocol

- Status: Proposed
- Date: 2026-06-23
- Discussion: <!-- PR link; file renames to the PR number on open -->

## Context

BiDi gives Selenium a large set of new capabilities — events, network interception, isolated
user contexts, emulation overrides, typed storage, permissions — and a series of ADRs
(17671–17677, 17681) proposes ergonomic APIs for them. Every one of those ADRs runs into the
same unanswered question, raised directly in review of the storage ADR (17673):

> `driver.storage` overlaps `driver.manage().addCookie()`, which already does the same job from
> the user's point of view. Is this a new explicit BiDi API users opt into (Option A), or does
> the high-level API stay unified and pick Classic or BiDi under the hood (Option B)? **This
> pattern repeats across every module, so the answer affects all of them.**

Today we have no agreed answer, so each module ADR re-litigates it, and reviewers can't tell
whether a proposal is adding *new top-level surface* or *a power-user tool beside the existing
one*. Three forces are in tension:

- **The 80%.** Most users want their existing code to keep working and to get BiDi's benefits
  without learning new namespaces or protocol vocabulary. Review feedback on 17681 is explicit:
  users shouldn't need to understand "browsing context" / "user context"; surface *isolation*,
  not the protocol noun; and don't pile everything onto `driver` (a "god object").
- **The power user.** Interception, per-context events, isolated partitions, and original-body
  reads genuinely need fine-grained, BiDi-shaped APIs that have no Classic equivalent.
- **Compatibility.** Classic APIs (`get`, `manage().addCookie()`, `switchTo`, `findElement`)
  must keep working unchanged — users upgrade by changing a version number.

We need one decision that fixes where a capability is exposed, so the module ADRs become
"which layer, and what shape within it" rather than "should this exist at all."

## Decision

Selenium exposes BiDi through **three layers**, and every BiDi feature is placed at the
**highest layer it fits**:

1. **Layer 1 — the unified high-level API (the 80%).** The existing Classic-shaped surface
   stays the primary entry point, and when a BiDi session is active **it is implemented by
   delegating to the Layer 2 BiDi modules.** The signature and return shape stay identical; the
   implementation underneath moves to BiDi:
   - `driver.get(url)` runs `browsing_context.navigate(...)`,
   - `driver.add_cookie(...)` runs the BiDi storage set-cookie,
   - `driver.switch_to.new_window(...)` runs `browsing_context.create(...)`.

   New capabilities are added here *in Classic idiom* when they map onto a concept users already
   have — surfacing the user-facing idea, not the protocol noun. So **isolation is surfaced as a
   Classic-shaped concept (e.g. an "isolated" window) rather than as a user-context object**; the
   exact spelling is 17681's to decide. Users don't learn a new namespace to get the benefit.
2. **Layer 2 — explicit BiDi modules (the power user).** `driver.network`, `driver.script`,
   the browsing-context handle (17681), typed storage (17673), emulation overrides (17675),
   permissions (17677), and the `expect_*`/event surface (17671) live here. This layer is
   BiDi-shaped, names protocol concepts honestly (`UserContext`, `BrowsingContext`), and is
   documented as the advanced surface for fine control. **The module ADRs in this series are
   Layer 2 decisions** — they add power-user tools *beside* the Classic API, they do not replace
   or compete with Layer 1.
3. **Layer 3 — raw protocol.** Send arbitrary BiDi commands / subscribe to raw events. The
   escape hatch for anything the higher layers don't cover yet; always available, never the
   recommended path.

Normative consequences of the layering:

- **Placement rule.** If a capability maps onto an existing Classic concept, it is exposed at
  Layer 1 and Classic routes to BiDi under the hood; only BiDi-only capabilities, or ones needing
  fine control, get first-class Layer 2 surface. A feature appears at Layer 2 *in addition to*,
  never *instead of*, a Layer 1 path that already covers the common case.
- **Classic is a facade over Layer 2, not deprecated.** When a BiDi session is live, Classic
  APIs keep their exact signatures but are **implemented by calling the Layer 2 BiDi modules**;
  when there is no BiDi session they fall back to the Classic HTTP commands. They are never
  removed; there is no forced migration. (How each specific Classic API routes to BiDi is its
  own per-binding change, with tests.)
- **Layer 2 is opt-in and honestly named.** Because Layer 2 is for users who chose to reach for
  it, it may use protocol vocabulary; the "hide the concept" requirement applies to Layer 1.
  This is how 17681 reconciles "users shouldn't see user contexts" (Layer 1: `isolated`) with
  "expose the `UserContext` factory" (Layer 2).
- **Every module ADR declares its layer** in its Context, so reviewers know its scope. The
  current series is Layer 2 unless it says otherwise.

```python
# Layer 1 — unchanged Classic surface; the SAME calls, now BiDi-backed under the hood
driver.get("https://example.com")
driver.add_cookie({"name": "a", "value": "1"})
driver.switch_to.new_window("tab", isolated=True)   # e.g. isolation in Classic idiom (17681 owns the spelling)

# ...because Layer 1 is a facade that delegates to Layer 2 when a BiDi session is active:
class WebDriver:
    def get(self, url):
        if self._bidi_active:
            self.browsing_context.navigate(context=self.current_window_handle,
                                            url=url, wait=ReadinessState.COMPLETE)
        else:
            self.execute(Command.GET, {"url": url})   # Classic fallback, unchanged signature

# Layer 2 — explicit BiDi modules, for fine control (the 17671–17681 series)
tab = driver.browsing_context.create(type=WindowTypes.TAB, isolated=True)   # handle (17681)
tab.network().on_response_completed(...)                                    # scoped events (17681/17671)
uc = driver.browser.create_user_context(proxy=...)                          # the isolation unit, named

# Layer 3 — raw escape hatch
driver.bidi_session.send("browsingContext.create", {"type": "tab"})
```

## Considered options

- **Three-layer model, capability placed at the highest layer it fits (chosen)** — keeps the
  80% on a stable, namespace-free surface; gives power users honest BiDi tools; preserves
  compatibility; and gives every other ADR a fixed answer to "where does this go." Matches the
  review feedback (hide concepts at Layer 1, name them at Layer 2).
- **Option A — explicit BiDi API only.** Every BiDi capability is a new namespace users opt
  into; Classic stays frozen for Classic sessions. Rejected as the *whole* answer: it pushes the
  80% to learn protocol vocabulary for things they already do (cookies, navigation, windows) and
  splits the ecosystem into two parallel APIs. It survives *as Layer 2*.
- **Option B — transparent abstraction only.** One unified API; the binding silently picks
  Classic or BiDi. Rejected as the *whole* answer: interception, per-context events, and isolated
  partitions have no Classic shape to hide behind, and forcing them through a unified surface
  either bloats it or hides necessary control. It survives *as Layer 1*.
- **Replace Classic with BiDi-backed equivalents.** Rejected outright: breaks the compatibility
  invariant; users would have to migrate.

## Consequences

- The module ADRs (17671–17677, 17681) are reframed as **Layer 2** and stop competing with the
  Classic surface — this should remove the recurring "new namespace vs. reuse" debate and
  simplify getting them merged.
- The target architecture is that **Layer 1 is delegated entirely onto Layer 2 when a BiDi
  session is active** — `get`, `add_cookie`, `switch_to`, etc. each become a thin wrapper over
  the corresponding BiDi module. This is significant per-binding work, rolled out one Classic API
  at a time (each its own change with tests), not a single switch. The window-handle string
  already equals the BiDi context id in the drivers Selenium targets, which is what lets Layer 1
  delegate to Layer 2 without a translation table; this is a **high-risk wire-level area**.
- Behaviour parity is a hard requirement of that delegation: a BiDi-backed `driver.get` must
  return/raise what the Classic one did (e.g. same timeout/error semantics), or it is a
  regression — so each routing carries Classic-vs-BiDi parity tests.
- **Layer 1 must hide protocol nouns; Layer 2 may name them.** New high-level surface that leaks
  "user context"/"browsing context" is a Layer-1 design bug.
- Users get a clear mental model: *use what you already know; drop to a BiDi module when you need
  control; drop to raw protocol when you must.* Each step down is a deliberate trade of
  simplicity for power.
- Cross-binding: the three layers and the placement rule are shared; the exact Layer 1 routings
  differ per binding and converge over time.

## Binding status

| Binding    | Status  | Notes / tracking link                                          |
|------------|---------|----------------------------------------------------------------|
| Java       | pending |                                                                |
| Python     | pending | Layer 2 modules exist; Layer 1 routing to BiDi not yet wired   |
| Ruby       | pending |                                                                |
| .NET       | pending |                                                                |
| JavaScript | pending |                                                                |

## Appendix

This ADR is about *where* capabilities live, not their detailed shape — each module ADR owns its
own Layer 2 design. The layering exists to answer, once, the question raised across the series:
a new BiDi ergonomic is a power-user tool *beside* the Classic API (Layer 2), the Classic API
remains the 80% surface and may be BiDi-backed (Layer 1), and neither forces migration.
