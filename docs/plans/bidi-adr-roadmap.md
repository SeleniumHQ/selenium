# BiDi decision roadmap

- Status: Draft
- Owner: Selenium Technical Leadership Committee (TLC)

## Purpose

This is a planning document, not a decision. Four BiDi decision records are drafted; each stands on
its own and carries its own context. This document is what the records cannot hold individually:
how they size against each other, which events they account for between them, and the few loose
ends that belong to none of them.

Writing a record does not put it in a release. What a given release carries is decided separately,
and the charter ([selenium-5.md](selenium-5.md)) picks up whichever records are scoped into
Selenium 5.

Once the four are accepted, only the event coverage table below has a continuing reason to exist,
and it could move to the charter. This document can be deleted then.

## The records

| Record | Settles | Size |
|---|---|---|
| [Capabilities: timeouts and prompt behavior](../decisions/capabilities-timeouts-and-prompt-behavior.md) | `unhandledPromptBehavior` and `timeouts` keep their classic meaning; the binding enforces both | Large |
| [Navigation and waits](../decisions/navigation-and-waits.md) | Navigation events as handlers; client-enforced page load timeout; readiness per call | Medium |
| [File handling](../decisions/file-handling.md) | A `driver.file` namespace, an element upload method, download retrieval, dialog and download handlers | Large |
| [Browsing contexts and windows](../decisions/browsing-contexts-and-windows.md) | A windows namespace, window values, client windows, viewport, window events; switching stays explicit | Extra large |

Each is numbered by its own pull request, so each needs its own branch and PR; the process is in
[decisions/README.md](../decisions/README.md) and repeated in each record's header. When a record
is renamed to `NNNN-title.md`, the link to it above needs updating.

## What drives the size

**Capabilities — large, and the riskiest.** The API surface is small: a per-type prompt map in the
four bindings that lack it, and nothing new for timeouts. The cost is machinery. Preserving classic
prompt semantics means a session-long subscription, holding prompts open between commands, applying
the configured behavior at the point the next command is issued, and synthesizing the
unexpected-alert error — which puts new code in every binding's command dispatch path, the hottest
and least forgiving place to put it. Client-side timeout enforcement lands in every wait. This is
the only record that changes behavior users already depend on rather than adding to it, so its
blast radius is wider than its surface suggests.

**Navigation and waits — medium.** Almost entirely additive: eight handler families of the same
shape, one value type, a readiness argument on navigation commands, and the page load deadline.
No deprecations. Python needs a navigation object or an explicit decision not to have one. The one
entanglement is the deadline, which the capabilities record owns and this record consumes.

**File handling — large, mostly deprecation.** The new surface is modest — a namespace, an element
method, two handler families, and download retrieval moving. The weight is in retiring
`sendKeys`-with-a-path and the file detectors across five bindings, with their documentation,
examples, and tests, on a two-release tail. It also introduces the first handler family that
cannot block, which is a documentation problem as much as a code one.

**Browsing contexts and windows — extra large.** The largest surface in the set: a namespace, two
new types, operations Selenium has never had (background open, close by handle, activate, client
windows, viewport), window events, and the deprecation of `manage().window()` in four bindings plus
Python's flat window methods. It is also the record with the least compatibility pressure behind
it, which makes it the natural thing to stage across releases if the whole does not fit.

## Event coverage

Where each subscribable event lands if all four records are accepted as drafted. The core
specification defines 24 events; three more come from extension specifications.

| Events | Record |
|---|---|
| `network.beforeRequestSent`, `responseStarted`, `responseCompleted`, `fetchError`, `authRequired` | [17685](../decisions/17685-network-handler-behavior.md), accepted |
| `log.entryAdded`, `script.message` | Script and logging |
| `script.realmCreated`, `realmDestroyed` | Unclaimed — see below |
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load`, `historyUpdated` | Navigation and waits |
| `browsingContext.userPromptOpened`, `userPromptClosed` | Capabilities |
| `input.fileDialogOpened`, `browsingContext.downloadWillBegin`, `downloadEnd` | File handling |
| `browsingContext.contextCreated`, `contextDestroyed` | Browsing contexts and windows |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |

## What BiDi can express, and does not need a decision

Checked while drafting, so the gap list in the capabilities record can be read as complete rather
than merely long. None of these needs anything built: window rect and state
(`browser.setClientWindowState` takes `normal` with x, y, width, and height, plus fullscreen,
maximized, and minimized), page load strategy (the readiness states cover all three classic values
and add a fourth), element screenshots (the screenshot clip), and frames (addressable directly as
contexts).

The classic behaviors BiDi genuinely cannot express — the prompt handler's notify variants and
timing, and the three classic timeouts — are stated in full in the capabilities record, which
settles them.

## Notes on scope

**Commands are already covered.** [17786](../decisions/17786-bidi-low-level-behavioral-contract.md)
makes every command in the specification a typed call at the low-level layer, so nothing is missing
because a record does not mention it. A record is needed only where a command should have a
supported high-level API, and that is a decision to take when someone wants one — screencast,
`setBypassCSP`, `setExtraHeaders`, and the client hints override have no such demand yet.

**Grid follows automatically.** Grid proxies the session, so anything that works locally works
through it. Only the features that need Grid explicitly — uploads to a remote browser and download
retrieval — require testing against it, which makes the file handling record the one with Grid work
attached.

**Subscription mechanics are implementation.** Which subscription form a binding uses, and how it
tracks ids, is how the behavior is achieved rather than the behavior itself. What the records state
is the user-facing part: handlers are added, removed, and cleared independently.

**The compatibility expectation is implicit.** That enabling BiDi does not change an existing API's
behavior underlies all of these records; the only place it currently has anything concrete to say
is the capabilities record, which is where it is stated.

## Loose ends belonging to no record

**Realm events.** `script.realmCreated` and `script.realmDestroyed` are claimed by nothing. The
pending script and logging record should take them or say they are deferred.

**Stale element semantics.** BiDi defines no stale element error — the nearest is "no such node",
for an unknown reference, and the specification carries an open issue on the stale object reference
case — so a classic `StaleElementReferenceException` has no protocol equivalent. It hangs off no
capability, and only bites once elements come from BiDi rather than Classic. It needs an issue;
none has been filed. The capabilities record notes it as adjacent so a reader of that record does
not conclude its gap list is the whole story.

**Handler conventions.** Three records each state how a handler is added, removed, cleared, and
filtered, and whether it can block. Only the blocking answer differs, and only because the protocol
differs. Lifting the rest into one record would shrink all three, at the cost of a dependency
nothing else could be accepted ahead of. Worth deciding on purpose rather than discovering in the
third review.
