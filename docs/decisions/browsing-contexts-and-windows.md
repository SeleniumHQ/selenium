# NNNN. Windows are managed through a windows namespace, and switching stays explicit

- Status: Proposed
- Discussion:

## Context

Selenium conflates three things under the word "window", and WebDriver BiDi separates them.

A **window handle** identifies a top-level navigable — what a user calls a tab. BiDi's context ids
are the same strings: for a navigable with an associated window handle, the specification requires
the navigable id to be the window handle, so nothing needs mapping between the two protocols.

A **client window** is the operating system window that contains tabs. BiDi reports them through
`browser.getClientWindows` with state, position, and size, sets them through
`browser.setClientWindowState`, and every context reports which client window it belongs to.
Selenium has no concept for this at all: `manage().window().maximize()` acts on the client window
containing the current tab, and there is no way to ask whether two tabs share one.

A **viewport** is the layout area inside a tab, set by `browsingContext.setViewport` along with the
device pixel ratio. Users routinely reach for `manage().window().size` expecting this and get the
operating system window instead.

BiDi also offers operations Selenium cannot express: creating a context in the background rather
than switching to it, closing a context that is not the current one and honoring beforeunload while
doing it, and activating a context so the browser brings it to the front — which is not the same
as switching, since switching changes what commands target while activation changes what the
user would see. And it reports `contextCreated` and `contextDestroyed`, which users approximate
today by polling the handle set. `contextCreated` also fires for frames, distinguishable by a
`parent` field, and replays for contexts that already exist when a subscription starts — those emissions
arrive before the subscribe response, so everything after it is genuinely new.

The existing `Window` type is not a data object. It holds a bridge and nothing else; every method
is a round trip against whatever window the session is currently switched to. It lives under
`manage()`, a historical bucket, and only some bindings have it.

| Binding    | Current behavior |
|------------|------------------|
| Java       | `manage().window()` returns a `WebDriver.Window` facade; handles on the driver; `switchTo().window`. |
| Python     | Flat `maximize_window`, `set_window_rect`, `set_window_size` on the driver; no window object. |
| Ruby       | `manage.window` facade; `switch_to.window`; `switch_to.new_window` takes an optional block. |
| .NET       | Window object under `Manage()`. |
| JavaScript | `manage().window()`. |

## Decision

**1. Switching stays explicit.** A user switches to a window and then acts. No command gains a
target argument, and no type carries the session's target.

**2. A window is a value.** The type returned by listings and events carries the handle, the URL,
the opener's handle, the client window it belongs to, and its user context. It has no behavior:
nothing on it switches, closes, or activates. Behavior on a window value is how a codebase acquires
a context object model, and that is a separate decision (see below).

**3. Window operations live on a `driver.windows` namespace, and take a handle.** It carries the
handles and window values, opens a window or tab, closes one, activates one, and exposes the
handlers for windows opening and closing. Operations name the window they act on; the current
window is the default where a default makes sense.

**4. Opening a window does not have to switch to it.** The namespace can open a tab or window in
the background, optionally relative to a reference window and in a given user context.
`switchTo().newWindow` keeps its meaning — it opens and switches, by definition — and is not
deprecated.

**5. Client windows are a separate type, and they do have behavior.** A client window exposes its
state, position, and size, and can be maximized, minimized, made fullscreen, or restored. The
asymmetry with rule 2 is deliberate: a client window has no notion of being the target of
commands, so a closed set of geometry operations on it cannot grow into a context model.

**6. Viewport is named viewport, never size.** Setting the layout viewport and the device pixel
ratio is a distinct operation from sizing a client window, and the names say which is which.

**7. `manage().window()` and the flat window methods are deprecated.** They are replaced by the
client window type for geometry and by `driver.windows` for everything else, on the project's
normal deprecation timeline. Python gains the object it never had.

**8. Windows opening and closing are exposed as handlers.** They yield window values. Handlers
observe only: nothing waits for them. A binding filters `contextCreated` to top-level contexts, so
frames do not arrive as windows, and discards the replay that a subscription produces for windows
that already exist — a window that existed before a handler was registered is not a window that
opened.

**9. Frames, and contexts as command targets, are out of scope.** Addressing a frame without
`switchTo().frame()`, and acting on any context without switching to it, is one further decision
that changes how every command targets a document. This record deliberately does not take it, and
nothing here forecloses it: window values gaining behavior later is exactly the step that decision
would take.

**10. User contexts are an identifier, not an API.** A user context appears where a window is
opened in one, and where a window value reports the one it belongs to. Creating, listing, and
removing user contexts, and configuring capabilities per user context, are not settled here.

## Considered options

- **`driver.window` (singular) as the namespace name** — reads better for operations on the
  current window, worse for listing and opening. Rejected on balance: most of what the namespace
  does is about windows in the plural, and the singular invites the same "which window is this
  about" ambiguity that `manage().window()` already has.
- **Extend `manage().window()` instead of replacing it** — add the new operations to the existing
  facade. Rejected: the facade's subject is implicit, which is the root of the confusion this
  record is trying to remove, and Python has no such facade to extend.
- **Give window values behavior** — `window.activate`, `window.close`, `window.switch_to`.
  Rejected: it reads well and it is the context object model by another name, arriving without the
  decision being made. If that model is adopted later, this is the step it takes, deliberately.
- **Fold client windows into the window type** — one type for tabs and operating system windows.
  Rejected: they have different lifetimes, different identity, and different operations, and
  merging them would preserve exactly the conflation this record exists to end.
- **Keep geometry where it is and add only the new operations** — leave `manage().window()` alone.
  Rejected: two homes for window operations is worse than one, and the deprecation is the only way
  to get to one.
- **Expose the window events only as a one-shot wait** — a `wait_for_new_window` and no handler.
  Rejected: the event carries the opener, the URL, and the client window, none of which a wait
  returns, and a wait composes from a handler in a few lines while the reverse is not true.

## Consequences

The three meanings of "window" become three names, which is the point and also the cost: users
learn that `manage().window().size` was the operating system window and that what they wanted is
usually the viewport. Every binding deprecates something; Python deprecates the most, since its
window operations are flat on the driver.

Selenium gains operations it has never had — background tabs, closing a window without switching,
activation, and knowing which tabs share an operating system window — and the event-driven view of
windows appearing and disappearing. Polling the handle set keeps working, so nothing forces a
migration.

The deliberate asymmetry between window values and client window objects is the part most likely to
be argued in review, and the record should be read as taking a position on the context object model
rather than as an inconsistency: values stay inert precisely so that adopting the model later is a
decision someone makes rather than one that accumulates.

Follow-up decisions this makes necessary: frames and contexts as command targets; user context
lifecycle and per-user-context capabilities; and whether the handler conventions this record shares
with the navigation and file records should be lifted into one place rather than restated.
