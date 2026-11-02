# 17681. Windows are objects, reached through `driver.windows`

- Status: Proposed
- Discussion: [#17681](https://github.com/SeleniumHQ/selenium/pull/17681)

## Context

Users increasingly work with more than one tab: a link opens a popup, a test drives two users side by
side, a worker per tab runs in parallel. Today the only thing a user holds for a tab is its window
handle, a bare string. To act on a tab they must switch the whole session to it, which moves the target
of every later command and makes one-tab-per-worker code impossible. There is no way to open a tab
without switching to it, to watch a tab navigate, to see downloads, or to open a tab with its own
cookies and storage.

WebDriver BiDi can do all of this, but under [17670](17670-bidi-implementation-boundaries.md) it may
not reach users as BiDi types. [17685](17685-network-handler-behavior.md) decision 11 already scopes
handlers by a **window handle** or a **user context**, and
[17776](https://github.com/SeleniumHQ/selenium/pull/17776) uses the window handle as the target for
script, leaving "how window handles relate to user contexts" to a separate record. This is that record.
Each binding's current browsing-context surface is a different shape of protocol wrapper, and none is a
supported API.

## Decision

1. **A window is an object, not a string.** Each binding has one window type (named `Window` here)
   for one top-level window or tab. Two window objects are equal when they denote the same window, and
   the object exposes its handle for logging and interop. Everywhere the API takes a window handle
   (switching windows, the `window_handle` scope in 17685 and 17776) it also accepts a window object.
   Existing methods that return handle strings keep doing so; the new API never returns one.

2. **Windows are reached through a `windows` entry on the driver**, alongside `network` and `script`.
   It opens a window, lists the open top-level windows, and returns the current one. Opening a window
   does not change which window the driver's own commands target.

3. **A window carries the navigation and capture verbs, named as they are on the driver**: `get`,
   `refresh`, `back`, `forward`, `close`, `screenshot` and `print_page`, plus `activate` (bring to the
   front) and `switch_to` (make it the driver's current window). It reads `title`, `url`, `opener` and
   `user_context`. Acting on a window never moves the driver's focus, except `switch_to`, and closing the
   driver's current window, which behaves as the driver's `close` does.

4. **Results are objects; plain values stay plain.** Navigation verbs return a navigation result with
   the window and the final URL after redirects. `screenshot` and `print_page` return objects giving the
   bytes, the base64 text and a save-to-file method. Titles and URLs remain strings. No result is a
   protocol type.

5. **A window's own navigation returns as the page load strategy says.** When `get`, `refresh`, `back`
   or `forward` on a window returns is decided here: when the session's page load strategy is met, or
   with a timeout error after the page load timeout. A per-call `wait` may override it with `none`,
   `interactive` or `complete`. Waiting for navigations the caller did not start is left to
   [#17676](https://github.com/SeleniumHQ/selenium/pull/17676).

```python
tab = driver.windows.open()                       # focus does not move
tab.get("https://example.com").url                # final URL, after the page has loaded
tab.screenshot(full_page=True).save("page.png")
```

6. **A window means its top-level document.** Window operations act on the top-level document even
   while the driver is switched into a frame. Frames are not window objects, matching 17685's rule that
   a frame is not a scope.

7. **Errors are the ones users already handle.** Using a window that has closed, or never existed,
   raises the binding's no-such-window error. A window object stays valid as a value after its window
   closes; only operations on it fail. User prompts are covered by
   [#17672](https://github.com/SeleniumHQ/selenium/pull/17672).

8. **A user context is the isolation unit, and windows are created from it.** A user context is an
   object holding its own cookies, storage and permissions. A window's user context is fixed when it is
   opened:
   * `driver.windows.open(isolated=True)` opens a window in a new user context that is removed when that
     window closes. Removing it closes every window still in it, such as popups the window opened.
   * `driver.windows.create_user_context()` returns a user context that opens and lists windows, and is
     removed explicitly or at the end of a scoped block where the language has one. Removing it closes
     its windows and discards its storage.
   * A new user context inherits the session's accept-insecure-certificates, proxy and unhandled prompt
     behavior settings unless told otherwise. If the browser cannot apply one of them to a user context,
     creating it fails with an error naming the setting; it is never silently dropped.

9. **Window events follow the handler rules of 17685 and 17776.** Three families: navigation (one
   family, with the stage on the payload: started, committed, DOM content loaded, load, failed,
   fragment, history), window opened or closed, and download (started, finished). Each family has an
   add, a remove and a clear; add returns a registration object that remove takes. Payloads carry the
   window object. An exception in a handler is logged, not raised. A handler is scoped by a window or a
   user context, never both; with neither it observes every window, present and future. Registering on a
   window or user context object is the same as passing it as the scope.

Left to each binding: type names and packaging, synchronous or asynchronous signatures, how a scope is
passed, and whether a scoped block for user contexts exists.

## Considered options

- **Window model.** Chosen: an object reached through `driver.windows`, which gives multi-tab and
  parallel code a unit to hold and fits the window-handle scoping 17685 and 17776 chose. Rejected:
  handle strings plus a `window_handle` argument on every call (nothing to hang `title`, `url` or events
  on); a string subtype (not possible in every language, blurs equality); a flat protocol module on the
  driver (the earlier draft; ruled out by 17670 decision 3); methods directly on the driver
  (`driver.new_tab()`, grows the driver into a catch-all); returning windows from `switch_to` (which is
  about moving focus); a Playwright-style asynchronous page model (out of proportion for synchronous
  bindings).
- **Results (decision 4).** Chosen: objects for navigation, screenshot and print. Rejected: plain URLs,
  base64 strings and bytes as the driver returns today, which need a method per output format and give
  nothing to extend.
- **Navigation waits (decision 5).** Chosen: the page load strategy, with a per-call override. Rejected:
  always waiting for `complete` (ignores a strategy the user configured) and never waiting (every caller
  must add their own wait, and results would report URLs that are not final).
- **Isolation (decision 8).** Chosen: `isolated=True` plus a user context object. Rejected: the object
  as the only route, which makes everyone who wants one clean tab learn a two-step model.
- **Events (decision 9).** Chosen: one navigation family with the stage on the payload. Rejected: one
  family per stage (seven add/remove/clear sets for one concept). For the default scope, observing only
  the current window was considered; a handler that silently stops firing after a switch was judged the
  larger surprise.

## Consequences

- Users can open, drive, capture and observe several windows at once without switching, and give each
  worker its own window.
- Every binding adds a window type, a user context type, result types, and registration and payload
  types for three event families. Methods that take a window handle accept a window object; no existing
  return type changes.
- The existing browsing-context surfaces reachable from the driver are deprecated under 17670 when this
  record is accepted, with messages pointing to the equivalent `windows` call, and may be removed no
  earlier than the next major release.
- Event scoping must be tracked per window and per user context, since some bindings today key
  subscriptions by event name only.
- Java must resolve the clash between the new window type and the existing nested `WebDriver.Window`,
  and must add `windows()` to `WebDriver` as a default method so third-party implementations do not
  break.

## Appendix

Reference implementation (Python, draft): [#18269](https://github.com/SeleniumHQ/selenium/pull/18269),
with tests on classic and BiDi sessions. It does not yet pass the proxy or prompt settings to new user
contexts (decision 8).
