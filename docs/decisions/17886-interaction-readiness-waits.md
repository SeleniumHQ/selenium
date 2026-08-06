# 17886. Selenium waits for interaction readiness, by default on BiDi sessions

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17886

## Context

The single most common cause of flaky Selenium tests is acting on an element that is present but
not yet ready: the page is still hydrating, a spinner is still animating, a modal is fading in over
the button, a list is re-rendering under the pointer. WebDriver's own actionability checks run at
the moment of the command — click scrolls into view and verifies the in-view centre point is
pointer-interactable — and then either succeeds or throws. They do not wait, and they do not
consider whether the *page* has finished doing work.

Users therefore write the wait themselves. Every binding gives them a polling primitive and, at
best, conditions that check element flags:

| Binding    | Current behavior |
|------------|------------------|
| Java       | `ExpectedConditions.elementToBeClickable` — `isDisplayed()` and `isEnabled()` only |
| Python     | `expected_conditions.element_to_be_clickable` — `is_displayed()` and `is_enabled()` only |
| Ruby       | No conditions library; generic `Selenium::WebDriver::Wait#until { }` block |
| .NET       | No conditions library; generic `DefaultWait.Until(lambda)` (`ExpectedConditions` was moved out of the project) |
| JavaScript | `until.elementIsVisible` and `until.elementIsEnabled` separately; no combined condition |

No binding can express "the page has stopped changing" at all. `document.readyState` and the
`pageLoad` timeout say nothing about a single-page application, and nothing observes timers,
in-flight requests, animation loops, or DOM mutation. The gap is filled with `sleep`, with
retry-on-`ElementClickInterceptedException`, or by migrating to a tool that has the wait built in.

The comparison that matters is that Playwright and Cypress do not ask the user for the wait at all.
They wait before acting, by default, and users name this as the reason they leave. An explicit wait
Selenium users have to remember to call closes the capability gap but not the experience gap: the
tests that flake are the ones where nobody remembered.

BiDi is what makes closing the experience gap possible now. A BiDi session is already opt-in —
the user asks for it with `webSocketUrl`/`enableBidi` — and its surface is explicitly still
evolving ([17670](17670-bidi-implementation-boundaries.md)). Behavior can therefore change *inside*
that opt-in without changing the timing of the millions of existing classic-only tests. BiDi also
supplies the mechanism: a preload script runs before page script, so an observer can be watching
timers, requests, mutation and motion from before the command arrives — which just-in-time
injection cannot do.

Three forces are in tension. Readiness is genuinely undecidable from outside the browser: a page
that polls forever is never quiet, so any answer is a heuristic. Selenium's high-level API must stay
protocol-neutral (17670), so the mechanism cannot leak into signatures. And the semantics must be
identical in five bindings, or the wait becomes another source of cross-binding divergence rather
than a fix for one.

## Decision

Selenium waits for interaction readiness before it acts. On a BiDi-enabled session this is the
default behavior of the ordinary interaction commands; the semantics are defined once, implemented
once, and also exposed as explicit waits.

**1. Readiness is modelled in three composable layers.**

- *Pending work* — a live ledger of timers, intervals, animation frames, `fetch`, `XMLHttpRequest`
  and WebSocket activity for the document. Long-delay timers, long-period intervals, and periodic
  tasks observed to complete repeated invocations with no DOM mutation, no network dispatch and no
  storage write are classified inert and do not block. Clocks and keep-alive polls therefore do not
  prevent quiescence.
- *DOM settledness* — no *meaningful* mutation for a settle window. Meaningful excludes attribute
  churn that cannot affect layout, and excludes mutation confined to a region annotated inert or
  detected as periodic noise. Running CSS animations and transitions count as activity. Waiting can
  be scoped to a subtree.
- *Element actionability* — visible, enabled (including `aria-disabled` and the `fieldset`/`legend`
  exception), editable when the planned interaction writes, in the viewport, not obstructed at its
  interaction point, and not moving. Which checks apply depends on the interaction: `type` and
  `clear` additionally require editable; `drop` and `screenshot` do not require enabled.

**2. Interaction commands wait for actionability by default when the session has BiDi enabled.**
`click`, `send_keys`, `clear` and `submit` first wait for the element to satisfy the actionability
checks for that interaction, then dispatch. On a classic HTTP-only session nothing changes: the
observer that supplies motion and mutation history has to be installed before page script runs, so
the default is available exactly where the mechanism is.

The default wait is layer 3 only. It does not require the document to be settled or pending work to
be quiet — an application that long-polls would otherwise stall on every click. Layers 1 and 2 stay
explicit, and inform the diagnosis when a wait fails.

The low-level Actions API does not auto-wait. It exists to dispatch an exact input sequence, and
inserting waits between its ticks would change what the sequence means.

This is capability-gated behavior, not a protocol-shaped API. No signature changes, no BiDi type is
named, nothing new is reachable off the driver — 17670 constrains what the API *says*, and it stays
silent about BiDi here.

**3. A new `readiness` session timeout bounds the implicit wait, and failures keep their current
type.** Default 10 seconds; `0` disables implicit waiting for that session, as does the
session-level toggle. When the wait expires the command raises what it raises today —
`ElementClickInterceptedException` when the element is obstructed,
`ElementNotInteractableException` when it is not visible, enabled or editable — with the diagnosis
appended to the message. Existing `catch`/`except` blocks keep working; a test that fails today
fails the same way, later and with a better message.

**4. Two explicit entry points remain, both on the driver, both protocol-neutral.** Names follow
each language's casing convention:

```
driver.waitForDomSettled(root?, timeout, settle, requirePendingQuiet)  → readiness result
driver.waitUntilActionable(element, interaction, timeout)              → readiness result
```

These are the way to reach layers 1 and 2, the way to wait on a classic session, and the way to
wait for readiness without interacting. `waitUntilActionable` composes the layers: settle the
document, then wait for the element, scrolling it into view once if it starts outside the viewport.
The pending-work ledger is an input to the other two (`requirePendingQuiet`), not a third public
entry point — "are there pending timers?" is not a question users should have to ask.

**5. An explicit wait that times out raises the binding's existing timeout error, and the error
carries the diagnosis.** Consistency with `WebDriverWait` matters more than the convenience of a
boolean. The error message names what was still active: the blocking work classes, the
still-mutating regions, or for an element the specific failing check and the obstructing element.
"Timed out after 10s" is what makes current waits unhelpful; this is the main thing the feature has
to fix. A non-blocking inspection call returning the same snapshot without waiting is available for
diagnostics and for users building their own conditions.

**6. One implementation, shared by all bindings.** The readiness oracle is a single JavaScript
implementation in `javascript/atoms/`, injected into the page; bindings are thin wrappers that
marshal arguments and translate the result. Heuristics this delicate — what counts as meaningful
mutation, when a spinner is inert, how obstruction is hit-tested — will not stay identical across
five hand-written ports, and any divergence is a behavioral difference users hit as flakiness.

**7. The oracle is installed as a preload script over the BiDi session, and degrades explicitly.**
Registration is per-binding plumbing that must never affect navigation: if it fails, the failure is
logged once, implicit waiting is off for that session, and the interaction commands behave exactly
as they do today. The explicit entry points remain available and fall back to injection into the
current document, where layer 1 state cannot be observed and the result says so rather than
silently reporting quiet.

**8. This is a prototype of a protocol feature.** The heuristics exist in page script only because
the browser does not expose the answer. The implementation is written as a reference for a proposed
BiDi `quiescence` module and its limits are documented, not hidden: effects performed
asynchronously by a periodic callback are misattributed, and workers, `MessageChannel`,
server-sent events, WebTransport, IndexedDB and canvas-only animation frames are not tracked.
Selenium takes this to the WebDriver BiDi working group; if it lands, the bindings keep their API
and their default, and drop the polyfill.

## Considered options

**Where readiness is decided**

1. *Leave it to users* (Rejected) — the status quo. Every user re-derives the same heuristics badly,
   most settle on `sleep`, and Selenium carries the reputation cost for flakiness it could remove.
2. *Add more expected conditions* (Rejected) — conditions are built from the same element flags that
   are already insufficient, and cannot see timers, requests or mutation at all. This does not reach
   the problem.
3. *Explicit waits only, never implicit* (Rejected) — closes the capability gap and leaves the
   experience gap open. The tests that flake are the ones where the user did not think to call the
   wait, so an opt-in wait does not fix them.
4. *Explicit waits, plus implicit waiting by default on BiDi sessions* (Accepted).

**How far the default reaches**

5. *Implicit waiting on every session, classic included* (Rejected) — changes the timing of every
   existing test with no opt-in anywhere, and cannot be done properly: without a preload the
   observer starts at the moment of the command, so motion and mutation history are unavailable and
   "not moving" degrades to a guess.
6. *Ship the default off for one release, on the next* (Rejected) — enabling BiDi is already the
   opt-in, and its surface is documented as evolving. A second gate mostly delays the feedback the
   heuristics need. The session toggle and `readiness = 0` are the escape hatch instead. If the TLC
   prefers a staged rollout, this is the fallback to negotiate rather than a reason to reject.
7. *Implicit waiting includes full quiescence, not just actionability* (Rejected) — every click on
   an application that long-polls or animates continuously would pay the settle timeout. Layers 1
   and 2 stay explicit.
8. *Auto-wait inside the Actions API too* (Rejected) — it dispatches an exact input sequence;
   silently inserting waits changes the semantics of the sequence.

**What an expired implicit wait raises**

9. *A timeout error* (Rejected) — every existing `catch (ElementClickInterceptedException)` stops
   matching, which is a break for the users most likely to have written one.
10. *The error the command raises today, with the diagnosis appended* (Accepted).

**Where the semantics live**

11. *Each binding implements the oracle in its own language* (Rejected) — five ports of a heuristic
    this fiddly diverge immediately, and the divergence surfaces to users as cross-binding
    flakiness.
12. *Specify the semantics in this record, implement per binding* (Rejected) — prose cannot pin
    down "meaningful mutation" tightly enough to make five implementations agree.
13. *One shared JavaScript implementation, thin binding wrappers* (Accepted) — one place to fix a
    misclassification, and a single artifact to hand to the BiDi working group.

**How it reaches the page**

14. *Specify the BiDi module first and wait for browsers* (Rejected as a precondition) — the right
    end state, but it leaves users with nothing for years and gives the working group no evidence.
    Pursued in parallel, not instead.
15. *CDP* (Rejected) — Chromium-only, and being retired as an implementation mechanism.
16. *BiDi preload script, with fallback injection where the layer allows it* (Accepted).

## Consequences

- Users who enable BiDi stop writing the wait. This is the change that answers "why did you move to
  Playwright", and it is why the default is worth the risk the rest of these bullets describe.
- Enabling BiDi is now a behavioral choice, not only a transport choice: the same test can pass on
  BiDi and fail on classic, and vice versa. This must be documented prominently, and it converges
  only when BiDi becomes the default transport.
- Existing BiDi users get changed timing on upgrade. Failure *types* are preserved and the toggle
  is one line, but a suite that asserts an interaction fails immediately will now wait up to the
  readiness timeout first. Failing tests get slower; passing tests mostly do not change.
- Every interaction pays a readiness check. The fast path — already actionable, observer already
  installed — is one script evaluation, and the implementation is measured against that budget or
  the default is not defensible.
- Selenium takes on maintenance of a heuristic that will be wrong sometimes, and it is now wrong in
  the default path. A false "not ready" becomes a timeout on a test that used to pass, which is a
  worse failure than a false "ready". The policy knobs (settle window, inert thresholds, ignore
  patterns, cooperative inert-region annotation) and the toggle are the escape hatches.
- The waits are best-effort by construction. This must be stated in the user documentation, not
  only in the code, or the API will be read as a guarantee.
- A page that never stops working never settles. `waitForDomSettled` on such a page always reaches
  its timeout, which is correct behavior and will be reported as a bug.
- The shared atom is loaded and injected by each binding, so each needs the packaging wiring to ship
  a JavaScript resource. Bindings that already ship atoms have this; the rest gain a build step.
- The project's own test suite is affected: BiDi-enabled tests that expect immediate interaction
  errors need the toggle, and each binding needs coverage that the default is off for classic
  sessions and off when preload registration fails.
- Follow-up decisions this makes necessary: whether `ExpectedConditions.elementToBeClickable` and
  its equivalents are deprecated in favour of `waitUntilActionable`; whether classic sessions ever
  get a reduced-fidelity default; and the shape of the BiDi `quiescence` module proposal.

## Appendix

A working reference implementation exists for Python: the oracle as
`javascript/atoms/quiescence.js`, registered as a BiDi preload script and exposed as
`driver.wait_for_dom_settled` and `driver.wait_until_actionable`, with roughly 1,500 lines of
behavioral tests covering mutation classification, periodic-noise detection, shadow DOM and frame
boundaries, obstruction hit-testing, motion stability, and the per-interaction check matrix. It is
linked from this record's PR as evidence that the semantics above are implementable and testable,
not as the proposed final API shape. It differs from this record in two ways: it returns a result
record rather than raising, which decision 5 changes, and it implements only the explicit waits —
the default of decision 2 is proposed here, not yet built.
