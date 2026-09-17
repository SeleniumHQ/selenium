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
| B | Browsing context representation | Deferred past Selenium 5; switch-then-act stays |
| 1 | Capabilities: timeouts and prompt behavior | Record |
| 2 | Navigation and waits | Record |
| 3 | File handling | Record |

Three records. Neither open question adds a fourth.

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

## B. Browsing context representation — deferred

**Resolved: no new context API for Selenium 5.** The explicit switch-then-act model stays. New
APIs identify a context by window handle, as they do today, and nothing in the records below needs
a context object.

The two cases that would have justified one — acting on a background tab without switching to it,
and addressing frames without `switchTo().frame()` — both require commands rather than handlers to
take a context, which changes how every command targets a document. That is a record of its own,
proposed on its own schedule after 5.

One use case survives the deferral without needing any of that: **knowing when a new window
opens**. Today that is a poll over the window handle set; `browsingContext.contextCreated` makes
it an event that also says who opened the window and where it went. It yields a window handle,
needs no new type, and leaves switch-then-act intact, so record 2 picks it up — see the design
there.

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

- The capability shape: a single value or a per-type map, what the bindings accept, and that it can
  be set per user context.
- The local behavior that preserves the classic contract: holding the prompt open, applying the
  configured behavior at the next command, and synthesizing the unexpected-alert error for the
  notify variants BiDi does not define.
- What happens to `switchTo().alert()` and the `Alert` type.
- Whether `userPromptOpened` and `userPromptClosed` are exposed as handlers in 5.
- The `file` key: whether a file dialog is allowed to open at all. The dialog *handler* belongs to
  record 3; the capability that decides whether there is a dialog to handle belongs here, and the
  two records have to agree on what happens when a user registers an upload handler while `file`
  is configured to dismiss.

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
- Per-user-context capabilities in general. `browser.createUserContext` also takes
  `acceptInsecureCerts` and `proxy` (index.bs:2825); if the record needs a rule for those it should
  say so, but the two capabilities above are what force the decision.

**Protocol constraints**

- The prompt handler is applied when the prompt opens: the "user prompt opened" steps return it to
  the browser (index.bs:6516). There is no next-command moment in the protocol.
- Only `accept`, `dismiss`, `ignore` exist (index.bs:2003). The specification contains no notify
  variants, so classic's `dismiss and notify`, `accept and notify`, and the classic default are
  inexpressible.
- `ignore` is special-cased to "none" (index.bs:6514) — the prompt stays open. It is the only mode
  in which the events and `browsingContext.handleUserPrompt` are useful.
- Per-user-context prompt overrides are consulted before the session handler (index.bs:6463).
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
- Does the per-type prompt map get exposed in 5, or does the capability stay a single value?
- Does a client-enforced timeout keep the classic error, or does a different failure mode deserve a
  different error?

**Depends on.** Nothing. Gaps A1 and A2 are its evidence.

---

## 2. Navigation and waits

**Decision.** The cross-binding API for navigation lifecycle handlers, what a navigation wait does
now that the client enforces it, and how new windows are surfaced.

**Why a record.** The events and the waits are one design: a reader who has the handlers but not
the wait behavior does not know when a handler fires relative to the command returning. New
windows belong here rather than in a record of their own because they are the same mechanism — an
event surfaced as a handler — and because this record has to settle the handler conventions
anyway.

**In scope**

- Handlers for the navigation-shaped events: `navigationStarted`, `navigationCommitted`,
  `fragmentNavigated`, `navigationAborted`, `navigationFailed`, `domContentLoaded`, `load`.
- `historyUpdated`, with the explicit statement that it is a URL-change signal and not a
  navigation: no navigation id, no completion of a pending wait, no firing of a
  navigation-complete handler.
- What a navigation wait does when its client-side deadline expires. The navigation keeps running
  in the browser; classic left the remote end in a known state. The record says what the session
  looks like afterwards and whether anything is cancelled. Where the deadline comes from is record
  1.
- `pageLoadStrategy` and readiness: whether the capability remains how a user expresses readiness,
  and whether `committed` becomes reachable.
- The correlation contract: events from one navigation share a navigation id, and that id may be
  absent.
- The terminating cases: same-document navigation never produces a load; a navigation that becomes
  a download ends the wait (this record owns that rule, record 3 owns what happens next).
- **New windows**, surfaced as a handler, and with them the ownership of
  `browsingContext.contextCreated`.

**Not in scope**

- A context object model — deferred, see B. The handler below yields a window handle.
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

### Exposing new windows

Three specification facts make this cheap:

1. **A context id is a window handle.** For a navigable with an associated window handle, "the
   navigable id must be the same as the window handle" (index.bs:3462). The event already carries
   the value `switchTo().window` expects, so nothing needs mapping and no new type appears.
2. **Top-level contexts are distinguishable.** `browsingContext.Info` carries `parent`
   (index.bs:3494), set for child navigables, so a per-navigable event can be presented as a
   per-window one.
3. **The replay burst is bounded.** `contextCreated` defines remote end subscribe steps
   (index.bs:5841), so subscribing emits it for contexts that already exist — and those emissions
   run before `session.subscribe` returns its result (index.bs:2332). Everything received after
   the subscribe response is genuinely new.

**Expose it as a handler, not as a waiter.** Handlers are the shape the bindings already use for
BiDi events — `driver.script.add_console_message_handler`,
`driver.network.add_request_handler`, and Java's low-level
`BrowsingContextInspector.onBrowsingContextCreated`. A method that takes a block of user code to
run while Selenium watches has no precedent in the API at all, and nothing about this event
justifies inventing one.

A handler is also the more flexible primitive, because the event carries information that polling
the handle set cannot reconstruct:

- `originalOpener` — which existing window opened this one
- `url` at creation
- `userContext` and `clientWindow` — whether it is a tab in the same OS window or a separate one
- `parent` — a frame rather than a window, if the user wants those too

So the record decides what a handler receives, not what a wait returns. A user who wants a wait
composes one from their own synchronization primitive and the handler, registering it once at
setup rather than around each action:

```ruby
new_windows = Queue.new
driver.<namespace>.add_window_opened_handler { |window| new_windows << window.handle }

link.click
driver.switch_to.window(new_windows.pop)
```

`ExpectedConditions.numberOfWindowsToBe` and `new_window_is_opened` keep working for anyone who
just wants the poll.

**What the record has to settle**

- **Where it lives.** Not a new method on `driver` — that namespace is crowded and this is not a
  driver-level concern. The natural home is whatever namespace this record establishes for the
  other browsing-context events, which is a naming decision it owns.
- **Whether top-level is the default.** Filtering on `parent` gives "windows"; not filtering gives
  every navigable including frames. Either is defensible; silently doing one of them is not.
- **Threading.** These handlers fire on the event connection, and the obvious thing a user does in
  one is issue a WebDriver command. Whether that is supported, and what happens if it is not, is a
  guarantee this record states rather than leaves to each binding. It applies to every handler
  family here, not just this event.
- **Subscription lifecycle.** Whether registering a handler subscribes lazily and unsubscribes on
  the last removal, and what the replay burst means for a handler registered mid-session — the
  subscribe response is the boundary, and a binding that ignores it will report every existing
  window as new.

**Not a waiter, for now.** A one-shot `wait_for_new_window` is a convenience layer, which the
charter defers. If demand justifies one later it arrives through that item, built on this handler,
rather than as a carve-out negotiated now.

**Current state.** No binding exposes navigation handlers as supported API. Waiting for a window is
a polled condition today — `ExpectedConditions.numberOfWindowsToBe`
(`java/src/org/openqa/selenium/support/ui/ExpectedConditions.java:954`) and
`expected_conditions.new_window_is_opened`
(`py/selenium/webdriver/support/expected_conditions.py:677`).

**Open questions**

- One timeout surface for both protocols, or separate ones? That is record 1's call; this record
  should state what it needs.
- Does a client-side timeout attempt to stop the navigation, or only stop waiting?
- Is `historyUpdated` exposed in 5, or noted and deferred? It has no classic analogue.

**Depends on.** Record 1 for where a deadline comes from. Not blocked by B.

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

- Whether a file dialog is allowed to open — the `file` key in the prompt handler, owned by
  record 1. This record owns what happens to a dialog that does open.
- The rule that a navigation becoming a download ends the navigation wait — stated by record 2.

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

**Depends on.** Nothing blocking. Coordinates with record 1 on the `file` capability key.

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
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load`, `historyUpdated` | Navigation and waits (2) |
| `browsingContext.userPromptOpened`, `userPromptClosed` | Capabilities (1), if it exposes them |
| `input.fileDialogOpened`, `browsingContext.downloadWillBegin`, `downloadEnd` | File handling (3) |
| `browsingContext.contextCreated` | Navigation and waits (2), surfaced as a new-window handler |
| `browsingContext.contextDestroyed` | Deferred; no use case asks for it |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |
