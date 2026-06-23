# 17685. Network handlers dispose of events without waiting for other handlers

- Status: Proposed
- Discussion: [#17685](https://github.com/SeleniumHQ/selenium/pull/17685)

## Context

A user can register more than one handler for the same network phase, and matching handlers
can disagree: the company framework always adds a test header, the local suite stubs all calls
to a domain, and one test aborts a single call. Selenium must resolve that and provide a single
response to the browser in a consistent and obvious way.

The bindings diverge today: each grew its handler API independently, so dispatch order,
multi-handler resolution, error handling, and what an event exposes are all inconsistent.

| Binding    | Current behavior |
|------------|------------------|
| Java       | Only the first matching handler runs; disposition is always continue; a throwing handler propagates and leaves the request blocked; return-value driven; no response handler or managed body collection. |
| Python     | An explicit `continue` in a handler fires immediately and wins; otherwise staged outcomes reconcile by `fail` > `provide_response` > `continue`; response handlers have no `fail`; dispatch is FIFO; a throwing handler's staged mutations are still sent; only the mutated event is visible; body is not collected behind the handler. |
| Ruby       | Handlers run in parallel threads, so multi-handler disposition races; exceptions are logged; dispatch is FIFO with no default-continue; only the mutated event is visible; body collection is user-managed. |
| .NET       | No request or response handler API. |
| JavaScript | No request or response handler API. |

## Decision

Selenium consults network handlers one at a time and lets each dispose of the event as it runs:
the first handler to specify a disposition (fail, respond, or submit) resolves the event and
stops the chain, while a handler that only stages mutations passes the event to the next one.
Selenium does not gather every handler's outcome and reconcile it at the end. The behaviors
below apply to request and response handlers, but not authentication handlers, since
authentication should not use a callable.

Note that there are multiple ways to implement these behaviors; the code examples are one
option in one language, and represent user-facing code.

1. **A handler can specify event disposition.** Allow the user to specify how the event is disposed of
   by acting on the object provided to the callable.
   * Playwright only intercepts requests and requires an explicit disposition: continue (stop
     processing other handlers), fulfill (respond with a mock), abort (respond with an error),
     fallback (process other handlers, if any).
   * Selenium supports:
     * Request: `fail` (Playwright's `abort`, BiDi's `FailRequest`), `respond` (Playwright's `fulfill`, BiDi's `ProvideResponse`), and `submit` (Playwright's `continue`, BiDi's `ContinueRequest`).
     * Response: `fail` (BiDi's `FailRequest`), and `submit`: note that since we don't need to prevent a round trip from a request, whether this is a BiDi `ContinueResponse` or `ProvideResponse` can be an implementation detail based on whether a replacement body value is provided.

```ruby
# Specifics of parameters and names can match spec details
network.add_request_handler { |r| r.fail if something }
network.add_request_handler { |r| r.respond(content: mocked_response) if something }
network.add_request_handler { |r| r.add_header("X-Test", true) && r.submit if something }

network.add_response_handler { |r| r.fail if something }
network.add_response_handler { |r| r.submit(content: mocked_response) if something }
network.add_response_handler { |r| r.add_header("X-Test", true) && r.submit if something }
```

2. **Default disposition is to process other handlers.** If a handler does not specify the
   disposition, the original event and any staged mutations pass to the next handler. If no
   handler ever specifies one, the event proceeds with the staged mutations.
   * In Playwright request interception there is no default; the user must specify fallback if
     that is the intent.

```ruby
# All of these stage a change and pass to the next handler
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| r.remove_header("upgrade-insecure-requests") }
network.add_request_handler { |r| r.content = r.request.content.gsub("a", "b") }
```

3. **Later-registered handlers are consulted first.** Registering an additional handler can
   mutate the state used by previously registered ones.
   * Matches Playwright's Last-In-First-Out (LIFO) behavior.
   * Allows users to locally override handlers set by a shared library or suite.
   * The alternative is being stuck with the top-level behavior everywhere, or not being able to
     set top-level defaults at all.

```ruby
# Header will be there because removal is attempted before it is added
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| r.remove_header("X-Test") }
```

4. **Handlers with uncaught exceptions are not processed.** Handling proceeds as if the handler
   were never registered for that event; its staged changes are discarded and the error is
   logged.
   * A problem in a handler should not corrupt live traffic or prevent other handler
     interactions.
   * In Playwright, uncaught exceptions propagate to end the session, which causes problems when
     something unrelated to the test's intent goes wrong.
   * Selenium is more lenient and only logs the error to the console.

```ruby
# Header addition will still be processed; the error with details gets logged
network.add_request_handler { |r| r.add_header("X-Test", true) }
network.add_request_handler { |r| raise Exception }
```

5. **Return values within the callables are ignored.** No meaning will ever be applied to
   anything a user explicitly or implicitly returns within the callable.
   * Playwright also does this, as does Selenium's current Python implementation.

```ruby
# Ruby: this implicit return value is ignored
network.add_request_handler { |r| r.add_header("X-Test", true); "this value is ignored" }
```

```python
# Python: this explicit return value is ignored
def handler(r):
    r.add_header("X-Test", True)
    return "this value is ignored"

driver.network.add_request_handler(handler)
```

6. **A handler has access to the original event value.** It may see the changes staged by
   handlers already executed, but can also read the unmodified event value.
   * Supports building observation-only handlers as interceptions until read-only observation is
     decided separately.
   * Playwright uses a completely separate mechanism to differentiate observation from mutation,
     so it does not need to address this.

```ruby
# Nothing gets raised
network.add_request_handler { |r| raise unless r.headers.include?("X-Test") }
network.add_request_handler { |r| raise if r.request.headers.include?("X-Test") }
network.add_request_handler { |r| r.add_header("X-Test", true) }
```

7. **Body data is collected only when the handler opts in at registration.** A body is not
   available by default; the handler declares that it needs the body when it is registered — not
   from inside the callback, since the collector must be in place before the event — and Selenium
   then owns the collector's lifecycle, size cap, and browser-support quirks. The body is readable
   on the event inside that handler.
  * The user never calls `addDataCollector` / `getData` or tears a collector down.
  * There is no way to collect or read body data outside a handler; collection happens only
    through `add_x_handler`.
  * Playwright exposes bodies through its response object without a user-managed collector;
    Selenium does the same, owning the collector behind the handler.

```ruby
# Declare body collection at registration; the body is then available on the event
network.add_response_handler(collect_body: true) { |r| log(r.body) }
```

## Considered options

- **Reconciliation (behaviors 1 & 2).** 
  - We could run every handler and reconcile by a fixed priority (fail > stub > continue). But
    this prevents a user from exercising the `continueRequest` behavior from a specific
    handler, so all mutations from all handlers would be applied by default.
  - We could run every handler but have `continueRequest` override failures and stubs (current
    Python behavior), but it is not obvious why that command should have precedence.
- **Verb names (behavior 1).**
  - We could follow Playwright's (abort / fulfill / continue / fallback).
  - We could follow BiDi's more explicitly (failRequest / provideResponse / continueRequest / continueResponse).
- **Explicit disposition (2).**
    - We could require the user to specify fallback explicitly like Playwright does.
- **Ordering (behavior 3).**
    - We could run in order of handler registration, but this prevents users from overriding global settings locally.
- **Failure (4).**
    - We could propagate the uncaught exception to end the session like Playwright does, but this
      puts a larger burden on the users to manage network issues and bugs that aren't part of a
      test. This is likely to be a bigger issue if we intercept every event by default.
- **Return values (5).**
    - We could have the return values set state for the event or handler rather than storing it in
      the event wrapper object we provide, but this is not as straightforward in all languages
      and adds additional complications.
- **Original access (6).**
    - We could only expose the modified event, or only the original, instead of both.
    - We could provide a separate observation API like Playwright, but even when mutating it could
      make sense to evaluate a conditional from the original event rather than the mutated one.
- **Data collection (7).**
    - We could collect every body always, but bodies are large and most handlers never read them,
      so collection is opt-in at registration instead.
    - We could require the user to manage the data collector directly through the low-level
      commands, but collection has no meaning outside a handler and would push lifecycle,
      size-cap, and browser-support bookkeeping onto the user.

## Consequences

- Client code can override shared handlers locally and resolve a request its own way, a broken
  handler stays contained, and the original event remains readable.
- This changes handler behavior that several bindings already ship, so it is not backwards
  compatible.
