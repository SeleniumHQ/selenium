# 17685. Network handler registration and event disposition

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
| Java       | Only the first matching handler runs; disposition is always continue; a throwing handler propagates and leaves the request blocked; return-value driven; no response handler or managed body collection. |
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
end. There are multiple ways to implement the decisions below; the code examples are one option in
one language, and represent user-facing code.

1. **Handlers are added, removed, and cleared.** Each family — request, response, authentication —
   has an add, a remove, and a clear. `add` returns a handle; `remove` takes that handle and
   unregisters exactly that handler; `clear` removes every handler in the family. Removing a handler
   stops it being consulted for later events but does not disturb an event already in flight.
   * A binding maps this to its idiom: .NET adds and removes with `+=` / `-=` on an event, where the
     delegate reference is the handle that `-=` needs.
   * Returning a handle — rather than requiring the user to hold the original callable — lets a
     handler registered inline still be removed.

```ruby
handle = network.add_request_handler { |r| r.fail if blocked?(r.url) }
network.remove_request_handler(handle)
network.clear_request_handlers
```

2. **A handler is a callable, including authentication.** A request or response callable receives the
   event object and acts on it. An authentication callable receives the challenge and returns
   credentials for it; it does not fail, respond, or submit, and is not part of the disposition
   chain. A callable lets credentials be computed per challenge; a static username and password for a
   URL pattern is also accepted directly, without a callable.

```ruby
network.add_authentication_handler { |c| c.respond(vault.credentials_for(c.url)) }
network.add_authentication_handler(username: "user", password: "pass", uri: "https://secure.example.com/*")
```

3. **A request or response handler observes or intercepts, and the event object enforces which.**
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

4. **An intercept handler can specify event disposition, and the first to do so resolves the event.**
   The user disposes of the event by acting on the object provided to the callable; the first handler
   to specify a disposition resolves the event and stops the chain.
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

5. **Default disposition is to process other handlers.** If a handler does not specify the
   disposition, the original event and any staged mutations pass to the next handler. If no handler
   ever specifies one, the event proceeds with the staged mutations.
   * In Playwright request interception there is no default; the user must specify fallback if that
     is the intent.

```ruby
# Stages a change and passes to the next handler; no disposition specified
network.add_request_handler { |r| r.add_header("X-Test", true) }
```

6. **Later-registered handlers are consulted first.** Registering an additional handler can mutate
   the state used by previously registered ones.
   * Matches Playwright's Last-In-First-Out (LIFO) behavior.
   * Allows users to locally override handlers set by a shared library or suite.
   * The alternative is being stuck with the top-level behavior everywhere, or not being able to set
     top-level defaults at all.

```ruby
# Header will be there because removal is attempted before it is added
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| r.remove_header("X-Test") }
```

7. **An uncaught exception discards the handler's staged changes; it propagates for an intercept
   handler and is logged for an observe handler.** Either way the event keeps flowing as if that
   handler had not run, so one broken handler cannot corrupt live traffic or stall the page. The
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

8. **Return values within the callables are ignored.** No meaning will ever be applied to anything a
   user explicitly or implicitly returns within the callable.
   * Playwright also does this, as does Selenium's current Python implementation.

```ruby
# Ruby: this implicit return value is ignored
network.add_request_handler { |r| r.add_header("X-Test", true); "this value is ignored" }
```

9. **A handler has access to the original event value.** It may see the changes staged by handlers
   already executed, but can also read the unmodified event value.
   * Even when intercepting and mutating, a conditional can be evaluated against the original value
     rather than the version a prior handler changed.

```ruby
# Nothing gets raised
network.add_request_handler { |r| raise unless r.headers.include?("X-Test") }
network.add_request_handler { |r| raise if r.request.headers.include?("X-Test") }
network.add_request_handler { |r| r.add_header("X-Test", true) }
```

10. **Body data is collected only when the handler opts in at registration.** A body is not available
    by default; the handler declares that it needs the body when it is registered — not from inside
    the callback, since the collector must be in place before the event — and Selenium then owns the
    collector's lifecycle, size cap, and browser-support quirks. The body is readable on the event
    inside that handler.
   * The user never calls `addDataCollector` / `getData` or tears a collector down.
   * There is no way to collect or read body data outside a handler; collection happens only through
     `add_x_handler`.

```ruby
# Declare body collection at registration; the body is then available on the event
network.add_response_handler(collect_body: true) { |r| log(r.body) }
```

## Considered options

- **Registration surface (decision 1).** Separate top-level driver methods or a handler-collection
  object instead of `driver.network` with three symmetric families — rejected: the boundaries
  decision fixes `driver.network` as the neutral accessor and one shape keeps the families
  consistent. `add` only, no `remove` / `clear` — rejected: a handler installed by a shared suite
  could not be retracted for one test, which the LIFO override (decision 6) relies on. Remove by
  passing the original callable rather than a returned handle — rejected: an inline block has no
  stable identity, so `add` returns a handle.
- **Authentication as a callable (decision 2).** Exclude auth from the callable model and expose only
  static credentials, as an earlier draft did — rejected: a callable returning credentials lets them
  be computed per challenge and reuses the one registration surface; the disposition verbs do not
  apply. The static case is kept as an explicit form, not the whole surface.
- **Modes (decision 3).** Give observation its own method — rejected: it shares the whole
  registration shape, and the read-only contract can only be carried by the event object's type (we
  will not introspect the callable), not the method. Make everything interception and add observation
  later — rejected: routing observation through interception pauses traffic and perturbs what it
  records (cache, timing).
- **Reconciliation (decisions 4 & 5).** Run every handler and reconcile by fixed priority
  (fail > stub > continue), or let `continueRequest` override (current Python) — rejected: both take
  disposition away from the individual handler, and neither precedence is obvious.
- **Verb names (decision 4).** Playwright's (abort / fulfill / continue / fallback) or BiDi's
  (failRequest / provideResponse / continueRequest / continueResponse) — either can be matched to
  spec detail per binding.
- **Ordering (decision 6).** Registration order instead of LIFO — rejected: it prevents overriding
  global settings locally.
- **Failure (decision 7).** End the session on any uncaught exception (Playwright) — rejected:
  burdens users with unrelated network errors, worse when intercepting by default. Log every
  exception regardless of mode — rejected: an intercept handler's failure is the test's own bug.
- **Return values (decision 8).** Let a return value set event or handler state instead of acting on
  the wrapper — rejected: not straightforward across all languages.
- **Original access (decision 9).** Expose only the modified or only the original event — rejected: a
  conditional may need the original even while mutating.
- **Data collection (decision 10).** Always collect bodies — rejected: bodies are large and rarely
  read. Make the user manage the collector — rejected: it has no meaning outside a handler and pushes
  lifecycle and size-cap bookkeeping onto them.

## Consequences

- Every binding implements one add / remove / clear surface for request, response, and authentication
  handlers rather than diverging, with .NET expressing it through `+=` / `-=` events.
- Client code can override shared handlers locally and resolve a request its own way, a broken
  handler stays contained, and the original event remains readable.
- Authentication handlers gain a callable form in addition to static credentials, so credentials can
  be produced per challenge.
- This changes handler behavior that several bindings already ship, so it is not backwards
  compatible.
