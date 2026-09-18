# BiDi decision roadmap

- Status: Draft
- Owner: Selenium Technical Leadership Committee (TLC)

## Purpose

This is a planning document, not a decision. It describes the records that still need to be written
for the BiDi surface of Selenium 5, and — for two questions not yet ready to be records — the
work that has to happen before one can be proposed.

The release charter ([selenium-5.md](selenium-5.md)) carries one line per record. The detail lives
here until the records themselves exist.

Each entry is sized to the scope test in [decisions/README.md](../decisions/README.md): a record
captures one coherent decision, and a sub-choice splits out only when its rationale stands without
the others. Where a boundary between two records is arguable, the entry says which one owns it.

Protocol references are to the WebDriver BiDi specification source (`index.bs` in
[w3c/webdriver-bidi](https://github.com/w3c/webdriver-bidi)); line numbers are from the September
2026 editor's draft and locate the algorithm rather than serving as stable citations.

## Summary

| | Item | Form |
|---|---|---|
| A | Where BiDi cannot express classic behavior | Gap list; two gaps go to record 1, two are issues |
| B | Browsing context and window APIs | Deferred past Selenium 5; switch-then-act stays |
| 1 | Capabilities: timeouts and prompt behavior | Record |
| 2 | Navigation and waits | Record |
| 3 | File handling | Record — the one to cut if the release sheds scope |

Three records. Neither open question adds a fourth, and no BiDi event is exposed as a handler in
5 beyond the navigation lifecycle: every other event family in this plan is deferred, because
each is additive, nothing depends on it, and each raises a placement question that a later record
is better placed to answer.

Each record that adds a family of event handlers settles its own registration — how a handler is
added, removed, and cleared, and what it can be filtered by. Consistency between families is
worth aiming for, but no existing record decides it for them: the network record settles network
request and response handling, including that those handlers can be filtered by window handle or
user context, and nothing more.

---

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
   and notify`, and the classic default cannot be expressed at all. **Owner: record 1** — a
   capability whose behavior the remote end no longer implements the classic way.

2. **Timeouts.** `session.CapabilityRequest` has no `timeouts` member (index.bs:1881) and the only
   occurrences of the word are TODOs proposing one for script evaluation (index.bs:13571, 13757).
   A page load timeout and a script timeout have no protocol equivalent; only the client can bound
   them. **Owner: record 1** for the capability itself; record 2 for what a navigation wait does
   when its deadline expires; the script and logging record for script evaluation if it wants it.

3. **Implicit wait.** `browsingContext.locateNodes` takes a context, locator, node count,
   serialization options, and start nodes (index.bs:4537) — there is no wait, and nothing retries
   in the remote end. Classic's implicit wait is remote-end behavior with no BiDi counterpart.
   **Track as an issue.** Nothing needs to decide this while element location stays on the classic
   path; it becomes a decision the moment locating moves to BiDi.

4. **Stale element semantics.** BiDi defines no stale element error. The closest is "no such node",
   for deserializing an unknown `SharedReference`, and the specification carries an open issue to
   "handle the stale object reference case" (index.bs:12357). A classic
   `StaleElementReferenceException` has no protocol equivalent. **Track as an issue**, same
   condition as implicit wait — it matters when elements come from BiDi rather than classic.

Checked and **not** gaps, so nothing needs to be built for them: window rect and state
(`browser.setClientWindowState` takes `normal` with x, y, width, height, plus fullscreen,
maximized, and minimized — index.bs:3060), page load strategy (the readiness states cover all
three classic values and add one), element screenshots (the screenshot clip), and frames
(addressable directly as contexts).

**What follows from this.** Both expressible gaps are capability behavior, which is what record 1
settles. The other two are conditional on work outside this release and are tracked as issues. No
separate compatibility record is needed; the expectation belongs in the charter as one line.

---

## B. Browsing context and window APIs — deferred

**Resolved: no new context API for Selenium 5.** The explicit switch-then-act model stays. New
APIs identify a context by window handle, as they do today, and nothing in the records below needs
a context object.

The two cases that would have justified one — acting on a background tab without switching to it,
and addressing frames without `switchTo().frame()` — both require commands rather than handlers to
take a context, which changes how every command targets a document. That is a record of its own,
proposed on its own schedule after 5.

**The window events defer with it.** Knowing when a new window opens is the one case that looked
cheap enough to carry forward on its own, and it is not: every home for it either extends a shape
we do not want to extend or forces the decision being deferred. `manage.window` is a stateless
facade over the current window, so session-wide events do not belong on it; a new window manager
competes with that facade and has to absorb it to avoid two window objects; and putting `activate`,
`close`, or `switch_to` on a window value turns it into the context object above. When a small
feature cannot find a home without forcing a larger decision, the larger decision comes first.

Nothing is lost by waiting. Waiting for a window works today by polling handles
(`ExpectedConditions.numberOfWindowsToBe`,
`expected_conditions.new_window_is_opened`), no record below depends on the events, and the
genuinely new capabilities — opening a tab in the background, activating a window, reading
OS-level client windows, setting a viewport independently of window size — are one coherent
surface that deserves designing at once rather than accreting around an events-only object.

**What the issue should capture**, so this is not re-derived later:

- A context id is a window handle: for a navigable with an associated window handle, "the navigable
  id must be the same as the window handle" (index.bs:3462). No mapping, no new type.
- `browsingContext.Info` carries `parent` (index.bs:3494), set for child navigables, so windows are
  distinguishable from frames by filtering it.
- `contextCreated` defines remote end subscribe steps (index.bs:5841): subscribing replays it for
  existing contexts, and those emissions land before `session.subscribe` returns (index.bs:2332).
  Everything after the subscribe response is new. A binding that ignores that boundary reports every
  open window as new.
- The event carries `originalOpener`, `url`, `userContext`, and `clientWindow` — none of which
  polling handles can reconstruct, which is the reason to expose the event rather than a waiter.
- Handlers and the current-window facade are different scopes, and the placement question above is
  the first thing the eventual record has to settle.

Existing BiDi surface in the bindings is not evidence of a decision here. Several bindings shipped
methods ahead of any accepted record, and some of those will be removed; a record that wants to
cite current behavior should cite the classic API, not the BiDi-era additions.

---

## 1. Capabilities: timeouts and prompt behavior

**Decision.** How `timeouts` and `unhandledPromptBehavior` are expressed and honored now that the
remote end no longer enforces either the classic way.

**Why a record.** These are two instances of one problem, which is what makes them one record. Both
are classic capabilities; both describe behavior the remote end used to guarantee; and under BiDi
one has no protocol expression at all and the other is applied at a different moment with a smaller
set of values. In both cases the binding either reproduces the classic behavior locally or the user
sees a difference, and the decision is the same shape twice: what the capability accepts, what it
now means, and how much local machinery its classic meaning is worth.

**In scope — prompt behavior**

- The capability shape: a single value or a per-type map, and what the bindings accept.
- The local behavior that preserves the classic contract: holding the prompt open, applying the
  configured behavior at the next command, and synthesizing the unexpected-alert error for the
  notify variants BiDi does not define.
- What happens to `switchTo().alert()` and the `Alert` type.
- The `file` key: that the capability accepts it and what it means. Nothing consumes file dialog
  events in 5, so this is about parsing and behavior, not about handlers.

**In scope — timeouts**

- Whether `timeouts` remains the surface when the value is enforced by the client rather than the
  remote end, and whether that is stated to users.
- Which of the three classic timeouts still mean anything on a BiDi path: page load (record 2 uses
  it), script (the script and logging record, if it wants it), implicit (gap A3 — nothing to
  decide while element location stays classic).
- What error a client-enforced timeout raises, and whether it matches the classic one.
- Whether a timeout set through the capability and a timeout passed to a call can disagree.

**Not in scope**

- What a navigation wait does when its deadline expires — record 2 owns the behavior, this record
  owns where the number comes from.
- A high-level prompts module — the charter's deferred capability mapping.
- `userPromptOpened` and `userPromptClosed` handlers. They are only useful under `ignore`, nothing
  depends on them, and exposing them raises the same placement question as the window events — see
  B. Deferred.
- Setting capabilities per user context. `browser.createUserContext` takes `acceptInsecureCerts`,
  `proxy`, and `unhandledPromptBehavior` (index.bs:2825), but user contexts are deferred with the
  context API, so capabilities stay session-level in 5 and the record does not have to define what
  a session containing differently-configured contexts means.

**Protocol constraints**

- The prompt handler is applied when the prompt opens: the "user prompt opened" steps return it to
  the browser (index.bs:6516). There is no next-command moment in the protocol.
- Only `accept`, `dismiss`, `ignore` exist (index.bs:2003). The specification contains no notify
  variants, so classic's `dismiss and notify`, `accept and notify`, and the classic default are
  inexpressible.
- `ignore` is special-cased to "none" (index.bs:6514) — the prompt stays open. It is the only mode
  in which the events and `browsingContext.handleUserPrompt` are useful.
- Per-user-context prompt overrides are consulted before the session handler (index.bs:6463) —
  reachable only through a deferred API, so nothing in 5 sets them.
- File dialogs invert the default: the dialog opens unless configured otherwise, and any value
  other than `ignore` dismisses it (index.bs:15356, 15406).
- `session.CapabilityRequest` has no `timeouts` member (index.bs:1881); the only occurrences of the
  word in the specification are TODOs proposing one for script evaluation (index.bs:13571, 13757).

**Current state.** .NET models the prompt capability as uniform-or-per-type
(`dotnet/src/webdriver/UserPromptHandler.cs`); Java carries it as a string constant
(`java/src/org/openqa/selenium/remote/CapabilityType.java:32`); Python exposes a descriptor over
the raw value (`py/selenium/webdriver/common/options.py:265`). Client-side deadlines exist ad hoc
at the transport layer — Java's BiDi layer carries a `Duration` per send
(`java/src/org/openqa/selenium/bidi/BiDi.java:48`) — which is a websocket deadline, not a session
timeout, and the record should be explicit that they are different things.

**Open questions**

- How much local machinery is the classic prompt contract worth? Holding every prompt open to
  reapply the classic behavior later is a real change under the hood, and a crash leaves a prompt
  open that classic would have dismissed.
- Does the per-type prompt map get exposed in 5, or does the capability stay a single value? The
  bindings already disagree, so this one is alignment rather than new surface.
- Does a client-enforced timeout keep the classic error, or does a different failure mode deserve a
  different error?

**Depends on.** Nothing. Gaps A1 and A2 are its evidence.

---

## 2. Navigation and waits

**Decision.** The cross-binding API for navigation lifecycle handlers, and what a navigation wait
does now that the client enforces it.

**Why a record.** The events and the waits are one design: a reader who has the handlers but not
the wait behavior does not know when a handler fires relative to the command returning. BiDi
defines no timeouts, so the client enforces every wait it offers — a change in where the
responsibility lives, not just in how a wait is expressed.

**In scope**

- Handlers for the navigation-shaped events: `navigationStarted`, `navigationCommitted`,
  `fragmentNavigated`, `navigationAborted`, `navigationFailed`, `domContentLoaded`, `load`.
- The statement that `historyUpdated` is a URL-change signal and not a navigation, so that
  whenever it is exposed it cannot satisfy a navigation wait or fire a navigation-complete
  handler. Exposing it is deferred; ruling it out of the navigation contract is not.
- What a navigation wait does when its client-side deadline expires. The navigation keeps running
  in the browser; classic left the remote end in a known state. The record says what the session
  looks like afterwards and whether anything is cancelled. Where the deadline comes from is record
  1.
- `pageLoadStrategy` and readiness: whether the capability remains how a user expresses readiness.
  Making `committed` reachable is additive and defers with the rest.
- The correlation contract: events from one navigation share a navigation id, and that id may be
  absent.
- The terminating cases: same-document navigation never produces a load; a navigation that becomes
  a download ends the wait (this record owns that rule, record 3 owns what happens next).

**Not in scope**

- Window and context APIs of any kind, including the `contextCreated` and `contextDestroyed`
  events — deferred, see B.
- Exposing `historyUpdated` as a handler, and reaching the `committed` readiness state. Both are
  additive, nothing depends on either, and neither has a classic behavior to preserve.
- Implicit wait and element location (gap A3), and script timeout, for the reasons in A.

**Protocol constraints**

- `domContentLoaded` and `load` carry `browsingContext.NavigationInfo`, the same params type as the
  navigation events, and are triggered from the same navigation status struct (index.bs:3737).
- Readiness maps to those events directly: `committed` → `navigationCommitted`, `interactive` →
  `domContentLoaded`, `complete` → `load` (index.bs:3628). That makes classic's `pageLoadStrategy`
  a near-mapping — `normal`/`eager`/`none` against four readiness states, with `committed` having
  no classic equivalent.
- Nothing bounds a `browsingContext.navigate` that never completes except the client; see gap A2.
- `navigation` is nullable (index.bs:3739): null when a navigation is canceled before making
  progress.
- `historyUpdated` carries only `context`, `timestamp`, `url` (index.bs:5997).
- `downloadWillBegin` resumes a pending navigate (index.bs:6166).

**Current state.** No binding exposes navigation handlers as supported API. Client-side deadlines
exist ad hoc at the transport layer — Java's BiDi layer carries a `Duration` per send
(`java/src/org/openqa/selenium/bidi/BiDi.java:48`) — which is a websocket deadline, not a
navigation wait, and the record should be explicit that they are different things.

**Open questions**

- One timeout surface for both protocols, or separate ones? That is record 1's call; this record
  should state what it needs.
- Does a client-side timeout attempt to stop the navigation, or only stop waiting?
- What are the threading guarantees for a handler? Whether a user may issue a WebDriver command
  from inside one applies to every handler family, and this is the first record that has to say
  so.

**Depends on.** Record 1 for where a deadline comes from. Not blocked by B.

---

## 3. File handling

**Decision.** An element-scoped upload method with a deprecation path for the current mechanism,
and what becomes of the download retrieval API.

**Why a record.** Not because BiDi breaks anything — uploads and downloads work today and keep
working. Because the bindings diverge, the deprecation clock is two releases long, and 5 is the
alignment release: uploads are a `sendKeys` overload plus a detector that guesses whether a string
is a path, and downloads are a Grid-only API that only some bindings expose. Both are alignment
work that `input.setFiles` and the download commands now make possible.

**This record is the most deferrable of the three.** Nothing in it is forced by BiDi; the case for
doing it in 5 is the deprecation timeline and cross-binding consistency, not compatibility. If the
release needs to shed scope, this is what goes.

**In scope**

- An element-scoped upload method over `input.setFiles`, and the deprecation path for passing
  paths to `sendKeys` and for the file detector types.
- How uploads reach a remote browser, and what replaces the file detector's role there.
- Download behavior configuration, and its relationship to the browser options users set today.
- The existing `HasDownloads` surface (`getDownloadableFiles`, `downloadFile`,
  `deleteDownloadableFiles`, gated on `se:downloadsEnabled`): what it becomes when the protocol
  reports a completed download's path directly, and whether local and Grid sessions converge.

**Not in scope**

- **Handlers for file dialogs and downloads, and the `driver.file` namespace that would hold
  them.** Deferred. They are additive, nothing depends on them, and the protocol makes them the
  weakest handlers in the plan: neither event can be blocked on, and an upload handler cannot act
  at all when the event carries no element. That is a design worth getting right later rather than
  shipping as the one handler family that behaves unlike the others.
- Whether a file dialog is allowed to open — the `file` capability key, owned by record 1.
- The rule that a navigation becoming a download ends the navigation wait — stated by record 2.

**Protocol constraints**

- `input.setFiles` requires an element (index.bs:15251), so an element-scoped method is the shape
  the protocol supports directly.
- The completed download's path comes from the navigation status (index.bs:3273) and is a path on
  the machine running the browser — the distinction `se:downloadsEnabled` exists to paper over.
- For the deferred handlers, the constraints that make them awkward, recorded so they are not
  rediscovered: neither `input.fileDialogOpened` nor `browsingContext.downloadWillBegin` waits for
  a client response (index.bs:15338 onward, 6166) — of the BiDi events only the network ones
  define blocking interception — and `fileDialogOpened` carries an element only when there is one
  (index.bs:15338), which a `showOpenFilePicker()` call has not.

**Current state.** `LocalFileDetector` is Python's default
(`py/selenium/webdriver/remote/webdriver.py:291`), Java exposes `setFileDetector` on
`RemoteWebDriver`. Downloads are Grid-oriented and capability-gated
(`java/src/org/openqa/selenium/HasDownloads.java`).

**Open questions**

- Does the remote upload path (`POST /session/{id}/file`) stay as it is, with the new method only
  changing the local API?
- Does `se:downloadsEnabled` remain the switch once BiDi can configure download behavior directly?
- Is the deprecation clock reason enough to do this in 5 at all?

**Depends on.** Nothing.

---

## Records already indexed

**Script and logging async/event API** — pinned scripts and the console-message,
JavaScript-error, and DOM-mutation handlers. One gap to close while it is written:
`script.realmCreated` and `script.realmDestroyed` are claimed by nothing here. The record should
take them or say they are deferred. Script timeout has the same no-timeout problem as navigation
(index.bs:13571) and is a candidate for the same treatment.

**Selenium Manager released API** — unrelated to the BiDi surface.

## Event coverage

Where each subscribable event lands once these records exist. The core specification defines 24
events; three more come from extension specifications.

| Events | Record |
|---|---|
| `network.beforeRequestSent`, `responseStarted`, `responseCompleted`, `fetchError`, `authRequired` | [17685](../decisions/17685-network-handler-behavior.md), accepted |
| `log.entryAdded`, `script.message` | Script and logging |
| `script.realmCreated`, `realmDestroyed` | Script and logging, if it claims them |
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load` | Navigation and waits (2) |
| `browsingContext.historyUpdated` | Deferred; record 2 only rules it out of the navigation contract |
| `browsingContext.userPromptOpened`, `userPromptClosed` | Deferred; capabilities (1) covers the behavior, not the events |
| `input.fileDialogOpened`, `browsingContext.downloadWillBegin`, `downloadEnd` | Deferred; the file record covers the commands, not the events |
| `browsingContext.contextCreated`, `contextDestroyed` | Deferred with the window and context APIs — see B |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |
