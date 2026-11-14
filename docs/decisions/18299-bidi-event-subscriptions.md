# 18299. Behavioral contract for low-level event subscriptions

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18299

## Context

[ADR 17670](17670-bidi-implementation-boundaries.md) keeps the BiDi implementation internal and suggests
that a user be able to reach event subscriptions through that layer.
[ADR 17786](17786-bidi-low-level-behavioral-contract.md) fixed how event payloads are typed and validated,
but explicitly deferred decisions about "event subscription and routing." This record describes what a
caller can rely on when it listens for an event through the low-level layer. The caller is either a
supported API class such as `driver.network` ([ADR 17685](17685-network-handler-behavior.md)),
or a user composing the low-level layer with the driver.

These facts about the protocol shape the decisions:

* A subscription is state the remote end holds. The `session.subscribe` command is optionally scoped by browsing
  contexts or by user contexts, and returns an id.
* The remote end accepts any browsing context id, but subscribes the whole page the context belongs to, frames included.
* What runs when an event payload arrives is not a protocol concept; the client decides.
* The remote end sends each event payload once regardless of how many subscriptions were made to the event.
* Event payloads may contain a browsing context id, but the id may be related to any context on a page and will not always map to the browsing context id provided by the subscription.

### Terms

To keep these concepts distinct, this record uses terms in the following way:
* *Caller* - the consumer of the low-level layer, whether a supported API class or a user composing it with the driver.
* *Handler* - the callable a caller sends to a public Selenium class (high-level API) along with optional filters to be invoked with matching event payloads.
* *Subscription* - the remote end's record that it sends an event's payloads to this session, made with `session.subscribe` and named by the id it returns.
* *Listener* - the callable a caller adds to the low-level layer for an event. It is local to
  the client and independent of the subscription.
* *Event* - the spec-defined action being subscribed to.
* *Event payload* - the instance of an emitted event sent by the browser.

### Bindings today

Each binding has a general listener (Java's `BiDi.addListener`, JavaScript's `addCallback`, .NET's
`SubscribeAsync`, Python's `add_event_handler`, Ruby's WebSocket callbacks), and each differs on whether
listeners are independent of subscriptions, what an exception in a listener does,
and what reaches a listener when a payload cannot be typed.

## Decisions

1. **Listeners**
   * A caller must be able to add and remove a listener for any event defined in the declared schema the layer validates against.
   * The add and remove methods must be on the low-level modules, not on the connection directly.
   * Adding and removing listeners must not send anything to the remote end.
   * Adding a listener supports two execution modes: sequential (default) and concurrent (see Invocation section below)
   * Removing the same listener multiple times must not error.
   * The listener must not be invoked with event payloads received after the remove call.
   * Removing a listener must not prevent any running invocations of that listener from finishing.
   * Removing a listener supports two modes
     * Discard (the default): The listener must not be invoked with any received event payloads whose invocation has not begun, and the call to remove must return without waiting for invocations to finish (this allows a listener to remove itself).
     * Drain: The listener must be invoked with every event payload received before the call, and all invocations must finish before the call to remove the listener is returned. This allows callers to prevent results from slow listeners from being truncated.
2. **Invocation**
   * A listener must be invoked with every incoming event payload matching its event; managing context scope is not the responsibility of this layer.
   * An event payload received for an event with no active listener must be dropped and must not surface an error.
   * A running listener must be able to receive responses to commands and must not delay invocations of other listeners.
   * Listener execution differs based on mode:
     * Sequential (default): each listener must be invoked with one event payload at a time in the order they are received.
     * Concurrent: each listener must be invoked with each matching event payload as it arrives without waiting for previous invocations to finish.
3. **Failures**
   * The caller is responsible for handling exceptions inside a listener. Unhandled exceptions must be logged as an
     error and must not affect the connection or any other current or future listener invocation.
   * An event payload that fails validation (ADR 17786) must be logged as an error and must not be delivered to any listener.

Illustratively:

```python
browsing_context = BrowsingContext(driver)
listener = browsing_context.add_listener("browsingContext.contextCreated", on_created)
subscription = Session(driver).subscribe(events=["browsingContext.contextCreated"])

Session(driver).unsubscribe(subscriptions=[subscription])
browsing_context.remove_listener(listener)
```

```java
BrowsingContext browsingContext = new BrowsingContext(driver);
Listener listener = browsingContext.addListener(BrowsingContext.CONTEXT_CREATED, onCreated);
String subscription = new Session(driver).subscribe(List.of("browsingContext.contextCreated"));

new Session(driver).unsubscribe(List.of(subscription));
browsingContext.removeListener(listener);
```

The method names, whether they are offered per module or per event, how an event and the execution mode are
given to them, how a listener is identified for removal, and how the removal mode is chosen and a Drain awaited
are left to each binding.

## Considered options

1. **Listeners**
   - **Adding a listener also subscribes.** Rejected: to scope the listener to its own subscription the layer
     would have to track the context tree for the life of the session, and a remove that carries an
     unsubscribe can be refused where a local remove cannot.
   - **Listeners are added on the connection** or the object that wraps it. Rejected: it is neither a module of
     the spec nor reached by composing one with the driver, which is the surface ADR 17670 keeps, and the event's
     typed payload lives in its module.
   - **Drain as the only removal mode.** Rejected: a listener removing itself from a sequential queue would keep
     being invoked until the queue emptied, and a caller with a backed-up listener would have no way to discard
     the backlog.
   - **A wait for an idle listener, separate from removal.** Rejected: the case that needs it is teardown, where
     the caller is removing the listener anyway; a caller reading what a listener has collected mid-session
     still has to wait for the browser's side of the gap, which no local wait closes.
   - **Removing an already removed listener is an error.** Rejected: a listener that removed itself is removed
     again by its caller's teardown, so correct code hits the case routinely.
   - **The caller tracks when its listener is idle.** Rejected: a listener sees each payload it is invoked with
     but nothing tells it how many are still pending, so only the layer can answer.
2. **Invocation**
   - **A scope on the listener, matched on the client.** Rejected: a match on the exact browsing context id
     misses a window's frames, a match on the page needs the context tree, and either gives "browsing
     context" a second meaning next to the one on `session.subscribe`.
   - **One execution mode for every listener.** Rejected: order the layer discards cannot be recovered by a
     listener that needs it, and a listener that sends a command per payload cannot escape sequential execution
     except by handing each payload off itself.
   - **Concurrent as the default.** Rejected: a listener that overlaps without asking to has a race it cannot
     see, while one serialized without asking to has a delay it can see and a one-argument fix. The default
     reaches only a caller composing the layer; each supported API sets its own mode.
   - **Forbid commands inside a listener** instead of guaranteeing their responses, as WebDriverBiDi.NET's
     synchronous default does. Rejected: the supported APIs settle held requests from inside a listener.
3. **Failures**
   - **Report a listener's exception to the caller** through an error event or callback. Rejected: the layer
     has no caller to report to beyond the listener itself.
   - **Deactivate a listener after it throws.** Rejected: a held request the listener would have settled then
     waits for nothing.

## Consequences

- A listener and a subscription have separate lifetimes, both in the caller's hands. One subscription
  can feed many listeners and many subscriptions one listener; removing one side leaves the other in
  place, and neither state is an error.
- A listener may be invoked with payloads another subscription in the session caused, the supported
  API's own included. A caller that wants only a window's payloads compares the payload's context
  itself, and one that wants the window's frames as well needs the context tree.
- An intercept holds requests on its own, and the remote end reports a held request only to a session
  subscribed at that moment. A caller adds its listener and subscribes before adding the intercept, and
  removes the intercept first; otherwise a request is held with nothing to settle it. A held request
  whose payload fails validation is never delivered either, and the browser times it out.
- By default a listener may share state across invocations and rely on one finishing before the next
  begins. A listener that requests concurrent execution must be safe to invoke while an earlier invocation
  is still running.
- A sequential listener that sends a command per payload lags by one round trip per payload, which against
  a remote end is the page's request count in round trips; a listener that releases held requests
  requests concurrent execution.
- A sequential listener that falls behind accumulates payloads in memory. The layer neither drops them nor
  slows the remote end, since the protocol has no flow control and stalling the socket would also stall
  command responses; a caller whose listener cannot keep up requests concurrent execution or does less per
  payload, and removes it with Drain before reading what it collected.
- Discard returns at once, so a listener that removes itself uses it; under concurrent execution other
  invocations of that listener may still be running when it returns. Drain waits for them, so it is the
  teardown call, and a listener that requested it from inside its own invocation would wait on itself.
- Every binding's event layer changes from what its general listener does today. The changes land in
  the low-level layer, which ADR 17670 keeps outside the deprecation policy; the public surfaces are
  deprecated per ADR 17670 with the listener methods of decision 1 as the alternative, and a user who needs
  an event the supported API does not expose composes the low-level layer with the driver.
- The supported API classes build on these guarantees and do not repeat them. Each sets the execution
  mode for its own listeners, and they need not agree; the layer runs both modes, so none of them runs
  threads or a queue of its own.
