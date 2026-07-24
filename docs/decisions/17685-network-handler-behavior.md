# 17685. The network async/event API

- Status: Proposed
- Discussion: [#17685](https://github.com/SeleniumHQ/selenium/pull/17685)

## Context

Selenium's network API lets a user observe and rewrite traffic by registering handlers for
requests, responses, and authentication challenges. This record settles two things together: how
handlers are registered, removed, and cleared, and how a handler behaves — including how several
handlers registered for the same phase reconcile to the single response the browser needs.

A user can register more than one handler for the same phase, and matching handlers can disagree: a
shared framework always adds a test header, the local suite stubs a domain, and one test aborts a
single call. Selenium must reconcile that into one response, consistently and obviously.

The behavior is unsettled and the bindings diverge — each grew its dispatch independently, so
ordering, multi-handler resolution, error handling, and what an event exposes are all inconsistent:

| Binding    | Current behavior |
|------------|------------------|
| Java       | Only one matching handler runs, chosen in no defined order (handlers are held in a `ConcurrentHashMap`); disposition is always continue; a throwing handler propagates and leaves the request blocked; return-value driven; no response handler or managed body collection. |
| Python     | An explicit `continue` in a handler fires immediately and wins; otherwise staged outcomes reconcile by `fail` > `provide_response` > `continue`; response handlers have no `fail`; dispatch is FIFO; a throwing handler's staged mutations are still sent; only the mutated event is visible; body is not collected behind the handler. |
| Ruby       | Handlers run in parallel threads, so multi-handler disposition races; exceptions are logged; dispatch is FIFO with no default-continue; only the mutated event is visible; body collection is user-managed. |
| .NET       | No request or response handler API. |
| JavaScript | No request or response handler API. |

Handlers are reached through `driver.network`, the supported protocol-neutral API established by the
BiDi implementation boundaries decision ([#17670](https://github.com/SeleniumHQ/selenium/pull/17670));
nothing here exposes a protocol type.

## Decision

Request and response handlers observe the event, or intercept it and reconcile to one disposition;
authentication handlers supply credentials. Selenium consults intercept handlers one at a time and lets each
dispose of the event as it runs — it does not gather every handler's outcome and reconcile at the
end. There are multiple ways to implement the decisions below; the examples are illustrative
user-facing code in Ruby and Java.

1. **Handlers are added, removed, and cleared.** Each family — request, response,
   authentication — has an add, a remove, and a clear. `add` returns a handle
   object; `remove` takes that handle and unregisters exactly that handler;
   `clear` removes every handler in the family. Removing a handler stops it
   being consulted for later events but does not disturb an event already in
   flight.

   Additionally, a convenience method named `addAuthentication` wraps
   `addAuthenticationHandler`, taking credentials without a callable for the
   primary use case. It returns the same handle as the rest of the family and is
   removed and cleared the same way.

```ruby
handle = network.add_request_handler { |r| r.fail if blocked?(r.url) }
network.remove_request_handler(handle)
network.clear_request_handlers
```

```java
RequestHandler handle = network.addRequestHandler(
    r -> { if (blocked(r.url())) r.fail(); });
network.removeRequestHandler(handle);
network.clearRequestHandlers();
```

2. **URL filtering is declared when an intercepting handler is registered.** By
   default it intercepts every event; patterns narrow it. What they cannot
   express, the user may filter in the callable.

   The argument name is the equivalent of `urlPatterns`. Its values must
   support, in a language idiomatic way, one or more strings and/or objects,
   where the object types are limited to what the BiDi spec directly supports
   and each component takes an optional string value. A binding may also take
   its language's native URL object, passing it on as a pattern string rather
   than deconstructing it to an object. Predicates are not accepted; a user who
   wants one may write it inside the callable.

   Everything specified by an url pattern argument must be resolvable by the
   remote end; no additional filtering is done client-side. Everything else
   errors, including unsupported wildcard matching — the protocol matches
   literally, so a glob is not refused by the remote, it quietly matches
   nothing.

```ruby
# A pattern string or components — an event matches any of them
network.add_request_handler(
  url_patterns: ["https://api.example.com/orders",
                 {hostname: "cdn.example.com"}]
) { |r| r.fail }

# Wildcards are rejected; the matching goes in the callable instead
network.add_request_handler(url_patterns: ["https://*.example.com/"]) # raises
network.add_request_handler(url_patterns: [{hostname: "api.example.com"}]) do |r|
  r.fail if r.url.end_with?(".json")
end
```

```java
network.addRequestHandler(
    List.of(UrlPattern.of("https://api.example.com/orders"),
            UrlPattern.builder().hostname("cdn.example.com").build()),
    r -> r.fail());

network.addRequestHandler(
    UrlPattern.builder().hostname("api.example.com").build(),
    r -> { if (r.url().endsWith(".json")) r.fail(); });
```

3. **A handler is a callable that acts on the event object.** A request or
   response handler may observe it, change it, or settle its disposition
   (decisions 4–6); an authentication handler settles a challenge by supplying
   credentials or cancelling.

```ruby
network.add_authentication_handler do |e|
  (c = vault.credentials_for(e.url)) ? e.authenticate(c) : e.cancel
end

network.add_authentication(username: "user", password: "pass",
                           url_patterns: [{hostname: "secure.example.com"}])
```

```java
network.addAuthenticationHandler(e -> {
  Credentials c = vault.credentialsFor(e.url());
  if (c != null) e.authenticate(c); else e.cancel();
});

network.addAuthentication(UsernameAndPassword.of("user", "pass"),
    List.of(UrlPattern.builder().hostname("secure.example.com").build()));
```

4. **A request or response handler observes or intercepts, and the event object enforces which.**
   The mode is decided at registration; intercepting is the default and observing is opt-in. An
   observing handler receives a read-only event object, takes no part in the disposition chain
   (decisions 5–7), and takes no patterns. An intercepting handler receives a mutable
   event object: it can stage changes and settle the event, and traffic is paused until handling
   resolves it.
   * How a binding lets the user pick the mode — a keyword argument, an options object, an overload —
     is its own idiom; what is fixed is that it is the same method name, not an
     `add_request_observer` alongside an `add_request_intercept`.

```ruby
# Same method, two modes; the event object handed to the block differs
network.add_request_handler { |r| r.fail if something }         # intercept: mutable, in the chain
network.add_request_handler(observe: true) { |r| log(r.url) }   # observe: read-only, outside the chain
```

```java
network.addRequestHandler(r -> { if (something) r.fail(); });                    // intercept: mutable, in the chain
network.addRequestHandler(new ObservationOptions(), r -> log(r.url()));          // observe: read-only, outside the chain
```

5. **When an intercepting handler settles a disposition, the first to do so resolves the event and
   stops the chain.** The user settles the event by acting on the object the callable receives. A
   handler that only stages mutations does not settle; it passes the event to the next handler
   (decision 6).
   * A request has three: `fail` (BiDi's `FailRequest`) ends it with an error;
     `respond` (`ProvideResponse`) replies with a mock, so nothing reaches the server; `submit`
     (`ContinueRequest`) sends it on, with any staged mutations, and consults no further handler.
   * `submit` is never required — a handler that settles nothing lets the event continue anyway
     (decision 6) — and because it short-circuits the chain it can override what a shared handler
     installed. That is occasionally necessary and easy to invoke by accident, so its name should read
     as a deliberate, terminal override.
   * A response has `fail` and `submit`. It has already round-tripped, so whether `submit` maps to
     `ContinueResponse` or `ProvideResponse` follows from whether a replacement body was given.

```ruby
# fail: error out; respond: mock, no round trip; submit: send (mutated) to the server and stop the chain
network.add_request_handler { |r| r.fail if blocked?(r.url) }
network.add_request_handler { |r| r.respond(content: mocked_response) if stubbed?(r.url) }        # not sent to the server
network.add_request_handler { |r| r.add_header("X-Test", true); r.submit if override?(r.url) }    # sent to the server, chain stops
network.add_response_handler { |r| r.submit(content: mocked_response) if rewrite?(r.url) }
```

```java
network.addRequestHandler(r -> { if (blocked(r.url())) r.fail(); });
network.addRequestHandler(r -> { if (stubbed(r.url())) r.respond(mockedResponse); });             // not sent to the server
network.addRequestHandler(r -> { if (override(r.url())) { r.addHeader("X-Test", "true"); r.submit(); } }); // sent, chain stops
network.addResponseHandler(r -> { if (rewrite(r.url())) r.submit(mockedResponse); });
```

6. **Default disposition is to process other intercepting handlers.** If a handler does not specify
   the disposition, the original event and any staged mutations pass to the next handler. If no
   handler ever specifies one, the event proceeds with the staged mutations.
   * In Playwright request interception there is no default; the user must specify fallback if that
     is the intent.

```ruby
# Stages a change and passes to the next handler; no disposition specified
network.add_request_handler { |r| r.add_header("X-Test", true) }
```

```java
network.addRequestHandler(r -> r.addHeader("X-Test", "true"));
```

7. **Later-registered handlers are consulted first.** This applies to every family — request,
   response, and authentication. Registering an additional handler can mutate the state used by
   previously registered ones.
   * Ordering is a property of the chain, so it covers intercepting handlers; observing handlers
     have no defined order, including relative to one another.
   * Matches Playwright's Last-In-First-Out (LIFO) behavior.
   * Allows users to locally override handlers set by a shared library or suite.
   * The alternative is being stuck with the top-level behavior everywhere, or not being able to set
     top-level defaults at all.

```ruby
# Header will be there because removal is attempted before it is added
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| r.remove_header("X-Test") }
```

```java
network.addRequestHandler(r -> r.addHeader("X-Test", "true"));
network.addRequestHandler(r -> r.removeHeader("X-Test"));
```

8. **An uncaught exception discards the handler's staged changes; it surfaces to the user for an
   intercept handler and is logged for an observe handler.** Either way the event keeps flowing as if
   that handler had not run, so one broken handler cannot corrupt live traffic or stall the page. The
   difference is visibility: an intercept handler expresses the test's intent, so a failure in it
   surfaces to the user; an observe handler is passive monitoring, so an incidental failure (a
   third-party beacon, an analytics call) is logged and never fails the test.

```ruby
# Intercept: the error surfaces; the header addition from the other handler still applies
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| raise Exception }

# Observe: the error is logged, the test is unaffected
network.add_request_handler(observe: true) { |r| raise Exception }
```

```java
network.addRequestHandler(r -> r.addHeader("X-Test", "true"));
network.addRequestHandler(r -> { throw new RuntimeException(); });                       // intercept: surfaces to the user

network.addRequestHandler(new ObservationOptions(), r -> { throw new RuntimeException(); }); // observe: logged, test unaffected
```

9. **Return values within the callables are ignored.** No meaning will ever be applied to anything a
   user explicitly or implicitly returns within the callable.
   * Playwright also does this, as does Selenium's current Python implementation.

```ruby
# Ruby: this implicit return value is ignored
network.add_request_handler { |r| r.add_header("X-Test", true); "this value is ignored" }
```

```java
// Java: the handler is a void Consumer, so there is no return value to ignore
network.addRequestHandler(r -> r.addHeader("X-Test", "true"));
```

10. **A handler has access to the original event value.** It may see the changes staged by handlers
    already executed, but can also read the unmodified event value.
    * Even when intercepting and mutating, a conditional can be evaluated against the original value
      rather than the version a prior handler changed.

```ruby
# Nothing gets raised
network.add_request_handler { |r| raise unless r.headers.include?("X-Test") }
network.add_request_handler { |r| raise if r.request.headers.include?("X-Test") }
network.add_request_handler { |r| r.add_header("X-Test", true) }
```

```java
network.addRequestHandler(r -> { if (!r.headers().containsKey("X-Test")) throw new AssertionError(); });
network.addRequestHandler(r -> { if (r.request().headers().containsKey("X-Test")) throw new AssertionError(); });
network.addRequestHandler(r -> r.addHeader("X-Test", "true"));
```

11. **Body data is collected only when the handler opts in at registration.** A body is not available
    by default; the handler declares that it needs the body when it is registered — not from inside
    the callback, since the collector must be in place before the event — and Selenium then owns the
    collector's lifecycle, size cap, and browser-support quirks. The body is readable on the event
    inside that handler, in either mode — the collector holds it independently of the chain.
    * The user never calls `addDataCollector` / `getData` or tears a collector down.
    * There is no way to collect or read body data outside a handler; collection happens only through
      the `add_request_handler` / `add_response_handler` registration.

```ruby
# Declare body collection at registration; the body is then available on the event
network.add_response_handler(collect_body: true) { |r| log(r.body) }
```

```java
network.addResponseHandler(new BodyCollection(), r -> log(r.body()));
```

## Considered options

- **Registration surface (decision 1).**
  - Separate top-level driver methods or a handler-collection object — the boundaries decision fixes
    `driver.network` as the neutral accessor, and one shape keeps the families consistent.
  - `add` only, no `remove` / `clear` — a handler installed by a shared suite could not be retracted
    for one test, which the LIFO override (decision 7) relies on.
  - Remove by passing the original callable rather than a returned handle — an inline block has no
    stable identity to pass back.
  - A bare numeric id as the handle — an object is type-safe and cannot be confused with an unrelated
    id.
- **Filtering (decision 2).**
  - No patterns, matching only in the callback — nothing to hand the remote, so every event must be
    intercepted to answer any question about it.
  - A predicate, as one binding ships today — cannot cross the wire, so it has the same cost, and adds
    nothing over a conditional in the callback.
  - Reject URL strings and require the object form — the spec accepts a pattern string itself, so
    refusing one buys no safety.
  - Take a native URL apart into components, erroring on what no component represents — URLs are
    complicated enough that parsing them is work we would own and get wrong; passing one on as a
    pattern string leaves that to the spec.
  - Accept globs, matching them client-side until the spec catches up — widely understood, and another
    framework ships exactly this. But it means intercepting every event, and no two glob dialects agree
    with each other or with the URL pattern syntax the spec is adopting: `/orders/*` is valid in both
    and matches one segment or any depth. The same string would quietly mean different things. Users
    can do this in the callable, and if enough do, we can revisit with evidence.
  - Let each binding choose which forms it accepts — five capability sets, so what a user can express
    would depend on their language rather than the spec.
  - Give observing handlers patterns too, matched client-side — the same argument would be enforced
    in two different places, and a conditional in the callable already does it.
- **Authentication as a callable (decision 3).**
  - Exclude auth from the callable model and expose only static credentials (an earlier draft) — a
    callable can compute credentials per challenge, and only a callable can cancel one.
  - Overload the handler method so it takes either a callable or a username and password — one method
    per family is tidier, but the two forms do not do the same thing (static credentials can only ever
    supply, never cancel), and `add_*_handler` would promise a handler the user never wrote.
  - Give the credentials method its own registry, separate from the handlers — then `remove` and
    `clear` would silently miss it, and the two would not have a defined order relative to each other.
  - Ship only the callable form and add the credentials method later if it is asked for — the callable
    can express everything the credentials method can, so the second method is convenience rather than
    capability. It is included because supplying a username and password is the overwhelmingly common
    case, and a signature a user can read without understanding callbacks serves them better than the
    one general form.
- **Modes (decision 4).**
  - Give observation its own method — the modes read one event stream and share the whole
    registration shape, so a second name duplicates add, remove, and clear for both request and
    response to carry what is one flag.
  - Hand an observing handler the resolved event and its final disposition — it would have to be
    sequenced behind the chain, and the response phase already reports the request as actually sent.
  - Make everything interception and add observation later — routing observation through interception
    pauses traffic and perturbs what it records (cache, timing).
- **Reconciliation (decisions 5 & 6).**
  - Run every handler and reconcile by fixed priority (fail > stub > continue) — takes disposition
    away from the individual handler.
  - Let `continueRequest` override failures and stubs (current Python) — no obvious reason that
    command should win.
- **Verb names (decision 5).**
  - Playwright's (abort / fulfill / continue / fallback) or BiDi's (failRequest / provideResponse /
    continueRequest / continueResponse) — either can be matched to spec detail per binding.
  - Name the pass-through `continue` — reads ambiguously as "continue this request" versus "continue to
    the next handler"; `submit` names the intent of sending this request now.
  - Omit a pass-through disposition entirely and only continue after gathering every handler's
    mutations at the end — safest against an accidental short-circuit, but leaves no way for one handler
    to override a default a shared handler set, so it is kept as a deliberately named override instead.
  - `submit` may not be the best name for that override, and a better one is worth settling before
    this ships: `finish`, `complete`, `send`, or a form each binding marks as terminal in its own way,
    such as a Ruby `submit!`.
- **Ordering (decision 7).**
  - Registration order instead of LIFO — prevents overriding global settings locally.
- **Failure (decision 8).**
  - End the session on any uncaught exception (Playwright) — burdens users with unrelated network
    errors, worse when intercepting by default.
  - Log every exception regardless of mode — an intercept handler's failure is the test's own bug and
    should surface.
- **Return values (decision 9).**
  - Let a return value set event or handler state instead of acting on the wrapper — not
    straightforward across all languages.
- **Original access (decision 10).**
  - Expose only the modified or only the original event — a conditional may need the original even
    while mutating.
- **Data collection (decision 11).**
  - Always collect bodies — bodies are large and most handlers never read them.
  - Make the user manage the collector — it has no meaning outside a handler and pushes lifecycle and
    size-cap bookkeeping onto them.

## Consequences

- Every binding implements one add / remove / clear surface for request, response, and authentication
  handlers rather than diverging.
- Client code can override shared handlers locally and resolve a request its own way, a broken
  handler stays contained, and the original event remains readable.
- Authentication handlers gain a callable form in addition to static credentials, so credentials can
  be produced — or the challenge cancelled — per challenge.
- Observing does not make traffic non-blocking: both modes read the same event, so it is paused
  whenever an intercepting handler's patterns match it, whatever else is observing.
- This changes handler behavior that several bindings already ship, so it is not backwards
  compatible.
