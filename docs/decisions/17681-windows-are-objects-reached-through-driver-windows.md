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

WebDriver BiDi can do all of this: every command and event takes the browsing context it applies to, and
user contexts give isolated storage partitions. Under [17670](17670-bidi-implementation-boundaries.md)
none of that may reach users as BiDi types; it needs a protocol-neutral API. Two accepted or proposed
records already settle part of the vocabulary:

- [17685](17685-network-handler-behavior.md) decision 11 scopes network handlers by a **window handle**
  or a **user context**, never both, and states that a frame is not a scope.
- [17776](https://github.com/SeleniumHQ/selenium/pull/17776) (script) uses the window handle as the
  durable target for `execute`, `pin` and handlers, and leaves "how window handles relate to user
  contexts" to a separate record. This is that record.

The bindings' browsing-context surfaces diverge, and none is a supported API:

| Binding    | Current behavior |
|------------|------------------|
| Java       | `org.openqa.selenium.bidi.browsingcontext.BrowsingContext`, constructed with the driver and an id; ids are strings; events through a separate `BrowsingContextInspector`. |
| Python     | `driver.browsing_context` returns the generated BiDi module; every command takes a context id string; events registered by name on the module. |
| Ruby       | Browsing context is internal to the bridge; no user-facing API. |
| .NET       | `BrowsingContext` objects from the `IBiDi` module, reached through `AsBiDiAsync()`. |
| JavaScript | `BrowsingContext` objects from the `bidi` namespace, constructed with the driver. |

Everywhere, the classic API hands users bare handle strings, and the BiDi surfaces return protocol
structures (context info, navigation results, base64 payloads) rather than objects.

## Decision

1. **A window is an object, not a string.** Each binding has one window type (named `Window` in this
   record) representing one top-level window or tab. Two window objects are equal when they denote the
   same window, and the object exposes its window handle for logging and interop. Everywhere the API
   takes a window handle (switching windows, the `window_handle` scope in 17685 and 17776) it accepts a
   window object as well as a string. Existing methods that return handle strings keep doing so; the
   new API never returns one.

2. **Windows are reached through a `windows` entry on the driver**, alongside `network` and `script`.
   It opens a window, lists the open top-level windows, and returns the current one. Opening a window
   does not change which window the driver's own commands target.

```python
tab = driver.windows.open()                # a Window; focus does not move
for w in driver.windows.all(): print(w.title)
here = driver.windows.current
```
```java
Window tab = driver.windows().open(WindowType.TAB);
List<Window> all = driver.windows().all();
```

3. **A window carries the navigation and capture verbs, named as they are on the driver**: `get`,
   `refresh`, `back`, `forward`, `close`, plus `screenshot` and `print_page`, and two that only make
   sense per window: `activate` (bring to the front) and `switch_to` (make it the driver's current
   window). It reads `title`, `url`, `opener` and `user_context`. Acting on a window never changes which
   window the driver's own commands target, except `switch_to`, and closing the driver's current window,
   which behaves as the driver's `close` does.

4. **Results are objects; plain values stay plain.** Navigation verbs return a navigation result
   carrying the window and the final URL after redirects. `screenshot` returns a screenshot object and
   `print_page` a printed-page object, each giving the bytes, the base64 text, and a save-to-file
   method, so one call replaces the per-format methods on the driver. Titles and URLs remain strings.
   Handlers return a registration object (decision 9). No result is a protocol type.

```python
nav = tab.get("https://example.com")       # nav.url is the final URL
tab.screenshot(full_page=True).save("page.png")
pdf_bytes = tab.print_page().pdf
```
```java
Navigation nav = tab.get("https://example.com");
tab.screenshot(ScreenshotOptions.fullPage()).save(Path.of("page.png"));
```

5. **Navigation waits as the session's page load strategy says, unless told otherwise.** By default a
   navigation verb returns when the strategy's condition is met and fails with a timeout error after the
   session's page load timeout. A per-call `wait` may override it with `none`, `interactive` or
   `complete`, the document ready states.

6. **A window means its top-level document.** Window operations act on the top-level document even
   while the driver is switched into a frame. Frames are not exposed as window objects, matching 17685's
   rule that a frame is not a scope.

7. **Errors are the ones users already handle.** Using a window that has closed, or that never existed,
   raises the binding's no-such-window error. A window object stays valid as a value after its window
   closes; only operations on it fail. A user prompt that opens during a navigation is handled as the
   session's unhandled prompt behavior says.

8. **A user context is the isolation unit, and windows are created from it.** A user context is an
   object holding its own cookies, storage and permissions. A window's user context is fixed when it is
   opened, so isolation is chosen at creation:
   * `driver.windows.open(isolated=True)` opens a window in a new user context that is removed when that
     window closes. This covers the common case of "a clean tab" without the user meeting the object.
   * `driver.windows.create_user_context()` returns a user context that opens windows, lists them, and
     is removed explicitly, or at the end of a scoped block where the language has one. Removing it
     closes its windows and discards its storage.
   * A new user context inherits the session's accept-insecure-certificates, proxy and unhandled prompt
     behavior settings unless told otherwise, so an isolated window behaves like the session the user
     configured.

```python
with driver.windows.create_user_context() as profile:
    a = profile.open()
    b = profile.open()                     # shares a's cookies, not the main session's
```
```java
try (UserContext profile = driver.windows().createUserContext()) {
  Window a = profile.open(WindowType.TAB);
}
```

9. **Window events follow the handler rules of 17685 and 17776.** Three families: navigation (with its
   stage: started, committed, DOM content loaded, load, failed, fragment, history), window opened or
   closed, and download (started, finished). Each family has an add, a remove and a clear; add returns a
   registration object that remove takes. Payloads are shaped objects that carry the window object, not
   a handle string or a protocol structure. An exception in a handler is logged, not raised, since these
   are passive observers. A handler is scoped by a window or a user context, never both; with neither it
   observes every window, present and future. Registering on a window or user context object is the same
   as passing it as the scope.

```python
reg = driver.windows.add_navigation_handler(lambda n: log(n.window.title, n.url, n.stage), window_handle=tab)
driver.windows.remove_navigation_handler(reg)
tab.add_download_handler(lambda d: saved.append(d.path))
```
```java
Registration reg = driver.windows().addNavigationHandler(n -> log(n.getUrl()), tab);
driver.windows().removeNavigationHandler(reg);
```

Left to each binding: the type names' casing and packaging, synchronous or asynchronous signatures, how a
scope is passed (keyword, overload, options object), and whether a scoped block for user contexts exists.
User prompts are left to their own record, which should take the same window and user context scope.

## Considered options

- **A window object reached through `driver.windows` (chosen).** One object per window gives multi-tab
  and parallel code a unit to hold and hand to a worker; reusing the driver's verb names means nothing new
  to learn; it fits the window-handle scoping 17685 and 17776 already chose.
- **Keep handle strings and add a `window_handle` argument to every operation.** Consistent with the
  existing scope argument and smallest to build, but users still thread a string through every call and
  get nothing to hang `title`, `url` or events on. Rejected; the scope argument stays, accepting objects.
- **A window type that is a string subtype.** Keeps the object usable wherever a string is, but invites
  string operations on it, is not possible in every language, and blurs equality and serialization.
  Rejected in favour of accepting objects wherever handles are taken.
- **Handle objects alongside a flat per-protocol module on the driver** (the earlier draft of this
  record). Rejected by 17670 decision 3: a protocol module reachable from the driver reads as supported,
  and two surfaces leave users unsure which to use.
- **Window operations as methods directly on the driver** (`driver.new_tab()`). Fewer characters, but
  grows the driver into a catch-all; a `windows` entry keeps the surface grouped as `network` and
  `script` are.
- **Extend `switch_to` to return window objects.** `switch_to` is about moving the session's focus, the
  opposite of acting on a window without moving it. Rejected.
- **A user context object as the only route to isolation.** Makes everyone who wants one clean tab learn
  a two-step model. Rejected for `isolated=True` on open, with the object for the shared-partition case.
- **A full asynchronous page model in the style of Playwright.** Out of proportion for synchronous
  bindings and a separate question; the window object does not preclude it.

## Consequences

- Users can open, drive, capture and observe several windows at once without switching, and give each
  worker its own window.
- Every binding adds a window type, a user context type, result types for navigation, screenshot and
  print, and registration and payload types for three event families.
- Methods that take a window handle accept a window object; this is additive, and no existing return
  type changes.
- The existing browsing-context surfaces in the table above stop being the way to do these things. In
  bindings where they are reachable from the driver, they are deprecated under 17670 with messages
  pointing to the equivalent `windows` call.
- Event scoping must be tracked per window and per user context in each binding, since some bindings
  today key subscriptions by event name only.
- Java must resolve the clash between the new window type and the existing nested `WebDriver.Window`
  through packaging or naming.
