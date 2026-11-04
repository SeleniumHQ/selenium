# NNNN. An unscoped network handler applies to every window in the session

- Status: Proposed
- Discussion: <!-- link to this record's PR -->

## Context

[17685](17685-network-handler-behavior.md) decision 11 lets a network handler be scoped by a window
handle or a user context. When neither is given, the handler applies to the window the session is on
when it is registered. It stays bound to that window: it does not follow a later `switch_to`, and it
never sees windows opened after registration, such as a popup or a tab a link opens.

This record replaces that default. Two later proposals give "no scope" the other meaning. In
[17776](https://github.com/SeleniumHQ/selenium/pull/17776) decision 8, unscoped script handlers and
pinned scripts apply to every tab, present and future. In
[17681](https://github.com/SeleniumHQ/selenium/pull/17681) decision 9, an unscoped window event handler
observes every window in every user context, including ones opened later. If 17685 keeps its default,
the same call shape, a handler with no scope argument, means one window for network and every window
for script and window events.

The narrow default also surprises users on its own. A handler that blocks trackers, stubs an API or
adds a header stops applying as soon as the page opens a popup or the test opens a second tab, and
nothing reports that it is missing those requests. No binding ships 17685's scoping yet, so the
default can change without breaking user code.

| Binding    | Current behavior |
|------------|------------------|
| Java       | 17685 handler scoping not shipped. |
| Python     | Proposed in [#18051](https://github.com/SeleniumHQ/selenium/pull/18051), not merged. |
| Ruby       | 17685 handler scoping not shipped. |
| .NET       | 17685 handler scoping not shipped. |
| JavaScript | 17685 handler scoping not shipped. |

## Decision

1. **A network handler registered without a scope applies to every window in the session**, in every
   user context, including windows opened after it was registered. This replaces only the default in
   17685 decision 11. The rest of decision 11 stands: a handler may be scoped by a window handle or a
   user context, never both, and acts only on events in its scope.
2. **Scoping to the current window is explicit.** A user who wants the old behavior passes the current
   window handle (or window object) as the scope. Bindings do not add a separate flag for it.

## Considered options

- **Keep 17685's default** (the window current at registration). Rejected: one call shape would mean
  different things for network, script and window events, and a handler would silently miss popups
  and new tabs.
- **Follow the current window** (re-bind on each `switch_to`). Rejected: a handler would change scope
  as a side effect of unrelated commands, and a worker's tab would drop out of scope when another
  worker switched.
- **Require a scope on every network handler.** Rejected: adds ceremony to the common single-tab case
  and still leaves network unlike script and window events.

## Consequences

- An unscoped handler means the same thing for network, script and window events.
- Interception pauses matching requests in every window, so in a session shared by several workers an
  unscoped request handler affects all of their tabs. Code that wants one tab passes that tab as the
  scope.
- Bindings implementing 17685 subscribe and add intercepts without a context list when no scope is
  given, and do not filter events to the registration window.
- When this record is accepted, 17685's status line records that decision 11's default scope is
  superseded by this record.
