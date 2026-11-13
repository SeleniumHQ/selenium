# 18283. Alert handling behavior for BiDi sessions

- Status: Proposed
- Discussion: [#18283](https://github.com/SeleniumHQ/selenium/pull/18283)

## Context

Alerts block the browser page until they are accepted or dismissed. 
Traditionally, users had to always explicitly switch to alerts to manage them. 
If they didn't and executed a non-alert command, the driver would error.
The W3C added the `unhandledPromptBehavior` capability as a way to automatically handle alerts that weren't explicitly handled.
Users could handle the ones they wanted and auto-dismiss/accept with or without errors depending on their use case.

BiDi makes backwards compatibility difficult for three reasons:
1. BiDi requires managing alerts when they open instead of on the next command
2. BiDi commands hang when alerts are opened preventing synchronous handling
3. BiDi supports different values of `unhandledPromptBehavior` with a different type (it wants a map when classic must be a string)

BiDi also supports interacting with `beforeUnload` prompts (the alert that asks if you want to navigate away from a page), which classic does not.

**Binding Status**
* All bindings require users to set `unhandledPromptBehavior` to some value of "ignore" to work with alerts in a BiDi session at all, since the default (`dismiss and notify`) automatically dismisses *all* alerts as soon as they are opened (without the expected error).
* No binding directly supports async alert handling, which means:
  * A BiDi command (script, navigation, click) that opens an alert will hang until the binding's response timeout (30 seconds by default) when `unhandledPromptBehavior` is set to ignore (classic commands that open an alert will still work)
* No bindings prevent BiDi commands from executing when an alert is open

## Decision

1. **Alert handlers may be added or removed through `driver.alerts`.** Like `driver.network` ([17685](17685-network-handler-behavior.md)),
the handlers live on a domain off the driver, and a registered handler applies to every window.
`addHandler` returns a handle object; `removeHandler` takes that handle and unregisters exactly that handler.
There is no clear alert handlers equivalent. A binding may implement a way to add and remove a handler on behalf of a user so it applies for a specific block of code.

2. **A handler is a callable that acts on the alert object.** Inside the async handler the user has access to an alert object
that describes its type and the default value of a prompt, and can read text, send keys, accept or dismiss just like in the current Alert API.
The alert object acts on the alert that triggered the handler, regardless of which window the driver is on.

3. **Support existing synchronous Alert API.** By default, a user must be able to wait for alerts and access open alerts regardless
of how they were opened. This is required for backwards compatibility with existing code.

4. **Support classic Configuration.** All five classic values of `unhandledPromptBehavior` capability must be supported with their classic behavior
and apply to `alert`, `confirm`, and `prompt` dialogs. The default for those dialogs will continue to be `dismiss and notify`.
`beforeUnload` prompts must be accepted by default. Any support for users to set the BiDi version of `unhandledPromptBehavior` with the map
must be deprecated and removed.

5. **Registering an async handler removes backwards compatibility.** When a user adds an alert handler (until it is removed), they are opting out of
all support for `unhandledPromptBehavior` values. Users need to manage alerts through their handler, including `beforeUnload` prompts, and Alert API commands must error.

6. **Only the most recently added handler is called.** Unlike Network handlers, events are not passed along a chain, 
any previously registered handlers are ignored so users can scope handlers to specific alert instances.
Removing that handler makes the one added before it the handler that is called; removing the only handler restores decisions 3 and 4.

7. **Handlers must manage disposition and errors.** 
An exception in the callable is not caught on behalf of the user, it is always surfaced.
An alert must not be closed for the user after the callable is executed; a handler may pass the alert object to the main thread to act on later.


```ruby
handle = driver.alerts.add_handler { |alert| alert.type == 'beforeUnload' ? alert.accept : alert.dismiss }
click_button_opening_alert
driver.alerts.remove_handler(handle)
```

```java
var handle = driver.alerts().addHandler(alert -> {
  if (alert.getType() == AlertType.BEFORE_UNLOAD) alert.accept(); else alert.dismiss();
});
clickButtonOpeningAlert();
driver.alerts().removeHandler(handle);
```

## Considered options

- **Registration (decision 1).**
  - Methods directly on the driver. Rejected: [17685](17685-network-handler-behavior.md) already rejected top-level
    driver methods for network handlers, so a different shape for alerts would
    leave users guessing where each family lives.
  - Under `switchTo` next to the Alert API. Rejected: `switchTo` changes the focus of the current context, while a
    handler is a policy for every window; and the Java and .NET target locators are interfaces that third parties implement.
  - On a browsing context accessor.
    Rejected: that is the BiDi module name, which [17670](17670-bidi-implementation-boundaries.md) keeps internal.
  - Name the methods `addAlertHandler` and so on. Rejected: the `alerts` domain already says it.
  - Include `clearHandlers` like network handlers. Rejected: only the newest handler is called (decision 6),
    and users can and should manage this explicitly.
  - Name the API after BiDi's "user prompt". Rejected: "alert" is Selenium's existing word for
    these prompts.
- **The alert object (decision 2).**
  - Filter handlers by prompt type at registration. Rejected: the callable can branch on the
    alert's type rather than requiring Selenium to map everything.
  - Have the alert object act on the driver's current window, as the Alert API does. Rejected: the
    callable cannot know which window to switch to, so the test would have to keep the driver on
    the window where the alert opens.
- **Classic behavior (decisions 3 and 4).**
  - Handlers only: deprecate `unhandledPromptBehavior` and the Alert API in BiDi sessions, and
    dismiss alerts as they open unless a handler takes them. Rejected: every test that handles an
    alert is rewritten as a handler because of a protocol switch the user may not know happened,
    and unexpected alerts pass silently.
  - Keep the Alert API but drop `unhandledPromptBehavior`, so an open alert fails every method
    until the test or a handler settles it, as under `ignore`. Rejected: it is about the same
    work, users who set the capability change their configuration, and one unexpected alert fails
    every later method, including the failure screenshot, where `dismiss and notify` fails one.
  - Leave `unhandledPromptBehavior` to the remote end, as today. Rejected: turning on BiDi for any
    other feature changes how every alert in the suite is handled.
  - Apply `accept` and `dismiss` when the alert opens, through the existing values or a new
    setting. Rejected: a test could no longer read an alert it expects, and a handler already
    does this.
- **Dispatch (decisions 5 to 7).**
  - A chain, as network handlers use. Rejected: an alert has two outcomes and nothing to combine.
  - Fall back to `unhandledPromptBehavior` when a handler leaves an alert open. Rejected: two
    rules with different timing would apply to the same alert.
  - Keep the Alert API working while a handler is registered, or only warn when it is used.
    Rejected: the test and the handler could both act on the same alert, and access can be allowed
    later without breaking anyone.
- **Exceptions (decision 7)** follow [17685](17685-network-handler-behavior.md) decision 7, which
  records the alternatives.

## Consequences

- Current Classic Users:
  - Enabling BiDi requires no code changes
- Current BiDi Users:
  - If users updated `unhandledPromptBehavior` value to a map, they no longer need that and should remove it
  - Sessions that completed only because BiDi has automatically dismissed alerts will now get the errors.
- Bindings must do a lot of work to compensate for what the remote end used to do
  - Always set `unhandledPromptBehavior` to `{"default": "ignore"}` to allow client to handle all prompts
  - Track open alerts and associated contexts
  - Check for alerts before sending commands
  - Manage errors based on capability setting
  - Track and interrupt pending BiDi commands when an alert is opened in that context
