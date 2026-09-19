# NNNN. Timeouts and prompt behavior are enforced by the binding when BiDi is enabled

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
       - navigation-and-waits: navigation lifecycle events as handlers, and what a navigation
         command waits for once the client rather than the remote end enforces the deadline.
       - file-handling: an element upload method, download retrieval, and handlers for file
         dialogs and downloads.
       - browsing-contexts-and-windows: a windows namespace, window values, client windows and
         viewport, with switching left explicit and context objects left undecided.
-->

- Status: Proposed
- Discussion:

## Context

Two classic capabilities describe behavior the remote end used to guarantee, and WebDriver BiDi
does not reproduce either one.

**`unhandledPromptBehavior`.** In WebDriver Classic the capability describes what happens to a
prompt that is still open when the next command arrives — hence "unhandled". In BiDi the handler
is consulted when the prompt opens and decides whether it stays open at all: the "user prompt
opened" steps return the handler to the browser, and there is no next-command moment in the
protocol. The value space is also smaller. BiDi defines `accept`, `dismiss`, and `ignore`; the word
"notify" does not appear in the specification, so classic's `dismiss and notify`, `accept and
notify`, and the classic default cannot be expressed. `ignore` is special-cased to leave the prompt
open, and is the only value under which a prompt can still be inspected or answered.

**`timeouts`.** BiDi has no timeouts at all. `session.CapabilityRequest` has no `timeouts` member,
and the only occurrences of the word in the specification are open TODOs proposing one for script
evaluation. Nothing bounds a `browsingContext.navigate` that never completes except the client. All
three classic timeouts are affected in principle — page load, script, and implicit — though only
the first two govern operations that run over BiDi today, since element location does not.

The result is that turning on `webSocketUrl` can change what a program does without the program
changing. That is the problem this record solves, for these two capabilities.

| Binding    | Current behavior |
|------------|------------------|
| Java       | `unhandledPromptBehavior` is a string capability constant; no per-type map. Raises `UnhandledAlertException`. Timeouts are classic session timeouts; the BiDi layer carries an unrelated per-send websocket `Duration`. |
| Python     | `unhandled_prompt_behavior` is a descriptor over the raw value; no per-type map. Raises `UnexpectedAlertPresentException`. |
| Ruby       | String capability; no per-type map. |
| .NET       | Models the capability as uniform-or-per-type already (`UserPromptHandler`), including the `file` key. |
| JavaScript | String capability; no per-type map. |

## Decision

**1. Both capabilities keep their classic meaning when BiDi is enabled.** A program that sets
`unhandledPromptBehavior` or `timeouts` behaves the same whether or not `webSocketUrl` is
requested. Where BiDi cannot express the classic meaning, the binding produces it; it does not
substitute the nearest protocol behavior and document the difference.

**2. `unhandledPromptBehavior` accepts a single value or a per-type map in every binding.** The
per-type keys are those the protocol defines — `alert`, `beforeUnload`, `confirm`, `default`,
`file`, `prompt` — and each takes a classic handler value. A single value is shorthand for
`default`. Bindings validate keys and values and reject unknown ones rather than forwarding them.
The `file` key governs file pickers rather than dialogs the page scripts: the specification lets a
file dialog open unless the handler says otherwise, and any value other than `ignore` dismisses
it.

**3. The binding, not the remote end, applies the prompt handler.** When BiDi is enabled the
binding requests `ignore` for the types it manages, observes prompts as they open, and applies the
configured classic behavior — including the notify variants, and including the classic default of
`dismiss and notify` — at the point a command is issued, raising the binding's existing
unexpected-alert error. `switchTo().alert()` continues to find a prompt that is open, and continues
to raise the existing "no such alert" error when none is.

**4. A user may ask for protocol behavior instead.** Setting a handler value the classic
capability does not define — that is, using the BiDi value `ignore` — means what BiDi means: the
prompt opens and stays open, and the binding does not apply anything at the next command. This is
the escape hatch for users who want the protocol's semantics; it is never the default.

**5. `timeouts` remains the single surface for all three timeouts, and the binding enforces
whichever of them governs an operation running over BiDi.** Page load and script timeouts apply to
BiDi operations today, enforced client-side, raising the same error the binding raises for the
classic path. A binding must not silently wait forever for a protocol operation that has a classic
timeout governing it. Implicit wait keeps its meaning and stays remote-enforced while element
location runs over Classic; if location moves to BiDi it is enforced by the binding on the same
terms as the other two, with no change to how a user sets it. The transport's own websocket
deadline is a separate concern and is not user-configurable through `timeouts`.

**6. An expired client-side timeout does not cancel the operation.** The browser keeps doing what
it was doing; the binding stops waiting and reports. The session remains usable: the current
window is unchanged and a subsequent command behaves as it would after any other failed command.
Whichever record owns a given operation states the rest for that operation — for navigation, that
a page still loading is not an error state to recover from.

**7. Capabilities are session-level.** BiDi allows more: `browser.createUserContext` accepts
`acceptInsecureCerts`, `proxy`, and `unhandledPromptBehavior` for one user context — roughly a
profile — and a per-context prompt handler is consulted ahead of the session's. This record does
not expose that. No supported Selenium API creates a user context, so no session can contain a
context configured to disagree with it, and the emulation above never has to reconcile two
answers. Should a supported API for creating user contexts arrive, how capabilities apply to one
is a decision for that API, not an extension of this one.

**8. Prompt events are exposed as handlers.** `userPromptOpened` and `userPromptClosed` are
available as added/removed handlers, receiving the prompt's type, message, default value, the
handler that will be applied, and — for closed — whether it was accepted and any text entered.
They observe; they do not decide what happens to the prompt, which is what the capability is for.
Because the binding holds prompts open under classic semantics, these fire for every prompt, not
only under `ignore`.

## Considered options

- **Pass the capability through and accept BiDi's semantics** — send the configured value to the
  remote end, let the handler apply at prompt-open time, and document that notify variants
  degrade to their non-notify equivalents. Rejected: it changes behavior for every user who
  enables BiDi, silently, in the direction of losing an error they currently rely on. It is also
  not reversible later without a second behavior change.
- **Preserve classic semantics only when the user asks** — default to protocol behavior, offer an
  opt-in compatibility mode. Rejected for the same reason: the default is what most users get, and
  the default should not depend on a transport choice.
- **A separate timeout surface for BiDi operations** — leave `timeouts` classic-only and add a new
  configuration for protocol operations. Rejected: users have one mental model of "how long before
  this gives up", and two surfaces would need reconciling every time an operation moved between
  paths.
- **Expose the per-type prompt map only where a binding already has it** — accept .NET's shape and
  leave the others as strings. Rejected: users write the same capability against five bindings
  and should not have to learn which of them accepts which shape.
- **Cancel the operation when a client-side timeout expires** — attempt to stop the navigation or
  script. Rejected: BiDi offers no reliable way to do it, and a partial cancellation leaves the
  session in a state neither classic nor BiDi describes.

## Consequences

Users see no change from enabling BiDi, which is the point, and pay for it in machinery they
cannot see: the binding subscribes to prompt events for the whole session and holds prompts open
between commands. Two things follow that the record accepts deliberately. A crash or disconnect
between a prompt opening and the next command leaves the prompt open, where classic would have
dismissed it. And a prompt is open for longer than it used to be, so anything that inspects browser
state out of band sees a different picture.

Bindings that carry `unhandledPromptBehavior` as a string gain a type or equivalent for the
per-type map; .NET's existing shape becomes the reference. The error raised for the notify
variants is the binding's existing one, so the divergence in error names
(`UnhandledAlertException` versus
`UnexpectedAlertPresentException`) is preserved, not resolved; aligning those is a
separate decision.

Client-side enforcement of `timeouts` means the number a user sets now governs a wait the binding
runs. Timing differs slightly from remote enforcement — the deadline starts when the binding
sends, not when the remote end begins work — and a timeout once enforced in one place is now
enforced in as many places as there are waits.

Deferred by this record, each needing its own decision later: how capabilities apply to a user
context, if a supported API for creating one arrives; aligning the unexpected-alert error across
bindings, which this record preserves rather than fixes; and how the script timeout behaves for
script evaluation running over BiDi, which belongs with whatever record settles the script and
logging API, since that is where the operations it bounds are decided.

One adjacent gap is deliberately not settled here. BiDi defines no stale element error — the
nearest is "no such node", for an unknown reference, and the specification carries an open issue on
the stale object reference case — so a classic `StaleElementReferenceException` has no protocol
equivalent. It is not a capability and hangs off nothing this record decides, and like implicit
wait it only bites once elements come from BiDi rather than Classic. It is tracked separately, and
noted here because anyone reading this record for "what classic behavior does BiDi fail to
express" should find it.
