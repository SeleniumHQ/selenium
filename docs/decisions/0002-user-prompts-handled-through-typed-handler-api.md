# 0002. Browser user prompts are handled through a typed handler API

- Status: Proposed
- Date: 2026-06-11
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17672

## Context

JavaScript dialogs — `alert`, `confirm`, `prompt`, and `beforeunload` — block the page
until they are accepted or dismissed. WebDriver Classic exposes them only reactively
through `switch_to.alert`, which the user must poll for after the dialog has already
appeared; this races with the dialog opening and cannot pre-decide behaviour.

BiDi models prompts properly: `browsingContext.userPromptOpened` fires when a prompt
opens (carrying its type, message, and default value), `browsingContext.handleUserPrompt`
accepts or dismisses it (optionally supplying prompt text), and `userPromptClosed`
reports the outcome. The `unhandledPromptBehavior` capability sets a static
accept/dismiss/ignore policy per prompt type at session start.

So there are two distinct needs: a **static default** (handle all prompts a fixed way for
the session) and a **dynamic, per-prompt decision** (inspect this prompt's message, then
choose). Current bindings expose neither well — Python has only a raw generated
`handle_user_prompt` plus an observational `expect_user_prompt`; there is no ergonomic
handler that hands the user a prompt object to inspect and act on.

Playwright's model is instructive: `page.on("dialog", handler)` / `page.once(...)` invoke
a callback with a `Dialog` object exposing `.message`, `.type`, `.default_value`,
`.accept(text)`, `.dismiss()`; and crucially, **if no handler is registered, dialogs are
auto-dismissed** so a stray `alert()` never hangs the session.

## Decision

Bindings expose a **handler-based user-prompt API** that invokes a callback with a typed
`UserPrompt` object when a prompt opens.

Normative requirements:

- A persistent handler registration (`add_user_prompt_handler` / equivalent) and a
  one-shot form (fires for the next prompt only, then auto-removes).
- The callback receives a **`UserPrompt`** exposing read accessors `type`
  (`alert` | `confirm` | `prompt` | `beforeunload`), `message`, `default_value`, and the
  originating browsing context, plus actions `accept(text=None)` and `dismiss()` mapping
  to `browsingContext.handleUserPrompt`.
- **Default behaviour when no handler is registered is to dismiss** the prompt, so an
  unhandled dialog never blocks automation. Bindings achieve this via the
  `unhandledPromptBehavior` capability default and document it.
- The static capability route (`unhandledPromptBehavior`) remains available for users who
  want a fixed session-wide policy without a callback.
- `expect_user_prompt` (the observational waiter from
  [0001](0001-bidi-events-awaited-with-expect-context-managers.md)) remains for the
  "assert a prompt appeared" case; it is complementary, not a replacement for handling.

Code sketch — Python (reference implementation):

```python
# Persistent handler — inspect, then decide
def on_prompt(prompt):
    if prompt.type == "prompt":
        prompt.accept(text="42")
    elif "delete" in prompt.message:
        prompt.dismiss()
    else:
        prompt.accept()

handler_id = driver.browsing_context.add_user_prompt_handler(on_prompt)

# One-shot — handle only the next prompt (mirrors Playwright page.once("dialog", ...))
driver.browsing_context.once_user_prompt(lambda p: p.accept())
driver.execute_script("confirm('proceed?')")

driver.browsing_context.remove_user_prompt_handler(handler_id)
```

Code sketch — other bindings (idiomatic shape, same semantics):

```java
driver.browsingContext().onUserPrompt(prompt -> {
    if (prompt.type() == UserPromptType.PROMPT) prompt.accept("42");
    else prompt.dismiss();
});
```

## Considered options

- **Typed handler callback + dismiss-by-default (chosen)** — lets users inspect the
  prompt before deciding; the one-shot form covers the common single-dialog case; the
  no-handler-dismisses rule prevents hangs; the static capability covers fixed policies.
- **Only the `unhandledPromptBehavior` capability** — simple and already in the spec, but
  cannot make a decision based on the prompt's message, and cannot vary per prompt.
  Rejected as the sole mechanism; kept as the static-default layer.
- **Expose only `expect_user_prompt`** — good for assertions, but it captures one prompt
  for inspection rather than installing ongoing handling, and gives no obvious place to
  call `accept`/`dismiss` for prompts the test did not anticipate. Rejected as the primary
  handling API; retained for the assert-it-appeared case.

## Consequences

- Users can react to prompts based on their content, in one consistent shape across
  bindings, without the Classic `switch_to.alert` race.
- The dismiss-by-default rule is a **behaviour commitment**: bindings that previously left
  prompts to a different default must align, and this should be called out in release
  notes for those bindings.
- `beforeunload` handling (often a `dismiss` to allow navigation) is covered by the same
  object.
- Builds on [0001](0001-bidi-events-awaited-with-expect-context-managers.md) for the
  `expect_user_prompt` waiter and the underlying subscription.

## Binding status

| Binding    | Status  | Notes / tracking link                                       |
|------------|---------|-------------------------------------------------------------|
| Java       | pending |                                                             |
| Python     | pending | raw `handle_user_prompt` + observational `expect_user_prompt` exist; typed handler not yet built |
| Ruby       | pending |                                                             |
| .NET       | pending |                                                             |
| JavaScript | pending |                                                             |

## Appendix

Spec surface relied on: `browsingContext.userPromptOpened`
(`{context, type, message, defaultValue, handler}`), `browsingContext.handleUserPrompt`
(`{context, accept, userText}`), `browsingContext.userPromptClosed`, and the
`session.UserPromptHandler` capability (`accept` | `dismiss` | `ignore`, per type:
`alert` | `beforeUnload` | `confirm` | `default` | `file` | `prompt`). No new wire
protocol is required.
