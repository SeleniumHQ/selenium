# 18282. Actions stay the input API, and can target any window

- Status: Proposed
- Discussion: [#18282](https://github.com/SeleniumHQ/selenium/pull/18282)

## Context

Every binding already has a complete input API: an action builder (`Actions`, `ActionChains`,
`driver.action`, `driver.actions()`) that builds key, pointer and wheel sequences and performs them
with WebDriver classic's Perform Actions and Release Actions commands. Users also upload files by
sending a path to a file input with the element's send keys command.

WebDriver BiDi's `input` module covers the same ground, plus three things classic cannot do:

* perform or release actions on a window other than the current one, without switching to it
  (`input.performActions` and `input.releaseActions` take a context);
* set the files of a file input directly, replacing the selection (`input.setFiles`);
* report that the page opened a file dialog (`input.fileDialogOpened`).

`input.performActions` takes the same source and action shape as classic Perform Actions. The only
difference on the wire is an element origin, which BiDi writes as a shared reference whose id is the
classic element id.

Under [17670](17670-bidi-implementation-boundaries.md), none of this may reach users as protocol types.
[#17681](https://github.com/SeleniumHQ/selenium/pull/17681) makes windows objects and leaves input out.
[17685](17685-network-handler-behavior.md) and [#17776](https://github.com/SeleniumHQ/selenium/pull/17776)
set the scoping and handler rules this record reuses, and
[#18279](https://github.com/SeleniumHQ/selenium/pull/18279) sets the unscoped default. File prompts as a
session setting (the `file` entry of the unhandled prompt behavior) belong to
[#17672](https://github.com/SeleniumHQ/selenium/pull/17672).

| Binding    | Current behavior |
|------------|------------------|
| Java       | `Actions` over classic. Public `@Beta` BiDi module `org.openqa.selenium.bidi.module.Input` whose `perform(context, Collection<Sequence>)` takes the classic `Actions` sequences and rewrites element origins; also `release` and `setFiles` by context. |
| Python     | `ActionChains` and `ActionBuilder` over classic. `driver.input` returns the generated BiDi module: `perform_actions(context, ...)`, `release_actions(context)`, `set_files(context, ...)` and `add_file_dialog_handler` returning an `int` with a protocol payload. |
| Ruby       | `driver.action` over classic. BiDi input exists only in the generated protocol layer. |
| .NET       | `Actions` over classic. BiDi `Input` module reachable through `AsBiDiAsync()`. |
| JavaScript | `driver.actions()` over classic. Public BiDi `bidi/input.js` with `perform`, `release` and `setFiles` by context id. |

No binding routes its action builder over BiDi, offers a window target for actions, or has a supported
file-dialog API.

## Decision

1. **The action builder stays the input API.** There is no second way to build or perform actions.
   Every existing action builder method keeps its signature and return type. Which protocol performs
   the actions is a binding-private choice that may change per operation without changing the API, as
   [17786](17786-bidi-low-level-behavioral-contract.md) leaves routing to each binding.

2. **Actions can target a window without switching to it.** An action builder accepts an optional
   window target, as a window object from #17681 or a window handle. A window object also offers its
   own action builder. With no target, actions go to the driver's current window, as today. Performing
   actions on a window never changes which window the driver's own commands target and does not bring
   it to the front; the window's `activate` does that.

3. **Actions behave the same on either protocol.** Whichever protocol a binding uses:
   * the sequences sent are the ones the builder built, with element origins translated and nothing
     else changed;
   * input state (pressed keys and buttons, pointer position) belongs to the top-level window; perform
     never releases it, and only the builder's existing reset or release method does;
   * failures raise the errors users already handle: move target out of bounds, stale element or no
     such element for a bad origin, and no such window for a closed window;
   * performing returns once the actions are dispatched and does not wait for a navigation they cause.
     Waiting for that is [#17676](https://github.com/SeleniumHQ/selenium/pull/17676)'s concern.

   A binding must not move an operation between protocols for a window until it has confirmed that both
   protocols share that window's input state in the browsers it supports.

4. **Element commands are not actions.** An element's click, send keys and clear keep their own
   semantics (interactability checks, scrolling into view) and are never re-implemented as actions.

5. **There is no frame target.** Following 17685's rule that a frame is not a scope, actions target a
   window. An element origin inside a frame acts in that element's frame on either protocol.

6. **Setting files is one verb on the driver's `input` entry.** It takes a file input element and one
   path or a list of paths, and replaces the element's selection. When the remote end is remote, local
   files are uploaded first, as send keys does today. Several paths on an input without `multiple`, a
   missing file, or an element that is not a file input raise invalid argument. It follows the
   session's strict file interactability setting. Sending a path with send keys keeps working
   unchanged.

```python
tab = driver.windows.open()
tab.actions().click(editor).send_keys("hello").perform()            # focus does not move
ActionChains(driver, window_handle=tab).key_down(Keys.SHIFT).perform()
driver.input.set_files(upload, ["a.png", "b.png"])                  # replaces the selection
```

7. **File dialogs are a handler family under #17776's rules for passive observers.** The `input`
   entry has an add, a remove and a clear for file-dialog handlers; add returns a registration object
   that remove takes. The payload carries the window object, the file input element when there is one,
   and whether it accepts several files; it offers the set-files verb for that element. A handler is
   scoped by a window or a user context, never both; with neither it observes every window in the
   session, including ones opened later, as #18279 proposes for every unscoped handler. An exception in
   a handler is logged, not raised. A handler does not decide whether the browser shows its native file
   dialog: that is the session's unhandled prompt behavior for file prompts, covered by #17672.

8. **The driver's `input` entry holds only what actions cannot express:** setting files and file-dialog
   handlers. Releasing input is the action builder's existing reset or release method, given a window
   target for another window.

Left to each binding: type and method names, how the window target is passed (constructor argument,
builder method, option), synchronous or asynchronous signatures, and whether the payload's set-files
shortcut exists.

## Considered options

- **Where input lives (decisions 1 and 8).** Chosen: the existing action builders, extended. Rejected: a
  protocol-neutral `perform(sequences, window)` on `driver.input` (a second way to do what the builder
  already does, which users would have to choose between); keeping the BiDi module's verbs behind a
  neutral name (still a protocol shape, ruled out by 17670 decision 3).
- **Targeting (decision 2).** Chosen: an optional target on the builder plus a builder from a window
  object. Rejected: only `switch_to` then perform (moves the session's focus, impossible for one worker
  per window); only the window's builder (code that holds a handle would have to look up the window
  first).
- **Element commands (decision 4).** Rejected: performing click and send keys as BiDi actions to drop
  classic. Actions skip the interactability checks and scrolling users rely on, so behavior would
  change silently.
- **Setting files (decision 6).** Chosen: one verb that replaces. Rejected: send keys only (appends on
  `multiple` inputs, goes through the keyboard path, and cannot be called from a handler for another
  window); appending to match send keys (BiDi `setFiles` replaces, and a test that sets files twice
  expects the second set).
- **File dialogs (decision 7).** Chosen: an input handler family, since the response is to set files on
  an element and BiDi reports it in `input`. Rejected: folding it into #17672's prompt handlers, whose
  verbs (accept, dismiss, text) do not apply to files. The session-level default stays in #17672.

## Consequences

- Users can drive several windows at once with the action builders they already know, and set files
  without switching windows or relying on send keys.
- No existing method changes signature or return type. Each binding adds a window target to its action
  builder, a set-files verb, a file-dialog payload and registration, and a handler family.
- The BiDi input surfaces reachable from the driver or as public modules (Python `driver.input` as it
  is today, Java `bidi.module.Input`, JavaScript `bidi/input.js`, the .NET input module behind
  `AsBiDiAsync()`) are deprecated under 17670 with messages pointing to the action builder or the
  set-files verb, and may be removed no earlier than the next major release. In Python the new
  `driver.input` replaces the old one under the same name, so raw methods are forwarded with a
  deprecation warning until removal.
- Java must add the window target without breaking third-party `Interactive` implementations, for
  example by a new `Actions` constructor or method and default interface methods.
- Bindings that later perform current-window actions over BiDi need tests showing the same input state
  and errors on both protocols (decision 3).
