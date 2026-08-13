# 17886. Selenium waits for interaction readiness before it interacts

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17886

## Context

The single most common cause of flaky Selenium tests is acting on an element that is present but
not yet ready: the page is still hydrating, a spinner is still animating, a modal is fading in over
the button, a list is re-rendering under the pointer.

WebDriver already concedes that interaction should wait. It waits on predicates too weak to help:

| Command          | Waiting behavior in the W3C WebDriver specification |
|------------------|------|
| Element Clear    | Steps 6–10: take the implicit wait timeout, start a timer, "wait for element to become *interactable*" |
| Element Send Keys| Steps 7.2–7.6: the same pattern, "wait for element to become *keyboard-interactable*" |
| Element Click    | Steps 5–7: scroll into view, then fail with *element not interactable* or *element click intercepted*. There is no wait |

A *keyboard-interactable* element is "any element that has a focusable area, is a `body` element, or
is the document element" — an element that is invisible, covered by a modal, mid-animation, or
`aria-disabled` satisfies it. *Interactable* is "pointer-interactable or keyboard-interactable", so
`clear`'s wait is satisfied the same way. The implicit wait timeout is initially `0`, so by default
these waits do not run at all; when it is set, the same budget is also spent on element retrieval.
Remote ends then improvise on top — chromedriver waits for an element to be displayed before
clicking — so "nothing waits today" is not a safe assumption either.

The gap is therefore not that WebDriver never waits before interacting. It is that the predicate it
waits on is too weak to prevent the failures users actually hit, it is absent for `click`, it says
nothing about why it expired, it shares a single timeout with element location, and what happens
beyond it differs per remote end.

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
They wait before acting, and users name this as the reason they leave. A wait Selenium users have to
remember to call closes the capability gap but not the experience gap: the tests that flake are the
ones where nobody remembered. What Selenium can offer is the same behavior for users who ask for it,
without changing the timing of code that does not.

BiDi supplies the mechanism. A preload script runs before page script, so an observer can be
watching timers, requests, mutation and motion from before the command arrives — which
just-in-time injection cannot do. A BiDi session is also already opt-in, and its surface is
explicitly still evolving ([17670](17670-bidi-implementation-boundaries.md)).

Four forces are in tension. Readiness is genuinely undecidable from outside the browser: a page that
polls forever is never quiet, so any answer is a heuristic. Selenium's high-level API must stay
protocol-neutral (17670), so the mechanism cannot leak into signatures. The semantics must be
identical in five bindings, or the wait becomes another source of cross-binding divergence rather
than a fix for one. And nothing here may change the timing of existing code that has not asked for
it — including by adding a second timeout budget on top of one the remote end already spends.

## Decision

Selenium waits for interaction readiness inside the interaction commands, for sessions that ask for
it. The wait replaces the implicit wait rather than adding a budget beside it, the semantics are
defined once in a single shared atom, and the underlying state is exposed as snapshots and events rather
than as a blessed pair of wait methods.

**1. Readiness is two independent signals, not one stack.**

- *Page settledness* — no *meaningful* DOM mutation for a settle window, with a pending-work ledger
  as its input rather than a peer signal. The ledger tracks timers, intervals, animation frames,
  `fetch`, `XMLHttpRequest` and WebSocket activity for the document; long-delay timers, long-period
  intervals, and periodic tasks observed to complete repeated invocations with no DOM mutation, no
  network dispatch and no storage write are classified inert and do not block, so clocks and
  keep-alive polls do not prevent settling. Meaningful mutation excludes attribute churn that cannot
  affect layout, and mutation confined to a region annotated inert or detected as periodic noise.
  Running CSS animations and transitions count as activity. Settling can be scoped to a subtree.
- *Element actionability* — visible, enabled (including `aria-disabled` and the `fieldset`/`legend`
  exception), editable when the planned interaction writes, in the viewport, not obstructed at its
  interaction point, and not moving. Which checks apply depends on the interaction: `type` and
  `clear` additionally require editable; `drop` and `screenshot` do not require enabled.

Actionability does not depend on settledness and is not derived from it. That independence is what
makes decision 2 affordable: the interaction path consults actionability only. An application that
long-polls or animates continuously would otherwise pay a settle timeout on every click.

**2. Interaction readiness is enabled by capability, and replaces the implicit wait.** A new
`se:interactionReadiness` capability (boolean, default `false`) turns it on for sessions that also
have BiDi enabled. When it is on:

- `click`, `send_keys`, `clear` and `submit` wait for the element to satisfy the actionability checks
  for that interaction before dispatching.
- Selenium does not forward a non-zero implicit wait timeout to the remote end. The remote end's own
  interactability wait would otherwise run *after* ours and spend a second budget the user never
  asked to combine — worst case, the sum of both on the failing path.
- Because Selenium stops forwarding that timeout, it also takes over element-location waiting on the
  client for these sessions: `findElement` retries until the budget expires. Otherwise enabling the
  capability would silently remove the wait users rely on for element retrieval.
- The budget is the implicit wait timeout when the user sets one, and a documented default of 10
  seconds otherwise. The capability, not the timeout value, is the on/off switch, so a `0` implicit
  wait does not have to mean two different things.

Default `false` is deliberate. An earlier revision of this record proposed that readiness waiting be
the default for every BiDi session; that cannot be done without changing the timing of code already
running on BiDi today, and it interacts badly with a non-zero implicit wait as described above.
Making readiness the default is a follow-up decision, and probably a release-gated one.

The low-level Actions API does not auto-wait. It exists to dispatch an exact input sequence, and
inserting waits between its ticks would change what the sequence means.

This is capability-gated behavior, not a protocol-shaped API. No method signature changes and no
BiDi type is named — 17670 constrains what the API *says*, and it stays silent about BiDi here.

**3. An expired wait raises the error the command raises today, in a distinguishable subclass.** The
obstruction case raises `ElementClickInterceptedException`, the not-visible, not-enabled or
not-editable case raises `ElementNotInteractableException`, each as a readiness-specific subclass of
the existing type, carrying the diagnosis in its message. Existing `catch`/`except`/`rescue` blocks
keep matching, and users who want to distinguish "still not ready after the budget" from "not ready
at the instant of the command" can catch the subclass. The timeout is raised client-side, which is
what makes the subclass possible. No new session timeout and no session-level toggle are introduced;
the capability is the switch and the implicit wait timeout is the budget.

**4. No new wait method is added to the driver or to the element.** `driver.method(element)` inverts
the object model, and a single blessed wait method would make one waiting strategy the only way to
reach the functionality. The wait lives inside the interaction commands, where the user does not
have to know it is there; everything else is reached through decision 5.

**5. Readiness state is exposed as snapshots and as events, not only as waits.** Both signals are
readable from the `script` domain, so users can compose them with the waiting strategy they already
have:

- A snapshot call returns the current record — pending work classes, still-mutating regions, or for
  an element the per-check result and the obstructing element — without waiting. This is what makes
  the state usable inside an existing `WebDriverWait`, and what makes a failure diagnosable.
- A settledness handler follows the existing `driver.script.add_dom_mutation_handler` pattern
  (`java/src/org/openqa/selenium/remote/RemoteScript.java:85`): preload script, `ChannelValue`,
  `script.onMessage`. This is the same machinery the readiness observer already needs, so a
  settledness event is a payload change rather than new plumbing.

This shape does not assume an asynchronous script API. It fits the script module's planned
synchronous execution with handlers for asynchronous behavior, and it means no client library is
forced into Selenium's waiting strategy to use Selenium's readiness data.

**6. Settledness becomes a locally managed page load strategy.** A `settled` page load strategy
waits for the page to settle after a navigation, in addition to what `normal` guarantees.
`pageLoadStrategy` is a validated capability whose value must be `none`, `eager` or `normal`, so
`settled` is consumed by the binding and never sent on the wire; the session is created with
`normal` and the binding performs the extra wait. This gives settledness a home in an API users
already understand instead of a new method to discover.

**7. Navigation and interaction can override the strategy for one action.** The per-session strategy
is a default, not a constraint: a navigation or a click that is known to trigger a slow re-render can
ask for `settled` while the rest of the suite does not pay for it, and one that is known to leave the
page busy forever can ask for `none`.

**8. One shared atom, with narrow named exports.** The semantics live in one shared
JavaScript/TypeScript implementation in `javascript/atoms/`, shipped as a single artifact that
exposes a small set of named exports rather than one combined entry point. Each export takes only
the arguments belonging to it and returns only its own result — pending work for a document,
settledness given a root and a settle window, actionability given an element and an interaction — so
a binding that wants an actionability snapshot neither constructs arguments for settledness nor
interprets a record containing it. Bindings pass arguments and marshal results; no binding adds
logic of its own. One artifact is what holds the heuristics together: what counts as meaningful
mutation, when a spinner is inert and how obstruction is hit-tested share definitions, will not stay
identical across five hand-written ports, and are one thing to hand to the BiDi working group. The
exports are what keep a caller from taking on the parts it did not ask for.

**9. The atom is installed as a preload script, and degrades explicitly.** Registration is
per-binding plumbing that must never affect navigation: if it fails, the failure is logged once and
readiness waiting is off for that session, so the interaction commands behave exactly as they do
today. Snapshot and settledness access fall back to injection into the current document, where
pending-work history cannot be observed and the record says so rather than silently reporting quiet.

**10. This is a prototype of a protocol feature.** The heuristics exist in page script only because
the browser does not expose the answer. The implementation is written as a reference for a proposed
BiDi `quiescence` module and its limits are documented, not hidden: effects performed
asynchronously by a periodic callback are misattributed, and workers, `MessageChannel`,
server-sent events, WebTransport, IndexedDB and canvas-only animation frames are not tracked.
Selenium takes this to the WebDriver BiDi working group; if it lands, the bindings keep their API,
and drop the polyfill.

## Considered options

**Where readiness is decided**

1. *Leave it to users* (Rejected) — the status quo. Every user re-derives the same heuristics badly,
   most settle on `sleep`, and Selenium carries the reputation cost for flakiness it could remove.
2. *Add more expected conditions* (Rejected) — conditions are built from the same element flags that
   are already insufficient, and cannot see timers, requests or mutation at all. This does not reach
   the problem.
3. *Explicit waits only, never inside the interaction* (Rejected) — closes the capability gap and
   leaves the experience gap open. The tests that flake are the ones where the user did not think to
   call the wait.
4. *Inside the interaction commands, capability-gated, with snapshot and event access alongside*
   (Accepted).

**How the wait is budgeted**

5. *A new `readiness` session timeout* (Rejected) — for `send_keys` and `clear` the remote end runs
   its own interactability wait on the implicit wait timeout, so a separate budget stacks with it and
   a user who set an implicit wait gets a total they never asked for.
6. *Replace the implicit wait on these sessions and stop forwarding it* (Accepted) — one budget, one
   place it is spent, and the semantics the timeout was always meant to have.

**Who waits for element location once the implicit wait is not forwarded**

7. *Keep forwarding the implicit wait for location only* (Rejected) — it is one session-wide value,
   so this is not expressible; it degenerates into the stacking of option 5.
8. *Selenium retries element location on the client for these sessions* (Accepted) — the cost is
   polling round-trips where the remote end used to spin locally, and the gain is a failure message
   that can say what it was waiting for.

**How far this reaches by default**

9. *On for every BiDi session* (Rejected for now) — this is the end state and it is what actually
   closes the experience gap, but it changes the timing of code already running on BiDi and cannot be
   reconciled with an existing non-zero implicit wait without surprise. Deferred to a follow-up
   decision, likely gated on a major release.
10. *On for every session, classic included* (Rejected) — cannot be done at full fidelity: without a
    preload the observer starts at the moment of the command, so motion and mutation history are
    unavailable and "not moving" degrades to a guess.
11. *Off unless the session asks for it* (Accepted).
12. *Readiness includes settledness as well as actionability in the interaction path* (Rejected) —
    every click on an application that long-polls or animates continuously would pay the settle
    timeout. Settledness is reached through decisions 5 and 6 instead.
13. *Auto-wait inside the Actions API too* (Rejected) — it dispatches an exact input sequence;
    silently inserting waits changes the semantics of the sequence.

**What an expired wait raises**

14. *A timeout error* (Rejected) — every existing `catch (ElementClickInterceptedException)` stops
    matching, which is a break for the users most likely to have written one.
15. *The error the command raises today* (Rejected as insufficient) — compatible, but a readiness
    failure becomes indistinguishable from an immediate one.
16. *A readiness-specific subclass of the error the command raises today* (Accepted).

**How users reach the underlying state**

17. *Two wait methods on the driver, taking an element* (Rejected) — inverts the object model, and
    makes one waiting strategy the only route to the data.
18. *The same methods moved onto the element* (Rejected) — better placement, same problem: it is
    still a single blessed wait rather than state a user can compose with.
19. *Snapshots and handlers in the `script` domain, with the wait hidden inside the interaction*
    (Accepted).

**Where the semantics live**

20. *Each binding implements the oracle in its own language* (Rejected) — five ports of a heuristic
    this fiddly diverge immediately, and the divergence surfaces to users as cross-binding
    flakiness.
21. *Specify the semantics in this record, implement per binding* (Rejected) — prose cannot pin
    down "meaningful mutation" tightly enough to make five implementations agree.
22. *One shared atom behind a single combined entry point* (Rejected) — forces bindings to
    construct and interpret arguments for functionality they are not using, which is where
    per-binding logic creeps back in.
23. *Several separate atoms, one per signal* (Rejected) — keeps callers honest, but splits
    heuristics that share definitions of meaningful mutation and inertness across artifacts that can
    be built, shipped and versioned apart, which is the divergence this record exists to prevent.
24. *One shared atom exposing narrow named exports* (Accepted) — one place to fix a
    misclassification and one artifact to hand to the BiDi working group, with a per-signal export so
    no caller takes on more than it asked for.

**How it reaches the page**

25. *Specify the BiDi module first and wait for browsers* (Rejected as a precondition) — the right
    end state, but it leaves users with nothing for years and gives the working group no evidence.
    Pursued in parallel, not instead.
26. *CDP* (Rejected) — Chromium-only, and being retired as an implementation mechanism.
27. *BiDi preload script, with fallback injection where the signal allows it* (Accepted).

## Consequences

- Users who ask for readiness stop writing the wait. This is the change that answers "why did you
  move to Playwright", and it is available without asking anyone else to absorb a timing change.
- Nothing changes for a session that does not set the capability. That is what makes the record
  shippable in a minor release, and it is also its main weakness: the users who flake are the ones
  who will not know the capability exists. Documentation and templates carry more weight here than
  they would for a default.
- On sessions that do enable it, Selenium owns waiting that the remote end used to do. Element
  location becomes client-side polling, so the round-trip count rises where the remote end used to
  spin locally, and the implicit wait timeout changes meaning for that session.
- Every interaction pays a readiness check. The fast path — already actionable, observer already
  installed — is one script evaluation, and the implementation is measured against that budget or
  the feature is not defensible.
- Selenium takes on maintenance of a heuristic that will be wrong sometimes. A false "not ready"
  becomes a timeout on a test that used to pass, which is a worse failure than a false "ready". The
  policy knobs (settle window, inert thresholds, ignore patterns, cooperative inert-region
  annotation) and not setting the capability are the escape hatches.
- The waits are best-effort by construction. This must be stated in the user documentation, not
  only in the code, or the API will be read as a guarantee.
- A page that never stops working never settles. A `settled` page load strategy on such a page
  always reaches its timeout, which is correct behavior and will be reported as a bug.
- The shared atom is loaded and injected by each binding, so each needs the packaging wiring to
  ship a JavaScript resource. Bindings that already ship atoms have this; the rest gain a build step.
- The project's own test suite gains coverage rather than losing it: the capability is off by
  default, so existing tests are unaffected, and each binding needs tests for the capability on, the
  capability off, and preload registration failing.
- Follow-up decisions this makes necessary: whether readiness becomes the default for BiDi sessions
  and in which release; whether `ExpectedConditions.elementToBeClickable` and its equivalents are
  deprecated; whether classic sessions ever get a reduced-fidelity variant; the concrete names and
  signatures for the snapshot and handler surface; and the shape of the BiDi `quiescence` module
  proposal.

## Appendix

A working reference implementation exists for Python: the oracle registered as a BiDi preload script
and exposed as `driver.wait_for_dom_settled` and `driver.wait_until_actionable`, with roughly 1,500
lines of behavioral tests covering mutation classification, periodic-noise detection, shadow DOM and
frame boundaries, obstruction hit-testing, motion stability, and the per-interaction check matrix. It
is linked from this record's PR as evidence that the semantics above are implementable and testable,
not as the proposed API shape — decisions 4 and 5 replace its two driver-level wait methods, and
decision 8 keeps its single atom while requiring narrow named exports in place of its combined
entry point. The capability, the implicit-wait
replacement, the client-side element-location retry, the error subclasses, and the `settled` page
load strategy are proposed here and not yet built.
