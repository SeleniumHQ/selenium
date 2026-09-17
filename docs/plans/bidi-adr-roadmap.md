# BiDi decision roadmap

- Status: Draft
- Owner: Selenium Technical Leadership Committee (TLC)

## Purpose

This is a planning document, not a decision. It describes the records that still need to be written
for the BiDi surface of Selenium 5, so each can be proposed with its scope already agreed and the
boundaries between them settled once rather than in six review threads.

The release charter ([selenium-5.md](selenium-5.md)) carries one line per record. The detail —
what each settles, what it must not absorb from its neighbors, the protocol facts that constrain
it, and the questions the TLC has to answer — lives here until the records themselves exist.

Each entry below is sized to the scope test in [decisions/README.md](../decisions/README.md): a
record captures one coherent decision, and a sub-choice splits out only when its rationale stands
without the others. Where a boundary between two records is arguable, the entry says which one owns
it and why.

Protocol references are to the WebDriver BiDi specification source (`index.bs` in
[w3c/webdriver-bidi](https://github.com/w3c/webdriver-bidi)); line numbers are from the September
2026 editor's draft and are given to locate the algorithm, not as stable citations.

## Sequencing

Two orderings are load-bearing. Proposing against them means rewriting a record after review:

```
Classic behavior with BiDi enabled ──▶ Prompt handling
Browsing context representation ──┬──▶ Navigation async/event API
                                  ├──▶ File uploads
                                  └──▶ Downloads
```

**Context representation comes first** because navigation, uploads, and downloads each name a
context type in their scoping arguments. Settling it once is the difference between three
consistent records and three that each invented an answer.

**The compatibility rule comes before prompt handling** because prompt handling is its sharpest
instance. A general rule inferred from the hardest case tends to be the wrong general rule.

Every record that adds a family of event handlers inherits the handler lifecycle and scoping
settled in [17685](../decisions/17685-network-handler-behavior.md) — add, remove, clear, and
scoping by window handle or user context — or states why that family differs. That is an
expectation, not a dependency; it does not gate proposal order.

---

## 1. Classic behavior when BiDi is enabled

**Decision.** Enabling BiDi does not change the behavior of any existing API. BiDi adds capability;
it never silently changes a default, an error type, or the timing of the classic surface. Where
BiDi cannot express a classic semantic, the binding emulates it locally rather than degrading it.

**Why a record.** The project has agreed that routing classic commands through BiDi is lower
priority, but sessions with both are already the common case, and every record that follows will
otherwise re-argue the same question: when the protocol offers something adjacent to a classic
behavior but not identical to it, does the user get the classic behavior or the protocol's? Without
a stated rule each record answers locally and the bindings drift apart again.

**In scope**

- The rule itself, and what "emulate locally" permits: holding protocol state, deferring an action
  to a later command, synthesizing an error the protocol does not define.
- What may change when BiDi is enabled, stated positively — new APIs, new events, capabilities
  that only BiDi can serve — so the rule does not read as a freeze.
- Where the burden falls when a classic behavior costs significant local machinery: is the bar
  "always emulate", or "emulate unless the record says otherwise, with a reason"?
- How a binding behaves when BiDi is enabled and the remote end does not implement the feature the
  emulation needs.

**Not in scope**

- Routing classic commands over BiDi, and choosing a path per session — both already deferred in
  the charter.
- The specific emulations. Each belongs to the record that owns the behavior; prompt handling is
  the first and hardest of them.

**Protocol constraints**

- BiDi is enabled by a capability (`webSocketUrl`), so a session can have both surfaces active and
  a user can reach them at the same time.
- Capabilities are no longer session-global: `browser.createUserContext` accepts
  `acceptInsecureCerts`, `proxy`, and `unhandledPromptBehavior` per user context (index.bs:2825),
  and an overrides map is consulted ahead of the session-level handler (index.bs:6463). "Classic
  behavior" therefore has to be defined for a session that contains contexts configured
  differently.

**Open questions**

- Is this a rule with teeth — a record a later proposal can be held against — or a stated
  preference? The former is more useful and harder to agree.
- Does it bind only the bindings, or also Grid's handling of a BiDi-enabled session?

**Depends on.** Nothing. This should be proposed first.

---

## 2. Browsing context representation

**Decision.** What identifies a browsing context in every API added in this release: the window
handle strings used today, or context objects — and whether `switchTo` gains an object-oriented
alternative with a deprecation path.

**Why a record.** Three of the records below need a type to name when a handler is scoped, and
[17685](../decisions/17685-network-handler-behavior.md) already made window handle and user context
the scoping currency for network handlers. If this is not settled first, each later record either
copies 17685 without deciding whether that is right, or invents something different. The record may
legitimately conclude "handles stay as they are" — what it may not do is leave the question open.

**In scope**

- The identity type for a top-level context in new APIs, and whether it is the same type users get
  from the existing window handle APIs.
- Whether frames are addressable in the same way. BiDi contexts include nested navigables, so an
  object model that stops at top-level contexts leaves `switchTo().frame()` where it is, and one
  that does not is a much larger change.
- User contexts: Python already exposes `driver.browser.create_user_context()` publicly
  (`py/selenium/webdriver/remote/webdriver.py:1260`), and Java exposes the module through
  `org.openqa.selenium.bidi.module.Browser`. Whether that becomes a supported cross-binding type is
  part of this decision, not a separate one, because 17685 already scopes handlers by it.
- If objects are adopted: the deprecation path for `switchTo()`, and whether the object is a handle
  wrapper or something with behavior on it.

**Not in scope**

- A high-level API for managing contexts — creating and closing them as objects, walking the
  context tree, handlers for `browsingContext.contextCreated` and `contextDestroyed`. That is the
  charter's deferred "Browser context API" and stays deferred; this record settles identity only.

**Protocol constraints**

- A window handle is a top-level traversable; a BiDi context id also names nested navigables, so
  the two are not interchangeable and a mapping has to be stated in one direction or both.
- `session.subscribe` takes optional `contexts` and `userContexts` (index.bs:2020). Declining to
  expose subscribe-time scoping is viable, but then every event a user receives is session-wide and
  filtering is theirs to do — which is a user-visible consequence of this record, not of the event
  records.

**Open questions**

- Is the minimal answer — handles stay strings, new APIs take handles, `switchTo` is untouched —
  acceptable for 5? It is cheap, consistent with 17685, and defers the object model; it also means
  frames stay addressable only through `switchTo`.
- If objects are adopted, does the charter need to move the deferred "Browser context API" item, or
  can representation genuinely ship without management?

**Depends on.** Nothing, but it gates three records, so it should be proposed early.

---

## 3. Navigation async/event API

**Decision.** The cross-binding API for navigation lifecycle handlers, and the navigation behavior
that goes with them.

**Why a record.** It is one design with one rationale: the events, what `get` waits for, and how
both relate to the page load timeout cannot be understood separately. A reader who has the handler
API but not the readiness mapping does not know when a handler fires relative to the command
returning.

**In scope**

- Handlers for the navigation-shaped events: `navigationStarted`, `navigationCommitted`,
  `fragmentNavigated`, `navigationAborted`, `navigationFailed`, `domContentLoaded`, `load`.
- `historyUpdated`, with the explicit statement that it is a URL-change signal and not a
  navigation: no navigation id, no completion of a pending wait, no firing of a
  navigation-complete handler.
- What `get` waits for, and its relationship to `pageLoadStrategy` (today a capability with
  `normal` / `eager` / `none`) and to the page load timeout.
- The correlation contract: events from one navigation share a navigation id, and that id may be
  absent.
- The terminating cases: same-document navigation never produces a load; a navigation that becomes
  a download ends the wait (this record owns that rule, the downloads record owns what happens
  next).

**Not in scope**

- One-shot waiters (`expect_*`), already deferred by the charter as a convenience layer. This
  record settles handlers and the implicit waits that already exist.
- Download behavior beyond the handoff rule.

**Protocol constraints**

- `domContentLoaded` and `load` carry `browsingContext.NavigationInfo`, the same params type as the
  navigation events, and are triggered from the same navigation status struct (index.bs:3737).
  They are not a separate lifecycle.
- Readiness maps to those events directly: `committed` → `navigationCommitted`, `interactive` →
  `domContentLoaded`, `complete` → `load` (index.bs:3628). `browsingContext.navigate` is defined
  in terms of awaiting them, which makes the classic `pageLoadStrategy` values a near-mapping —
  `normal`/`eager`/`none` against four readiness states, with `committed` having no classic
  equivalent.
- `navigation` is nullable (index.bs:3739): null when a navigation is canceled before making
  progress.
- `historyUpdated` carries only `context`, `timestamp`, `url` (index.bs:5997).
- `downloadWillBegin` resumes a pending navigate (index.bs:6166), so a navigation that becomes a
  download never reaches `load`.

**Current state.** No binding exposes navigation handlers as supported API. .NET models readiness
on the protocol layer (`dotnet/src/webdriver/BiDi/BrowsingContext/Navigate.cs`); the others do not
surface it. The divergence table for the record's Context section still needs to be built per
binding.

**Open questions**

- Does `pageLoadStrategy` remain the way a user expresses readiness, or does the navigation API
  take it per call? A capability that configures a per-call protocol parameter is the kind of thing
  that ages badly, but changing it is a compatibility question for record 1.
- Does `committed` become reachable, and if so, how does a user ask for it?
- Is `historyUpdated` exposed at all in 5, or noted and deferred? It has no classic analogue, which
  cuts both ways: nothing to keep compatible, and nothing users are asking to replace.

**Depends on.** Browsing context representation (2), for the scoping argument. Should state its
relationship to record 1 if readiness changes any existing default.

---

## 4. Prompt handling

**Decision.** How `unhandledPromptBehavior` is expressed and honored now that BiDi applies the
handler when the prompt opens, and what keeps the existing alert API working.

**Why a record.** This is not a capability rename. The classic capability describes what happens to
a prompt that is still open when the next command arrives; the BiDi handler is consulted at the
moment the prompt opens and decides whether it opens at all. Keeping the classic contract means
building a local state machine, which is behavior, not mapping — and it is the first real test of
record 1.

**In scope**

- The capability shape: a single value or a per-type map, what the bindings accept, and that it can
  be set per user context.
- The local behavior that preserves the classic contract: holding the prompt open, applying the
  configured behavior at the next command, and synthesizing the unexpected-alert error for the
  notify variants that BiDi does not define.
- What happens to `switchTo().alert()` and the `Alert` type, including whether they gain anything.
- File dialogs, which the protocol treats as one more prompt type: the `file` key, the
  `input.fileDialogOpened` event, and what a handler for it can actually do.
- Whether `userPromptOpened` / `userPromptClosed` are exposed as handlers in 5, or held back with
  the rest of the prompt module.

**Not in scope**

- A high-level prompts module — the charter's deferred capability mapping.
- Setting files on an element, which belongs to uploads (5). The dialog and the element are
  different problems; see the protocol constraint below.

**Protocol constraints**

- The handler is applied when the prompt opens: the "user prompt opened" steps return it to the
  browser (index.bs:6516). There is no next-command moment in the protocol.
- Only `accept`, `dismiss`, `ignore` exist (index.bs:2003). The specification contains no notify
  variants at all, so classic's `dismiss and notify`, `accept and notify`, and the classic default
  are inexpressible.
- `ignore` is special-cased to "none" (index.bs:6514) — the prompt stays open. It is the only mode
  in which the events and `browsingContext.handleUserPrompt` are useful.
- Per-user-context overrides are consulted before the session handler (index.bs:6463).
- File dialogs invert the default: the dialog is allowed to open unless configured otherwise, and
  any value other than `ignore` dismisses it (index.bs:15356, 15404).
- `input.fileDialogOpened` carries the element only when there is one (index.bs:15338) — a
  `showOpenFilePicker()` call has none — while `input.setFiles` requires an element
  (index.bs:15251). A dialog handler therefore cannot always fulfill the dialog.

**Current state.** The bindings already diverge. .NET models the capability as uniform-or-per-type
(`dotnet/src/webdriver/UserPromptHandler.cs`); Java carries it as a string constant
(`java/src/org/openqa/selenium/remote/CapabilityType.java:32`); Python exposes a descriptor over
the raw value (`py/selenium/webdriver/common/options.py:265`). The error type diverges too — Java
raises `UnhandledAlertException`, Python `UnexpectedAlertPresentException` — which this record
should note even if it does not fix it.

**Open questions**

- How much local machinery is the classic contract worth? Holding every prompt open to reapply the
  classic behavior later is a real behavioral change under the hood, and a crash or disconnect
  leaves a prompt open that classic would have dismissed.
- Does the per-type map get exposed in 5, or does the capability stay a single value with the map
  as a later addition?
- Is the file dialog in this record or held entirely for a later one? It is the same capability
  struct, but it is also the part users have never had.

**Depends on.** Classic behavior when BiDi is enabled (1).

---

## 5. File uploads

**Decision.** An element-scoped upload method, and the deprecation path for the current mechanism.

**Why a record.** Uploads today work by overloading `sendKeys` with a path and by a file detector
that guesses whether a string is a file — behavior users hit accidentally and cannot easily turn
off. `input.setFiles` makes an explicit method possible for the first time. The deprecation is
user-visible in every binding, which is what makes it a record rather than an implementation
choice.

**In scope**

- The method: where it lives, what it accepts, and behavior for multiple files and for elements
  that are not file inputs.
- The deprecation path for passing paths to `sendKeys`, and for the file detector types.
- How uploads reach a remote browser, and what replaces the file detector's role there.

**Not in scope**

- File dialogs and any handler for them — prompt handling (4) owns the dialog.
- Downloads (6). They share a "files move between the test machine and the browser host" framing,
  but nothing else: uploads are element-scoped and synchronous, downloads are context-scoped and
  asynchronous with a Grid retrieval story.

**Protocol constraints**

- `input.setFiles` takes a context, an element, and a list of files (index.bs:15251). It is
  element-scoped by definition, and the files are named on the machine running the browser.

**Current state.** `LocalFileDetector` is the default in Python
(`py/selenium/webdriver/remote/webdriver.py:291`, with `file_detector_context` and
`UselessFileDetector` as escape hatches); Java exposes `setFileDetector` on `RemoteWebDriver`. The
record should tabulate what each binding does today before proposing the replacement.

**Open questions**

- Does the remote upload path (`POST /session/{id}/file`) stay as it is, with the new method only
  changing the local API, or does BiDi change how files get to a remote browser?
- Does the file detector become inert immediately when the new method exists, or only when
  `sendKeys`-with-path is removed?

**Depends on.** Browsing context representation (2), if the method or its remote path names a
context.

---

## 6. Downloads

**Decision.** Configuring download behavior, handlers for a download beginning and ending, and how
both relate to the downloadable-files API Grid already serves.

**Why a record.** Downloads have a rationale that stands entirely on its own: where the file lands,
who can read it when the browser is remote, and what `se:downloadsEnabled` means once the protocol
can configure download behavior directly. It would be debated by different people than the
navigation record and can be reversed without disturbing it.

**In scope**

- Handlers for `downloadWillBegin` and `downloadEnd`, following the 17685 lifecycle.
- Download behavior configuration, and its relationship to the browser-specific options users set
  today.
- The existing `HasDownloads` surface (`getDownloadableFiles`, `downloadFile`,
  `deleteDownloadableFiles`, gated on `se:downloadsEnabled`): what it becomes when the protocol can
  report a completed download's path directly, and whether the two paths converge or stay separate
  for local and Grid sessions.

**Not in scope**

- The rule that a navigation becoming a download ends the navigation wait — stated by navigation
  (3); this record picks up from there.
- Uploads (5).

**Protocol constraints**

- `downloadWillBegin` and `downloadEnd` extend `BaseNavigationInfo` (index.bs:6127), so a download
  carries the navigation id of the navigation that produced it, plus a download id and suggested
  filename.
- `downloadWillBegin` resumes a pending navigate (index.bs:6166).
- The completed download's path comes from the navigation status (index.bs:3273), which is a local
  path on the machine running the browser — the same distinction `se:downloadsEnabled` exists to
  paper over.

**Current state.** `java/src/org/openqa/selenium/HasDownloads.java` and the equivalents in Python
and Ruby are Grid-oriented and capability-gated; no binding exposes download events as supported
API.

**Open questions**

- Does `se:downloadsEnabled` remain the switch, or does BiDi's download behavior configuration
  replace it for sessions that have BiDi?
- Is a completed download's path exposed directly for local sessions, accepting that the same
  program does not work unchanged against Grid?

**Depends on.** Browsing context representation (2). Reads the handoff rule from navigation (3).

---

## Records already indexed

Two entries on the charter are unaffected by this roadmap and are noted only for completeness.

**Script and logging async/event API** — pinned scripts and the console-message, JavaScript-error,
and DOM-mutation handlers. One gap worth closing while it is being written: `script.realmCreated`
and `script.realmDestroyed` are not claimed by any planned record. The script record should either
take them or say they are deferred.

**Selenium Manager released API** — unrelated to the BiDi surface.

## Event coverage

Where each subscribable event lands once these records exist. The core specification defines 24
events; three more come from extension specifications.

| Events | Record |
|---|---|
| `network.beforeRequestSent`, `responseStarted`, `responseCompleted`, `fetchError`, `authRequired` | [17685](../decisions/17685-network-handler-behavior.md), accepted |
| `log.entryAdded`, `script.message` | Script and logging |
| `script.realmCreated`, `realmDestroyed` | Script and logging, if it claims them |
| `browsingContext.navigationStarted`, `navigationCommitted`, `navigationAborted`, `navigationFailed`, `fragmentNavigated`, `domContentLoaded`, `load`, `historyUpdated` | Navigation (3) |
| `browsingContext.downloadWillBegin`, `downloadEnd` | Downloads (6) |
| `browsingContext.userPromptOpened`, `userPromptClosed`, `input.fileDialogOpened` | Prompt handling (4) |
| `browsingContext.contextCreated`, `contextDestroyed` | Deferred with the browser context API |
| `bluetooth.requestDevicePromptUpdated`, `gattConnectionAttempted`, `speculation.prefetchStatusUpdated` | Deferred; defined outside the core specification |
