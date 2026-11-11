# 18299. Behavioral contract for low-level event subscriptions

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18299

## Context

[17670](17670-bidi-implementation-boundaries.md) keeps the BiDi implementation internal, and it suggests
that a user be able to access event subscriptions via that layer.
[17786](17786-bidi-low-level-behavioral-contract.md) fixed how event payloads
are typed and validated, but explicitly deferred decisions about "event subscription and routing."
This record describes the event behaviors required from the low level, and what a caller can
rely on when it listens for an event through the internal layer. The caller is either a supported API
class such as `driver.network` ([17685](17685-network-handler-behavior.md)), `driver.script` or
`driver.alerts`, or a user composing the internal layer with the driver.

Two facts about the protocol shape the decisions:

* `session.subscribe` scopes a subscription by browsing contexts or by user contexts. The remote end
  accepts any browsing context id, but subscribes the whole page the context belongs to, frames
  included.
* An event payload does not include the subscription id(s) that caused it to be sent by the browser. 
  When two subscriptions for one event have different scopes, the remote end sends each event payload once, 
  and the client cannot tell from the payload which subscription it belongs to.

### Terms
To keep these concepts distinct, this record is using terms in the following way
* *Callable* - code in a closure (lambda/block/proc/delegate/callable/function) to be executed
* *Handler* - the callable a caller sends to a public Selenium class along with optional filters to run against an event.
* *Registration* - the return information from adding a Handler; required for removing the Handler.
* *Listener* - the callable a caller sends to the low-level layer to run against an event. This will bypass any orchestration managed by Selenium for the handlers.
* *Subscription* - the return information from adding a Listener; required for removing the listener.
* *Event* - the spec-defined action being subscribed to
* *Event Payload* - the instance of an emitted event sent by the browser 

### Bindings status

Each binding has implemented a general listener
(Java's `BiDi.addListener`, JavaScript's `addCallback`, .NET's `SubscribeAsync`, Python's `add_event_handler`,
Ruby's WebSocket callbacks) and these differ in substantive ways:

| Behavior (decision) | Java | JavaScript | .NET | Python | Ruby |
|---|---|---|---|---|---|
| A listener can be scoped (1) | Yes | **No**: only a session-wide `subscribe` takes contexts, never a callback | Yes | Yes | **No** |
| A listener is ready before the subscribe command is sent (1) | **No**: registered after the reply | Yes | **No**: created after the reply | Yes | Yes |
| A refused unsubscribe does not keep the listener (2) | **No**: restored | **No**: kept | Yes | Yes | Yes |
| A scoped listener gets exactly the event payloads from its scope (3) | **No**: no client-side matching | **No**: no client-side matching | **No**: matched by exact browsing context id, so a window's frames are dropped | **No**: only the first registration's scope is sent, and nothing is matched | **N/A** |
| Nothing stays registered when subscribing fails (3) | Yes | Yes | Yes | **No**: code still runs | **No**: network handler code still runs |
| Removing or clearing a listener stops only that listener (2, 3) | **No**: clearing unsubscribes the event name for every listener | Yes | Yes | Yes | Yes |
| An error in a listener is isolated (4) | **No**: other listeners for that event are skipped | Yes | **No**: its subscription stops for good | Yes | Yes |

## Decision

1. **Subscribing**
   * Each low-level module with subscribable events must offer a way to add a listener with optional scope for each of its events
   * The add method must be named for its event.
   * The scope must be given as either a browsing context id or a user context id, each a String and each its own
      parameter (sending both will break existing validation against the generated bidi schema).
   * The listener must be ready to accept events before sending the subscription command because some commands explicitly emit event payloads before responding to the command 
   * Adding a listener must return a subscription object.
2. **Unsubscribing**  
   * Each low-level module with subscribable events must offer a way to remove a listener with a subscription object instance
   * The listener must be allowed to finish if it is already running.  
   * The listener must not be applied to any further event payload, even if the unsubscribe command returns an error.
3. **Listener Scope**
   * A listener must be applied to exactly the event payloads it would receive if it were the only subscription in the session.
   * A listener added without a scope must be applied to every event payload of its event, regardless of browsing context or user context (including payloads with no context). 
   * A listener added with a browsing context id must be applied to every event payload from the page that contains that browsing context (this is what the remote end sends per the spec). 
   * Adding or removing other subscriptions must not change which event payloads are applied to a listener.
4. **Listener Execution**
   * While a listener executes, commands, their responses and other listeners' event payloads must still be processed.
   * An unhandled exception inside a listener must be logged as an error and must not affect the connection or any other listener execution, including the same listener executing against other event payloads.
   * An event payload that fails validation must be logged as an error and not delivered to any listener

Illustratively:

```python
network = Network(driver)  # composed with the driver, never a member of it (17670)
subscription = network.add_before_request_sent_listener(on_request, browsing_context=driver.current_window_handle)
network.remove_listener(subscription)
```

```java
Network network = new Network(driver);
Subscription subscription = network.addBeforeRequestSentListener(onRequest, driver.getWindowHandle());
network.removeListener(subscription);
```

How a binding runs listeners, structures its dispatcher, produces the add and remove methods, or
shapes the subscription object is left to it, as 17670 leaves dispatch to each binding.

## Considered options

- **Where a listener is added (decision 1).**
  - Only a generic method per module that takes the event name, the listener and a scope. Rejected
    as the sole way: the listener's payload type is then whatever the name says, so the signature
    cannot carry it, and the caller still has to know the wire name. A binding may offer one
    alongside the per-event methods.
  - A listener-taking `subscribe` on the session module, mirroring the spec, taking several events
    at once. Rejected: `session.subscribe` with several events is all or nothing, so a caller could
    not take the events a browser supports and learn which one it lacks; and the typed payload for
    an event lives in its module, so that is where a caller looks for it. The session module's own
    `subscribe` remains the faithful implementation of the command for a caller who wants a raw
    subscription without a listener; that caller is outside this record.
  - On the connection or the BiDi root object, as the bindings do today. Rejected: it is neither a
    module of the spec nor reached by composing one with the driver, which is the surface 17670
    keeps.
- **One remove method per event** (decision 2). Rejected: the subscription already identifies its
  event, so a per-event remove adds a thing to get wrong without adding a thing the layer can check.
- **One shared subscription per event, matched on the client.** The first listener subscribes, the
  last unsubscribes, and every listener filters. Rejected: removing one listener means re-subscribing
  the rest with a narrower scope, which misses event payloads in between (decision 3).
- **Browser-side scoping only, no client matching** (Java and JavaScript today). Simpler, and it
  matches how event payloads arrive. Rejected: an event payload does not identify its subscription,
  so a listener receives event payloads from another listener's broader subscription.
- **Match on the exact browsing context** (.NET today). Rejected: the remote end subscribes the whole
  page, so a listener scoped to a window would miss event payloads from its frames, which the
  subscription it asked for includes.
- **Restore the listener when an unsubscribe is refused** (Java today). It keeps local and remote
  state in step. Rejected: the thing the caller removed keeps firing.
- **Log a refused unsubscribe instead of raising** (an earlier draft of this record). Rejected: the
  listener is gone either way, and the caller should hear why the remote end disagrees.
- **Require serial delivery per listener, in arrival order** (decision 4; an earlier draft of this
  record). It spares a listener from running against itself and keeps a console log in order.
  Rejected as a requirement: an intercept listener runs once per held request, so serial delivery
  queues a page's concurrent requests behind one another, and an API class that holds requests
  could not release them concurrently. Whether one listener's calls overlap is left to the binding;
  an API class that promises order to its handlers serializes them itself, and one that holds
  events makes sure they do not queue behind one handler.
- **Require concurrent delivery per listener** (decision 4; an earlier draft of this record). Rejected:
  the supported API classes fan out to their handlers from one listener of their own, so the only
  caller it would serve is one composing an intercept listener directly, and .NET delivers one
  subscription's payloads in order by design.
- **Deliver the raw event payload and leave validation to the listener** (decision 4). Rejected: 17786 says the
  layer rejects what it cannot type; a listener would be called with what the layer could not
  validate.
- **Specify a dispatcher design, or mandate generation of the listener methods.** Rejected as 17786
  rejected mandating generation: the behaviors are identical however the layer is built, so the
  contract is the behavior, and conformance is checkable with a fake remote end.

## Consequences

- Each listener has its own subscription: adding a listener sends one subscribe command and returns
  the subscription it made (decision 1), and removing the listener unsubscribes that one
  subscription (decision 2).
- The layer matches event payloads to listeners on the client (decision 3 and the two protocol
  facts), because the remote end cannot be asked to. Most event payloads name a browsing context
  and not a user context, so matching a user-context scope means resolving the context to its user
  context, including contexts created after the listener was added.
- `session.subscribe` and `session.unsubscribe` sent directly through the session module do not touch
  listeners (decisions 1 and 2). A subscription made that way has no listener, so its event payloads are
  dropped and are not an error, as they are after a refused unsubscribe (decision 2). A listener whose
  subscription is unsubscribed that way stays registered and receives nothing until it is removed
  through the layer.
- A refused subscribe or unsubscribe raises as any command error does, and removing a
  listener twice raises because the remote end rejects an unknown subscription id.
- When the connection closes every listener is dropped: nothing arrives on a closed connection, and
  a remove in flight fails as any command does.
- A held request whose event payload fails validation is never delivered (decision 4), so nothing
  in the client settles it and the browser times it out. The log line is the only trace; whether
  `driver.network` does more belongs to 17685.
- An intercept holds requests on its own, and the remote end reports a held request only to a
  session subscribed at that moment and never replays it. A caller pairing a listener with an
  intercept therefore adds the listener before the intercept and removes the intercept before the
  listener; otherwise a request is held with nothing to settle it. 17685 does this inside
  `driver.network`; a caller composing the internal layer does it themselves.
- Every binding changes its event layer:
  - Clearing listeners unsubscribes their subscription ids, never an event name (Java).
  - Java and .NET register a listener before sending the subscribe command instead of after its
    reply, so payloads the remote end emits before replying are not lost.
  - Every binding matches event payloads to each listener's scope on the client, and .NET's match
    includes a window's frames.
  - Python and Ruby stop leaving a listener registered when subscribing fails.
  - Python stops handing a payload it cannot type to the listener as a raw map.
  - A refused unsubscribe removes the listener and raises; Java stops restoring the listener and
    JavaScript stops keeping it.
  - An exception in a listener no longer skips the event's other listeners (Java) or ends the
    subscription (.NET).
- The supported API classes build on these guarantees and do not repeat them. Their records decide
  what a handler receives, how the handlers for one event are ordered or limited, and what an
  exception does; the shared handler conventions are in a companion record.
- The internal layer becomes the replacement 17670 promised for the protocol-shaped surfaces the
  bindings deprecate, such as Python's public `bidi` module and the driver-exposed BiDi accessors
  in Java, Ruby, .NET and JavaScript: a user who needs an event the supported API does not expose
  composes the internal layer with the driver and gets these guarantees.
- Conformance is checkable with a fake remote end, in any language and however the layer is built.
