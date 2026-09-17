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
| A | Where BiDi cannot express classic behavior | Gap list; each gap goes to the record that owns the behavior |
| B | Browsing context representation | Two cheap use cases for 5; the object model defers past it |
| 1 | Navigation, waits, and timeouts | Record |
| 2 | Prompt handling | Record |
| 3 | File handling | Record |

Three records, two pieces of work that decide whether there is a fourth and fifth.

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
   and notify`, and the classic default cannot be expressed at all. **Owner: record 2**, which is
   why that record is about behavior rather than capability mapping.

2. **Timeouts.** `session.CapabilityRequest` has no `timeouts` member (index.bs:1881) and the only
   occurrences of the word are TODOs proposing one for script evaluation (index.bs:13571, 13757).
   A page load timeout and a script timeout have no protocol equivalent; only the client can bound
   them. **Owner: record 1** for the navigation case, and the script and logging record for script
   evaluation if it wants it.

3. **Implicit wait.** `browsingContext.locateNodes` takes a context, locator, node count,
   serialization options, and start nodes (index.bs:4537) — there is no wait, and nothing retries
   in the remote end. Classic's implicit wait is remote-end behavior with no BiDi counterpart.
   **Owner: nobody yet**, and it does not need one while element location stays on the classic
   path. It becomes urgent the moment locating moves to BiDi.

4. **Stale element semantics.** BiDi defines no stale element error. The closest is "no such node",
   for deserializing an unknown `SharedReference`, and the specification carries an open issue to
   "handle the stale object reference case" (index.bs:12357). A classic
   `StaleElementReferenceException` has no protocol equivalent. **Owner: nobody yet**, same
   condition as implicit wait — it matters when elements come from BiDi rather than classic.

Checked and **not** gaps, so nothing needs to be built for them: window rect and state
(`browser.setClientWindowState` takes `normal` with x, y, width, height, plus fullscreen,
maximized, and minimized — index.bs:3060), page load strategy (the readiness states cover all
three classic values and add one), element screenshots (the screenshot clip), and frames
(addressable directly as contexts).

**What follows from this.** Two gaps already have a record. Two are conditional on work that is
not in this release. That is not enough to justify a compatibility record of its own — the rule
belongs in the charter as a stated expectation, and each gap is handled by the record that owns
the behavior.

---

## B. Browsing context representation — which use case would justify a new API

A new API needs a record; the question is whether any use case is important enough to need the API
before Selenium 5. Five candidates, with what each would cost.

1. **Filtering a handler to a tab that is not the active one.** Window handles already serve this
   where a handler family offers the filter — network handlers do. Any new family decides the same
   question for itself; neither needs a context type to do it. No new API.

2. **Waiting for a new tab or popup to appear.** Today users diff the window handle set in a poll
   loop. `browsingContext.contextCreated` replaces that with an event. This needs a handler, not
   an object model. Cheapest real improvement on this list.

3. **A supported user context type.** Python already exposes
   `driver.browser.create_user_context()` (`py/selenium/webdriver/remote/webdriver.py:1260`), so
   the concept is public in at least one binding. The open part is whether every binding gets the
   same type, and whether it is more than an identifier.

4. **Acting on a background tab without switching to it.** Not served, and the first use case that
   genuinely needs an object model: commands, not just handlers, would have to take a context.
   Large, and it changes how every command targets a document.

5. **Addressing frames without `switchTo().frame()`.** Same shape as 4 and larger. BiDi addresses
   frames as contexts, so the protocol allows it; the cost is on our side.

**Recommendation.** 2 and 3 are worth doing for 5 and neither requires an object model — 2 is an
event handler, 3 is an identifier that already half exists. 4 and 5 are the object model, and they
should be one record proposed on their own schedule, after 5. If the TLC wants 4 or 5 in the
release, that decision should be made before records 1 and 3 are written, because they would then
name a context object in their scoping arguments rather than a handle.

If 2 is adopted, `browsingContext.contextCreated` and `contextDestroyed` need an owner: either a
small record of their own or an addition to record 1, since "a navigation opened a new tab" is
adjacent to the navigation story.

---

## 1. Navigation, waits, and timeouts

**Decision.** The cross-binding API for navigation lifecycle handlers, and the waiting behavior
that goes with navigation now that the remote end no longer enforces it.

**Why a record.** The events and the waits are one design. BiDi defines no timeouts, so every wait
Selenium offers over it is enforced by the client — a change in where the responsibility lives,
not just in how a wait is expressed. A record that settled the handlers and left the waits
unstated would leave the harder half undone.

**In scope**

- Handlers for the navigation-shaped events: `navigationStarted`, `navigationCommitted`,
  `fragmentNavigated`, `navigationAborted`, `navigationFailed`, `domContentLoaded`, `load`.
- `historyUpdated`, with the explicit statement that it is a URL-change signal and not a
  navigation: no navigation id, no completion of a pending wait, no firing of a
  navigation-complete handler.
- **Who enforces the wait.** BiDi has no timeouts, so a client-side deadline is the only kind
  available. The record settles where a user sets it, whether it is the same surface as the classic
  `timeouts` capability, and what error is raised when it expires.
- **What happens after a client-side timeout.** The navigation keeps running in the browser; the
  classic equivalent left the remote end in a known state. The record has to say what the session
  looks like afterwards and whether anything is cancelled.
- `pageLoadStrategy` and readiness: whether the capability remains how a user expresses readiness,
  and whether `committed` becomes reachable.
- The correlation contract: events from one navigation share a navigation id, and that id may be
  absent.
- The terminating cases: same-document navigation never produces a load; a navigation that becomes
  a download ends the wait (this record owns that rule, record 3 owns what happens next).

**Not in scope**

- One-shot waiters (`expect_*`), deferred by the charter as a convenience layer.
- Implicit wait and element location. Classic retries locating in the remote end and BiDi's
  `browsingContext.locateNodes` does not, so it is the same class of problem — but locating over
  BiDi is not otherwise in this release, and the record should say so rather than absorb it.
- Script timeout, for the same reason, unless the script and logging record wants it.

**Protocol constraints**

- `domContentLoaded` and `load` carry `browsingContext.NavigationInfo`, the same params type as the
  navigation events, and are triggered from the same navigation status struct (index.bs:3737).
- Readiness maps to those events directly: `committed` → `navigationCommitted`, `interactive` →
  `domContentLoaded`, `complete` → `load` (index.bs:3628). That makes classic's `pageLoadStrategy`
  a near-mapping — `normal`/`eager`/`none` against four readiness states, with `committed` having
  no classic equivalent.
- **The specification defines no timeouts.** `session.CapabilityRequest` has no `timeouts` member
  (index.bs:1881), and the only occurrences of the word are TODOs proposing one for script
  evaluation (index.bs:13571, 13757). Nothing bounds a `browsingContext.navigate` that never
  completes except the client.
- `navigation` is nullable (index.bs:3739): null when a navigation is canceled before making
  progress.
- `historyUpdated` carries only `context`, `timestamp`, `url` (index.bs:5997).
- `downloadWillBegin` resumes a pending navigate (index.bs:6166).

**Current state.** No binding exposes navigation handlers as supported API. Client-side timeouts
already exist ad hoc at the transport layer — Java's BiDi layer carries a `Duration` per send
(`java/src/org/openqa/selenium/bidi/BiDi.java:48`) — which is a websocket deadline, not a
navigation wait, and the record should be explicit that they are different things.

**Open questions**

- One timeout surface for both protocols, or separate ones? Users have one mental model today and
  reusing `timeouts` is tempting, but it is a classic capability configuring client-side behavior.
- Does a client-side timeout attempt to stop the navigation, or only stop waiting?
- Is `historyUpdated` exposed in 5, or noted and deferred? It has no classic analogue.

**Depends on.** Nothing blocking. Gap 2 in section A is the evidence for its waits and timeouts
decisions.

---

## 2. Prompt handling

**Decision.** How `unhandledPromptBehavior` is expressed and honored now that BiDi applies the
handler when the prompt opens, and what keeps the existing alert API working.

**Why a record.** This is not a capability rename. The classic capability describes what happens to
a prompt still open when the next command arrives; the BiDi handler is consulted when the prompt
opens and decides whether it opens at all. Preserving the classic contract means holding protocol
state locally, which is behavior rather than mapping.

**In scope**

- The capability shape: a single value or a per-type map, what the bindings accept, and that it can
  be set per user context.
- The local behavior that preserves the classic contract: holding the prompt open, applying the
  configured behavior at the next command, and synthesizing the unexpected-alert error for the
  notify variants BiDi does not define.
- What happens to `switchTo().alert()` and the `Alert` type.
- Whether `userPromptOpened` and `userPromptClosed` are exposed as handlers in 5.
- The `file` key: whether a file dialog is allowed to open at all. The dialog *handler* belongs to
  record 3; the capability that decides whether there is a dialog to handle belongs here, and the
  two records have to agree on what happens when a user registers an upload handler while `file` is
  configured to dismiss.

**Not in scope**

- A high-level prompts module — the charter's deferred capability mapping.
- Setting files on an element, and handlers for file dialogs — record 3.

**Protocol constraints**

- The handler is applied when the prompt opens: the "user prompt opened" steps return it to the
  browser (index.bs:6516). There is no next-command moment in the protocol.
- Only `accept`, `dismiss`, `ignore` exist (index.bs:2003). The specification contains no notify
  variants, so classic's `dismiss and notify`, `accept and notify`, and the classic default are
  inexpressible.
- `ignore` is special-cased to "none" (index.bs:6514) — the prompt stays open. It is the only mode
  in which the events and `browsingContext.handleUserPrompt` are useful.
- Per-user-context overrides are consulted before the session handler (index.bs:6463).
- File dialogs invert the default: the dialog opens unless configured otherwise, and any value
  other than `ignore` dismisses it (index.bs:15356, 15406).

**Current state.** .NET models the capability as uniform-or-per-type
(`dotnet/src/webdriver/UserPromptHandler.cs`); Java carries it as a string constant
(`java/src/org/openqa/selenium/remote/CapabilityType.java:32`); Python exposes a descriptor over
the raw value (`py/selenium/webdriver/common/options.py:265`).

**Open questions**

- How much local machinery is the classic contract worth? Holding every prompt open to reapply the
  classic behavior later is a real change under the hood, and a crash leaves a prompt open that
  classic would have dismissed.
- Does the per-type map get exposed in 5, or does the capability stay a single value?

**Depends on.** The inventory (A), item 1 — what drivers actually do today decides how much of
this is Selenium's problem.

---

## 3. File handling

**Decision.** A `driver.file` namespace covering both directions: handlers for file dialogs and for
downloads, an element-scoped upload method, and what becomes of the download retrieval API.

**Why a record.** Uploads and downloads are one namespace and one event story for the user — files
moving between the machine running the test and the machine running the browser — and the same
handler pattern serves both: `add_upload_handler`, `add_download_handler`, each with a remove and
a clear. Splitting them would put the same pattern decision in two records.

**In scope**

- The namespace and the handler pattern: `driver.file.add_upload_handler`,
  `add_download_handler`, and the remove/clear pairs, over `input.fileDialogOpened`,
  `browsingContext.downloadWillBegin`, and `browsingContext.downloadEnd`.
- **That these handlers observe rather than intercept.** Network handlers block by design; these
  cannot — see the constraints below. The record has to say so plainly, because the shared pattern
  invites the assumption that they behave the same way.
- An element-scoped upload method over `input.setFiles`, and the deprecation path for passing paths
  to `sendKeys` and for the file detector types.
- Download behavior configuration, and its relationship to the browser options users set today.
- The existing `HasDownloads` surface (`getDownloadableFiles`, `downloadFile`,
  `deleteDownloadableFiles`, gated on `se:downloadsEnabled`): what it becomes when the protocol
  reports a completed download's path directly, and whether local and Grid sessions converge.
- What an upload handler can do when the event carries no element.

**Not in scope**

- Whether a file dialog is allowed to open — the `file` key in the prompt handler, owned by record
  2. This record owns what happens to a dialog that does open.
- The rule that a navigation becoming a download ends the navigation wait — stated by record 1.

**Protocol constraints**

- **Neither event can be blocked on.** The file dialog steps emit the event, then compute whether
  to dismiss from the session's prompt handler, and return — nothing waits for a client response
  (index.bs:15338 onward). `downloadWillBegin` likewise emits and returns the configured download
  behavior (index.bs:6166). Of the BiDi events, only the network ones define blocking
  interception.
- `input.setFiles` requires an element (index.bs:15251); `input.fileDialogOpened` carries one only
  when there is one (index.bs:15338) — a `showOpenFilePicker()` call has none. An upload handler
  therefore cannot always fulfill the dialog it observes.
- `downloadWillBegin` and `downloadEnd` extend `BaseNavigationInfo` (index.bs:6127), so a download
  carries the navigation id that produced it, plus a download id and suggested filename.
- The completed download's path comes from the navigation status (index.bs:3273) and is a path on
  the machine running the browser — the distinction `se:downloadsEnabled` exists to paper over.

**Current state.** Uploads work by overloading `sendKeys` with a path and by a file detector that
guesses whether a string is one — `LocalFileDetector` is Python's default
(`py/selenium/webdriver/remote/webdriver.py:291`), Java exposes `setFileDetector` on
`RemoteWebDriver`. Downloads are Grid-oriented and capability-gated
(`java/src/org/openqa/selenium/HasDownloads.java`). No binding exposes either event.

**Open questions**

- Is an upload handler worth having given it cannot block and cannot always act? An observational
  handler that sometimes lets a user call `setFiles` in time may be worse than no handler.
- Does the remote upload path (`POST /session/{id}/file`) stay as it is, with the new method only
  changing the local API?
- Does `se:downloadsEnabled` remain the switch once BiDi can configure download behavior directly?

**Depends on.** Nothing blocking. Coordinates with record 2 on the `file` capability key.

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
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load`, `historyUpdated` | Navigation (1) |
| `browsingContext.userPromptOpened`, `userPromptClosed` | Prompt handling (2) |
| `input.fileDialogOpened`, `browsingContext.downloadWillBegin`, `downloadEnd` | File handling (3) |
| `browsingContext.contextCreated`, `contextDestroyed` | Open — see B; deferred with the browser context API |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |
