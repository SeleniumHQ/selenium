# NNNN. Navigation waits are enforced by the binding, and navigation is observable

<!-- Working context for whoever takes this record up, independent of any other session.

     Process: docs/decisions/README.md has the rules. This record is numbered by its own pull
     request, so it needs its own branch and PR — open it with the ADR template by appending
     ?expand=1&template=adr.md to the compare URL, then rename this file to NNNN-short-title.md
     using the number GitHub assigns and fill in the Discussion field. Keep per-binding
     convergence out of the record; that goes in the tracking issue after acceptance. Run
     ./scripts/format.sh --pre-push before pushing.

     Protocol text: the WebDriver BiDi specification source is index.bs in
     https://github.com/w3c/webdriver-bidi. Everything this record relies on from it is stated
     below in prose, so the record can be read without opening the specification; cite sections
     rather than line numbers, which move.

     Accepted records that bear on this one. Their substance is restated wherever this record
     depends on it, so none of them needs to be read first:
       - 17670, BiDi implementation boundaries: where supported Selenium API ends and internal
         implementation begins, and how each binding marks the line.
       - 17786, low-level behavioral contract: the low-level layer mirrors the specification, so
         every command is a typed call and every event a typed payload. Protocol coverage is
         therefore never the question; only whether something deserves supported high-level API.
       - 17685, network handler behavior: settles handlers for network requests, responses and
         authentication — registration, multi-handler resolution, blocking interception, and
         filtering by window handle or user context. It settles those for network traffic only
         and decides nothing for other event families.

     Sibling drafts, none of which this record depends on:
       - capabilities-timeouts-and-prompt-behavior: `timeouts` and `unhandledPromptBehavior`
         keep their classic meaning, with the binding enforcing what the remote end no longer
         does. It owns where a timeout value comes from; this record owns what a navigation
         wait does with one.
       - file-handling: an element upload method, download retrieval, and handlers for file
         dialogs and downloads.
       - browsing-contexts-and-windows: a windows namespace, window values, client windows and
         viewport, with switching left explicit and context objects left undecided.
-->

- Status: Proposed
- Discussion:

## Context

WebDriver BiDi reports navigation as a sequence of events rather than as one blocking command
result, and it bounds none of it with a timeout.

The events are one family. `navigationStarted`, `navigationCommitted`, `fragmentNavigated`,
`navigationAborted`, `navigationFailed`, `domContentLoaded`, and `load` all carry the same
`NavigationInfo` payload — context, navigation id, url, timestamp — and are all driven from the
same navigation status. `domContentLoaded` and `load` are not a separate document lifecycle; they
are the tail of the navigation, and the readiness states that `browsingContext.navigate` accepts
map onto them directly: `committed` to `navigationCommitted`, `interactive` to `domContentLoaded`,
`complete` to `load`. That makes the classic `pageLoadStrategy` values a near-mapping —
`normal`, `eager`, and `none` against four readiness states, with `committed` having no classic
equivalent.

Two details shape what a binding can promise. A navigation id may be null, when a navigation is
canceled before making progress. And a navigation does not always end in a load: a same-document
navigation completes at `fragmentNavigated`, and a navigation that turns into a download ends
there, since `downloadWillBegin` resumes the pending navigate.

`historyUpdated` is in the same module and is not part of this sequence. It reports that the
active document's URL changed without a navigation — `pushState`, `replaceState`, and
same-document history updates — and carries no navigation id. Classic has no equivalent, and
users approximate it today by polling the current URL.

Nothing here has a timeout. The page load timeout is a classic session timeout with no BiDi
counterpart, so any wait Selenium offers over BiDi is bounded by the binding or not at all.

| Binding    | Current behavior |
|------------|------------------|
| Java       | `navigate()` object; page load governed by `pageLoadStrategy` and the classic page load timeout. No navigation events as supported API; a low-level `BrowsingContextInspector` exposes `on*` callbacks. |
| Python     | Flat `get`, `back`, `forward`, `refresh` on the driver; no navigate object. No navigation events. |
| Ruby       | `navigate` object; no navigation events. |
| .NET       | Navigation object; readiness modeled on the BiDi protocol layer but not surfaced. |
| JavaScript | `navigate()` object; no navigation events. |

## Decision

**1. Navigation lifecycle events are exposed as handlers, on the binding's navigation object.**
Each event family gets an add, a remove, and a clear: navigation started, committed, aborted, and
failed; DOM content loaded; load; fragment navigated. Bindings without a navigation object
(Python) add one, or place the handlers where their other BiDi handlers live and say so.

**2. A handler receives a navigation value, not a protocol payload.** It carries the window handle
the navigation belongs to, the navigation id, the URL, and the timestamp. The navigation id may be
absent, and the type must express that rather than substituting an empty string.

**3. Handlers do not block.** These events are notifications; nothing waits for the handler, and a
handler cannot alter the navigation. A binding invokes handlers so that a slow one does not stall
event dispatch, and a user may issue driver commands from inside one.

**4. `historyUpdated` is exposed as a handler, and is not a navigation.** It never satisfies a
navigation wait, never fires a navigation-complete handler, and its value carries no navigation id
— only the handle, URL, and timestamp. It is the supported replacement for polling the current URL
in a single-page application.

**5. `pageLoadStrategy` continues to express how long navigation commands wait.** `normal`,
`eager`, and `none` keep their meanings, mapping to the `complete`, `interactive`, and `none`
readiness states. The capability is not extended.

**6. `committed` is reachable per call, not per session.** Navigation commands accept an optional
readiness argument, including `committed`, which overrides `pageLoadStrategy` for that call. This
is where the fourth state lives, because it has no classic capability value to inherit and a
session-wide default of "committed" is not a thing classic users can ask for.

**7. The binding enforces the page load timeout.** A navigation command that waits for a readiness
state is bounded by the classic page load timeout — the value a user sets through the `timeouts`
capability, which is where it has always come from — enforced client-side because the protocol
enforces nothing, and raising the binding's existing page-load timeout error. This record takes the
value as given and decides only what a navigation wait does with it; the capability surface itself
is settled separately, and nothing here changes how a user sets it.

**8. An expired wait does not cancel the navigation, and the session stays usable.** The browser
continues loading. After the error, the session is in the same state it would be in after any
other failed command: the current window is unchanged, and a subsequent command targets whatever
document is current by then. Bindings do not attempt to stop the navigation or to reset state.

**9. A navigation that ends without a load is not an error.** A same-document navigation satisfies
a wait at `fragmentNavigated`. A navigation that becomes a download satisfies it when the download
begins. Neither raises, and neither waits for a `load` that will not come.

## Considered options

- **Expose navigation events only as one handler with an event-type argument** — a single
  `add_navigation_handler` receiving a typed event. Rejected: it pushes a conditional into every
  user's handler and makes the common case (act when the page has loaded) harder to write than the
  rare one.
- **Add `committed` as a `pageLoadStrategy` value** — extend the capability to four values.
  Rejected: `pageLoadStrategy` is a W3C capability with a defined value space, and a binding that
  sends a fourth value to a classic remote end is sending something undefined.
- **Leave navigation waits unbounded over BiDi** — treat the absence of a protocol timeout as the
  protocol's answer. Rejected: a program that used to fail in 300 seconds would hang, which is the
  worst possible way to learn that a transport changed.
- **Cancel the navigation when the wait expires** — attempt `browsingContext.close`, a stop, or a
  navigation to `about:blank`. Rejected: none of these is a cancellation, each has side effects a
  user did not ask for, and the classic behavior being emulated did not cancel either.
- **Treat `historyUpdated` as a navigation event** — let it satisfy waits and fire load handlers,
  on the grounds that users think of a URL change as navigation. Rejected: it carries no navigation
  id, there is no document change to wait for, and a wait it satisfied would be satisfied by
  something the page did rather than by something the user asked for.
- **Defer `historyUpdated`** — expose the six navigation events and leave this one. Rejected on
  balance: it is the only supported answer to a question users currently answer by polling, and the
  cost over the other handlers is one more of the same shape.

## Consequences

Users get an event-driven view of navigation for the first time, and a page load timeout that
behaves the same on both paths. The cost is that a timeout is now a client-side deadline: it starts
when the binding sends rather than when the remote end begins work, and a navigation that outlives
it keeps running in a browser the user has stopped waiting for. That is a real behavior difference
under the hood, visible to anyone who inspects the browser after a timeout.

Python gains a navigation object, or an inconsistent home for these handlers; the record forces the
choice rather than letting it happen per binding. Every binding gains a navigation value type and
must express an absent navigation id in an idiomatic way.

`committed` becomes reachable per call, which introduces a readiness argument to navigation
commands that did not have one. Bindings that already model readiness internally (.NET) surface
what they have; the others add it.

Follow-up decisions this makes necessary: what a handler receives for events on a context that is
not a top-level window, which only arises if frames or browsing contexts become addressable in
their own right; and whether script evaluation gets the same client-side enforcement of the script
timeout, which has the same cause — BiDi defines no timeouts — but belongs with whatever record
settles the script and logging API, since that is where the operations it would bound are
decided.
