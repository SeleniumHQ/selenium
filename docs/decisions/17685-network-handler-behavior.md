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

Request and response handlers observe or intercept and reconcile to one disposition; authentication
handlers supply credentials. Selenium consults intercept handlers one at a time and lets each
dispose of the event as it runs — it does not gather every handler's outcome and reconcile at the
end. There are multiple ways to implement the decisions below; the examples are illustrative
user-facing code in Ruby and Java.

1. **Handlers are added, removed, and cleared.** Each family — request, response, authentication —
   has an add, a remove, and a clear. `add` returns a handle object; `remove` takes that handle and
   unregisters exactly that handler; `clear` removes every handler in the family. Removing a handler
   stops it being consulted for later events but does not disturb an event already in flight.

```ruby
handle = network.add_request_handler { |r| r.fail if blocked?(r.url) }
network.remove_request_handler(handle)
network.clear_request_handlers
```

```java
RequestHandler handle = network.addRequestHandler(r -> { if (blocked(r.url())) r.fail(); });
network.removeRequestHandler(handle);
network.clearRequestHandlers();
```

2. **A handler is scoped by an optional list of URL patterns given as structured objects.** Each
   pattern is an object of URL components — protocol, hostname, port, pathname, search — each
   optional: a component that is set matches exactly, one left unset matches any value. A handler
   matches a request against any pattern in its list; with no list it matches every request. A pattern
   is an object, not a URL or glob string.

```ruby
# One or more component objects; a request matches any of them
network.add_request_handler(url_patterns: [{hostname: "api.example.com"}, {hostname: "cdn.example.com"}]) { |r| r.fail }
```

```java
network.addRequestHandler(
    List.of(new UrlPattern().hostname("api.example.com"), new UrlPattern().hostname("cdn.example.com")),
    r -> r.fail());
```

3. **A handler is a callable that acts on the event object.** A request or response handler may
   observe it, change it, or settle its disposition (decisions 4–6); an authentication handler
   supplies credentials for it, computed in the callable or given as a static username and password.

```ruby
# Credentials computed in the callable, or supplied statically
network.add_authentication_handler { |e| e.authenticate(vault.credentials_for(e.url)) }
network.add_authentication_handler(username: "user", password: "pass", url_patterns: [{hostname: "secure.example.com"}])
```

```java
network.addAuthenticationHandler(e -> e.authenticate(vault.credentialsFor(e.url())));
network.addAuthenticationHandler("user", "pass", List.of(new UrlPattern().hostname("secure.example.com")));
```

4. **A request or response handler observes or intercepts, and the event object enforces which.**
   There is one method to add handlers, and which mode the handler operates under is decided at
   creation; intercepting is the default and observing is opt-in. An observing handler receives a
   read-only event object: it can read the event but has no methods to mutate or settle it, and it
   does not pause network traffic. An intercepting handler receives a mutable event object: it can
   stage changes and settle the event, and network traffic is paused until handling resolves it.
   Because the object's type carries the difference — a read-only object simply has no
   mutate-or-settle methods — nothing has to introspect the callable to tell the modes apart.
   * How a binding lets the user pick the mode — a keyword argument, an options object, an overload —
     is its own idiom; what is fixed is that it is the same method, not a separate observe one.

```ruby
# Same method, two modes; the event object handed to the block differs
network.add_request_handler { |r| r.fail if something }         # intercept: mutable, blocking
network.add_request_handler(observe: true) { |r| log(r.url) }   # observe: read-only, non-blocking

# An observed event object has no mutation methods, so trying to mutate raises
network.add_request_handler(observe: true) { |r| r.fail }       # raises: observed events are read-only
```

```java
network.addRequestHandler(r -> { if (something) r.fail(); });                    // intercept: mutable, blocking
network.addRequestHandler(new ObservationOptions(), r -> log(r.url()));          // observe: read-only, non-blocking

// The observe callback's event type has no fail()/mutate methods — this would not compile
```

5. **When a handler settles a disposition, the first to do so resolves the event and stops the
   chain.** The user settles the event by acting on the object the callable receives.
   * Playwright only intercepts requests and requires an explicit disposition: continue (stop
     processing other handlers), fulfill (respond with a mock), abort (respond with an error),
     fallback (process other handlers, if any).
   * Selenium supports:
     * Request: `fail` (Playwright's `abort`, BiDi's `FailRequest`), `respond` (Playwright's `fulfill`, BiDi's `ProvideResponse`), and `submit` (Playwright's `continue`, BiDi's `ContinueRequest`).
     * Response: `fail` (BiDi's `FailRequest`), and `submit`: note that since we don't need to prevent a round trip from a request, whether this is a BiDi `ContinueResponse` or `ProvideResponse` can be an implementation detail based on whether a replacement body value is provided.

```ruby
# Names and params can match spec detail; response verbs mirror request (fail, submit)
network.add_request_handler { |r| r.fail if something }
network.add_request_handler { |r| r.respond(content: mocked_response) if something }
network.add_request_handler { |r| r.add_header("X-Test", true) && r.submit if something }
network.add_response_handler { |r| r.submit(content: mocked_response) if something }
```

```java
network.addRequestHandler(r -> { if (something) r.fail(); });
network.addRequestHandler(r -> { if (something) r.respond(mockedResponse); });
network.addRequestHandler(r -> { if (something) { r.addHeader("X-Test", "true"); r.submit(); } });
network.addResponseHandler(r -> { if (something) r.submit(mockedResponse); });
```

6. **Default disposition is to process other handlers.** If a handler does not specify the
   disposition, the original event and any staged mutations pass to the next handler. If no handler
   ever specifies one, the event proceeds with the staged mutations.
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
    inside that handler.
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
  - No filter, matching only in the callback — no declarative scope a binding could hand to the
    remote, so interception cannot be narrowed to the URLs of interest.
  - A client-side predicate — adds nothing over a conditional in the callback and can never be handed
    to the remote.
  - A URL or glob string — the protocol matches each component by exact equality (an unset component
    matches any), so a string reads as though `*` wildcards work when they do not, and its parsing is
    ambiguous about which component a wildcard belongs to.
  - The structured object is the shape the standard pattern syntax itself uses, so when the protocol
    adopts the wildcard characters it reserves today, the same fields carry them — no structural
    change, and existing exact patterns keep working.
- **Authentication as a callable (decision 3).**
  - Exclude auth from the callable model and expose only static credentials (an earlier draft) — a
    callable can compute credentials per challenge and reuses the one registration surface; the static
    form is kept as sugar, not the whole surface.
- **Modes (decision 4).**
  - Give observation its own method — it shares the whole registration shape, and the read-only
    contract can only be carried by the event object's type (we will not introspect the callable),
    not the method.
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
  be produced per challenge.
- This changes handler behavior that several bindings already ship, so it is not backwards
  compatible.
