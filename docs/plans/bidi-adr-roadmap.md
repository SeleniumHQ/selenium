# BiDi decision roadmap

- Status: Draft
- Owner: Selenium Technical Leadership Committee (TLC)

## Purpose

This is a planning document, not a decision. It indexes the BiDi decision records drafted so far,
sizes each one, and records the protocol gaps they answer.

The decisions live in the records themselves; this document exists so the set can be read whole.
Writing a record does not put it in a release: what a given release carries is decided separately,
with the end state visible, and the charter ([selenium-5.md](selenium-5.md)) picks up whichever
records are scoped into Selenium 5.

Protocol references are to the WebDriver BiDi specification source (`index.bs` in
[w3c/webdriver-bidi](https://github.com/w3c/webdriver-bidi)); line numbers are from the September
2026 editor's draft and locate the algorithm rather than serving as stable citations.

## The records

All four are drafted. Being drafted says nothing about which release carries them — the point is
to see the end state whole and size each one before that question is answered.

| Record | Settles | Size |
|---|---|---|
| [Capabilities: timeouts and prompt behavior](../decisions/capabilities-timeouts-and-prompt-behavior.md) | `unhandledPromptBehavior` and `timeouts` keep their classic meaning; the binding enforces both | Large |
| [Navigation and waits](../decisions/navigation-and-waits.md) | Navigation events as handlers; client-enforced page load timeout; readiness per call | Medium |
| [File handling](../decisions/file-handling.md) | A `driver.file` namespace, an element upload method, download retrieval, dialog and download handlers | Large |
| [Browsing contexts and windows](../decisions/browsing-contexts-and-windows.md) | A windows namespace, window values, client windows, viewport, window events; switching stays explicit | Extra large |

The drafts state decisions rather than options, so they can be argued with. Every one of them is a
position to revise in review, not a conclusion already reached.

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
entanglement is the deadline, which record 1 owns and this record consumes.

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

## One thing worth deciding before the records are argued

Three of the four define handler conventions of their own — how a handler is registered, removed,
and cleared, what it can be filtered by, whether it can block, and what thread it runs on. Only the
blocking answer differs between them, and only because the protocol differs. Three records
answering the same four questions is three chances to answer them differently, and the drafts
already say so in their own consequences.

Lifting those conventions into one short record would shrink all three and remove that risk. It
would also add a dependency: nothing else could be accepted until it was. Worth deciding on
purpose rather than discovering in the third review.

## A. Where BiDi cannot express classic behavior

Testing the bindings with the websocket on and off is already planned and is not this. The question
here is narrower and answerable from the specifications: which classic behaviors can a remote end
*not* reproduce over BiDi, however well it is implemented? Those are the places where a binding has
to build the behavior locally or accept a difference, and each one needs an owner.

The list is short, and each entry below is confirmed against the specification rather than
suspected.

1. **Prompt handling — the notify variants and the timing.** BiDi applies the handler when the
   prompt opens (index.bs:6516) and offers only `accept`, `dismiss`, `ignore` (index.bs:2003). The
   word "notify" does not appear in the specification, so classic's `dismiss and notify`, `accept
   and notify`, and the classic default cannot be expressed at all. **Owner: the capabilities record** — a
   capability whose behavior the remote end no longer implements the classic way.

2. **Timeouts.** `session.CapabilityRequest` has no `timeouts` member (index.bs:1881) and the only
   occurrences of the word are TODOs proposing one for script evaluation (index.bs:13571, 13757).
   A page load timeout and a script timeout have no protocol equivalent; only the client can bound
   them. **Owner: the capabilities record** for the capability itself; the navigation record for
   what a wait does when its deadline expires; the script and logging record for script
   evaluation if it wants it.

3. **Implicit wait.** `browsingContext.locateNodes` takes a context, locator, node count,
   serialization options, and start nodes (index.bs:4537) — there is no wait, and nothing retries
   in the remote end. Classic's implicit wait is remote-end behavior with no BiDi counterpart.
   **Owner: the capabilities record**, which covers all three classic timeouts: implicit wait keeps
   its meaning, stays remote-enforced while element location is classic, and becomes the binding's
   to enforce if location moves to BiDi.

4. **Stale element semantics.** BiDi defines no stale element error. The closest is "no such node",
   for deserializing an unknown `SharedReference`, and the specification carries an open issue to
   "handle the stale object reference case" (index.bs:12357). A classic
   `StaleElementReferenceException` has no protocol equivalent. **Its own decision**, tracked as an
   issue rather than folded into a record here: unlike the timeouts, there is no classic capability
   it hangs off, and it only matters once elements come from BiDi rather than classic. The
   capabilities record notes it as adjacent.

Checked and **not** gaps, so nothing needs to be built for them: window rect and state
(`browser.setClientWindowState` takes `normal` with x, y, width, height, plus fullscreen,
maximized, and minimized — index.bs:3060), page load strategy (the readiness states cover all
three classic values and add one), element screenshots (the screenshot clip), and frames
(addressable directly as contexts).

**What follows from this.** Three of the four are capability behavior, which the capabilities
record settles. Stale element semantics is the exception and is tracked as its own issue. No
separate compatibility record is needed.

---

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

## Records already indexed

**Script and logging async/event API** — pinned scripts and the console-message,
JavaScript-error, and DOM-mutation handlers. One gap to close while it is written:
`script.realmCreated` and `script.realmDestroyed` are claimed by nothing here. The record should
take them or say they are deferred. Script timeout has the same no-timeout problem as navigation
(index.bs:13571) and is a candidate for the same treatment.

**Selenium Manager released API** — unrelated to the BiDi surface.

## Event coverage

Where each subscribable event lands if all four records are accepted as drafted. The core
specification defines 24 events; three more come from extension specifications.

| Events | Record |
|---|---|
| `network.beforeRequestSent`, `responseStarted`, `responseCompleted`, `fetchError`, `authRequired` | [17685](../decisions/17685-network-handler-behavior.md), accepted |
| `log.entryAdded`, `script.message` | Script and logging |
| `script.realmCreated`, `realmDestroyed` | Script and logging, if it claims them |
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load` | Navigation and waits |
| `browsingContext.historyUpdated` | Navigation and waits — exposed, and ruled out of the navigation contract |
| `browsingContext.userPromptOpened`, `userPromptClosed` | Capabilities |
| `input.fileDialogOpened`, `browsingContext.downloadWillBegin`, `downloadEnd` | File handling |
| `browsingContext.contextCreated`, `contextDestroyed` | Browsing contexts and windows |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |
