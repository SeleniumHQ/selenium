# 17776. The script and logging async/event API is defined on `driver.script`

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17776

## Context

`driver.script` is the high-level API for two things: running scripts, and subscribing to the
script- and log-domain events a page emits — console messages, uncaught JavaScript errors, and DOM
mutations. The bindings diverge across all of it: which capabilities exist, what each is named, what
a handler returns, and what event data reaches the user. This record fixes the whole surface and its
behavior so the bindings converge.

| Binding    | Current BiDi `script` surface |
|------------|-------------------------------|
| Java       | `pin` registers a preload script (auto-runs); `execute` runs a source string; `unpin`. Console and JavaScript-error handlers as two subscriptions returning a `long` id; DOM-mutation (attributes only). No run-by-handle pin. |
| JavaScript | As Java, entirely async. |
| Python     | `pin` returns a typed handle and `execute` takes source *or* that handle; no `preload`. Console and error over one filtered subscription (`int` id), in two payload shapes; DOM-mutation over attribute, child-list, and character-data. |
| Ruby       | Console and JavaScript-error handlers only (one filtered subscription, `int` id); no `execute` / `pin` / `preload`, no DOM-mutation. |
| .NET       | No high-level surface — only the raw low-level module. |

## Decision

The API covers two things, both on one accessor, `driver.script`: **running scripts** (decisions
1–2) and **subscribing to page events** — console messages, uncaught errors, DOM mutations, and any
event a page-side script defines (decisions 3–7); decision 8 scopes each by window handle, and
decision 9 can isolate a script in a sandbox. The accessor is protocol-neutral — nothing
below returns a BiDi type — and hosts the console and error events itself, not a separate `log`. Each
decision states what every binding provides; call shapes are per-language idiom.

Every script this API takes as source — for `execute`, `pin`, and `add_event_handler` — is a
**JavaScript function expression**, such as `"(a, b) => a + b"` or `"function (el) { … }"`. Its
arguments are the function's parameters, not an `arguments` array, and its result is the function's
return value. This is the form the protocol runs natively, so bindings pass it through without
wrapping, and it is the same form in every binding. It differs from `execute_script`, which takes a
function body; that method is unchanged, and `execute` has an opt-in `body` option (decision 1) so
an `execute_script` string moves over without rewriting.

**Running scripts**

1. **`execute(script, *args)` runs a script and returns its result — there is no `execute_async`.**
   `script` is a function expression or a handle from `pin`. A returned promise is awaited, so one method
   covers both sync and async, and async-versus-sync is a per-language return-type detail, not a
   second method. Passing a handle invokes the pinned script without resending its source — the
   original point of pinning — so a large atom travels once and each call carries only the invocation.
   **Arguments and results convert as `execute_script` converts them**: an element passed in reaches
   the script as its DOM node, and a DOM node returned comes back as an element, with the same
   handling of collections, numbers, and `null`.
   **An optional `body` flag, off by default, takes the script as a function body instead**, wrapped
   by the binding so `return` and `arguments` behave exactly as in `execute_script`; it exists so an
   `execute_script` snippet moves to `execute` unchanged. It applies to a source string only, not to
   a pinned handle, and `pin` and `add_event_handler` have no such option. The function form stays the
   default because its failure is loud: a body sent as a function is a syntax error, while a function
   sent as a body silently returns `null`.
   Bindings must stop listening for the result of a pending `execute` command once they have waited
   longer than the session's script timeout value, and then raise the same script timeout error as
   `execute_script`. The binding takes the session's value from the capabilities it sent and from its
   own timeouts calls; if neither set one, it uses the 30-second default and does not query the
   remote end. A binding may also accept an
   optional `timeout` argument on `execute`, which replaces the session's script timeout for that
   call only.

```ruby
driver.script.execute("() => document.title")
driver.script.execute("return document.title", body: true)  # an execute_script string, unchanged
```
```java
driver.script().execute("() => document.title");
driver.script().execute("return document.title", ScriptOptions.body());
```

2. **`pin(source)` registers a script the browser keeps on every future page** — run before the
   page's own scripts on each navigation and in every new browsing context for the rest of the
   session. It returns a handle: pass it to `execute` to invoke the pinned script without resending
   the source, or to `unpin` to discard it.
   - **A pinned function that declares parameters is a callable; one that declares none runs
     itself.** On each load the binding checks the function's `length` in the browser. If it is
     non-zero, the function is the *pinned callable*: the binding keeps it on the page without
     calling it, and `execute(handle, *args)` invokes it with `args`. If it is zero, the function is
     self-running: it is called once on each load, and `execute(handle)` calls it again and returns
     its result. The check is the language's own, made in the browser, so no binding parses the
     source to classify it. `length` does not count rest or defaulted parameters, so a callable must
     declare at least one plain leading parameter to be kept rather than run.
   - **`pin` does not run on the already-loaded page**, because a pinned script's guarantee is that
     it runs before the page's own scripts, and that moment has passed. Instead, when
     `execute(handle)` reaches a page the pinned script has not run on, the binding runs the pinned
     source there first and then invokes it. So `pin` followed by `execute(handle)` works on the
     current page; only that first call on that page carries the source.

```ruby
displayed = driver.script.pin("(el) => el.offsetParent !== null")  # the atom rides on every future page
driver.get("https://example.com")
driver.script.execute(displayed, driver.find_element(id: "menu")) # invoked by handle; atom not resent
driver.script.unpin(displayed)

driver.script.pin("() => { window.__seleniumStart = performance.now() }")  # self-running on each load
```
```java
PinnedScript displayed = driver.script().pin("(el) => el.offsetParent !== null");
driver.get("https://example.com");
driver.script().execute(displayed, driver.findElement(By.id("menu")));
driver.script().unpin(displayed);
```

**Subscribing to events**

3. **Console messages and JavaScript errors are separate handlers**, even though one `log` event
   feeds both — a console subscriber receives console output, not the page's uncaught errors.
   **DOM-mutation handlers select which changes to observe** — attribute, child-list,
   character-data, or any combination; with none named, all are observed.

```ruby
driver.script.add_console_message_handler { |m| log(m.text) }
driver.script.add_javascript_error_handler { |e| log(e.stacktrace) }
driver.script.add_dom_mutation_handler(types: [:attributes]) { |m| log(m.attribute_name) }
```
```java
driver.script().addConsoleMessageHandler(m -> log(m.getText()));
driver.script().addJavaScriptErrorHandler(e -> log(e.getStacktrace()));
driver.script().addDomMutationHandler(m -> log(m.getAttributeName()), MutationType.ATTRIBUTES);
```

4. **`add_event_handler(script)` subscribes to events a page-side script defines.** The script is
   called with an `emit` callback; each value it emits reaches the handler deserialized the same way
   as an `execute` result (a DOM node becomes an element), not as a shaped payload — though the
   handler still reports which window handle the emission came from, so one watching every tab can
   tell them apart. There is no event name: the returned registration identifies the subscription. This is the general mechanism
   the DOM-mutation handler is a specialization of, exposed for events no binding pre-defines. The handler runs the script now and
   by default re-arms it on every future load in the same window so it survives navigation; an option
   confines it to the current document. `remove_event_handler` detaches the subscription and stops
   future loads.

```ruby
h = driver.script.add_event_handler(
      "(emit) => new PerformanceObserver(l => emit(l.getEntries())).observe({type: 'paint'})") do |entries|
  log(entries)
end
driver.script.remove_event_handler(h)
```
```java
Registration h = driver.script().addEventHandler(
    "(emit) => new PerformanceObserver(l => emit(l.getEntries())).observe({type: 'paint'})",
    entries -> log(entries));
driver.script().removeEventHandler(h);
```

5. **Registering returns an object, not a bare id.** `pin` and each `add_*` handler return an object,
   so a registration can carry more than an identifier; the object is passed back to its remover —
   `unpin`, `remove_*_handler` — to detach it, and `pin`'s object is also what `execute` takes to run
   the pinned script.

```ruby
handler = driver.script.add_console_message_handler { |m| log(m.text) }
driver.script.remove_console_message_handler(handler)
```
```java
Registration handler = driver.script().addConsoleMessageHandler(m -> log(m.getText()));
driver.script().removeConsoleMessageHandler(handler);
```

6. **Each event the API defines carries a shaped payload — not the raw protocol entry — and every
   payload names the window handle it came from.** An event raised in an iframe reports the handle
   of the top-level window that contains it, since iframes have no window handle. A console message carries level, text, type, and
   arguments; a JavaScript error carries its message and stack trace; a DOM mutation carries the
   target element, the mutation kind, and the fields for that kind — an attribute name with its old
   and new value, the old and new character data, or the added and removed nodes. A field the mutation
   has no counterpart for — the old value of a newly added attribute — is absent, not a sentinel. Only
   the JavaScript error carries a stack trace; a console message does not. `add_event_handler` is the
   exception to the shaping: it delivers whatever its script emits, unshaped (decision 4).

```ruby
driver.script.add_console_message_handler { |m| log(m.level, m.text, m.window_handle) }
driver.script.add_javascript_error_handler { |e| log(e.message, e.stacktrace) }
```
```java
driver.script().addConsoleMessageHandler(m -> log(m.getLevel(), m.getText(), m.getWindowHandle()));
driver.script().addJavaScriptErrorHandler(e -> log(e.getMessage(), e.getStacktrace()));
```

7. **An uncaught exception in a handler is logged, not raised** — a passive monitor must not fail the
   session or stall the page.

```ruby
driver.script.add_console_message_handler { |m| raise "boom" }   # logged; the session continues
```
```java
driver.script().addConsoleMessageHandler(m -> { throw new RuntimeException("boom"); }); // logged
```

**Scoping**

8. **A window handle narrows an operation to one tab; without it each takes its natural scope.** Pass
   a **window handle** and a handler watches just that tab, `execute` runs in it, or a pinned script
   arms only that tab's future loads. Omit it and `pin` and the handlers apply to every tab, present
   and future — a pinned atom belongs on every page and a subscription on every context — while
   `execute`, which returns a single result, runs in the current context. So applying a pinned script
   everywhere is the default and the window handle is the narrowing, not the other way round. The
   handle must never be passed as a bare string alongside a script's args, where a binding could not
   tell `execute(script, "abc")` apart from a call targeting window `"abc"`. Languages with named
   arguments take it as a named argument. Languages without them (Java, .NET) take it, together with
   the sandbox (decision 9) and `execute`'s `body` flag, in a dedicated options type. The handle survives navigation, so a scope
   the user holds stays valid. Reaching a worker or
   worklet, which has no window handle, and how window handles relate to user contexts, are left to a
   separate record.

```ruby
driver.script.pin("(el) => el.offsetParent !== null")                      # every tab, present and future
driver.script.pin("(el) => el.offsetParent !== null", window_handle: tab)  # only this tab's future loads
driver.script.add_console_message_handler(window_handle: tab) { |m| log(m.text) }  # just this tab
```
```java
driver.script().pin("(el) => el.offsetParent !== null");                    // every tab
driver.script().pin("(el) => el.offsetParent !== null",
    ScriptOptions.windowHandle(otherTab));                                         // only that tab
```

**Sandbox**

9. **`execute`, `pin`, and `add_event_handler` accept an optional sandbox — an isolated world.** A
   sandbox shares the page's DOM but keeps its own globals, so an injected script neither reads the
   page's own scripts nor collides with their names. Naming one creates it on first use; it has no
   separate lifecycle and goes away with its context, so the user passes only its name — there is no
   sandbox object to create or close. `add_event_handler`, which leaves a script and an `emit`
   callback on the page for the session, is the case that most wants it. Scripts a binding injects on
   its own behalf, such as the DOM-mutation observer, must run in a sandbox.

```ruby
driver.script.execute("() => window.__probe ??= performance.now()", sandbox: "selenium")
driver.script.add_event_handler(paint_script, sandbox: "selenium") { |e| log(e) }
```
```java
driver.script().pin(paintScript, ScriptOptions.sandbox("selenium"));
```

## Considered options

- **Script source as a function body, as `execute_script` takes it.**
  - It is the form every Selenium user already writes (`"return document.title"`, args in `arguments`), so `execute` would read the same as the method it overlaps. But `pin` and `add_event_handler` need a function value — something to keep and call, or something to hand `emit` to — so a body would have to be wrapped differently for each method. A function expression is the one form that fits all three and that the protocol runs without rewriting. `execute_script` keeps its body form, so no existing code changes, and the opt-in `body` flag on `execute` covers copying a snippet across.
- **Detecting a body sent as a function and retrying it as a body.**
  - It would let `execute` take either form with no flag. But the failure is not a clean pre-check: the browser evaluates the source as an expression before finding it is not callable, so a body without `return` has already run once, with whatever side effects it has, before the retry runs it again. An explicit flag runs the script exactly once.
- **Deciding pinned-callable versus self-running by parsing the source.**
  - Treating "the source has parameters" as the signal for a callable is what a reader expects. But every binding would need a JavaScript parser to agree on edge cases (parenthesized expressions, `async` functions, comments), and they would drift. Reading the function's `length` in the browser gets the same answer with no parser, decided once, the same way for every binding.
- **Deciding pinned-callable by calling the function and checking whether it returns a function.**
  - It needs no rule about parameters and lets a zero-argument callable be pinned. But every callable is then written as a function returning a function (`"() => (el) => …"`), a cost every user pays in every example, and it misclassifies a self-running script whose last expression happens to be a function, such as `() => window.helper = function () { … }`. A zero-argument callable gains nothing from the distinction anyway, because `execute(handle)` on a self-running script calls it again and returns its result.
- **Having `pin` also run on the already-loaded page.**
  - It would make `pin` then `execute(handle)` work on the current page with no special case. But a pinned script promises to run before the page's own scripts; running it late on the current page would quietly break that promise for self-running scripts, such as an instrumentation hook that has to see the page's first network request. Running the source from `execute(handle)` gets the same result for callables and touches the current page only when the user asks it to.
- **A separate `log` accessor for the console and error events.**
  - These come from the BiDi `log` domain, so a `log` accessor mirrors the protocol and reads naturally to someone thinking in spec terms. But it splits console and error away from the DOM-mutation event and the scripts they are used alongside, spreading one workflow over two objects; and `log` already means browser logs in Selenium (`manage().logs()`, log levels), so `driver.log` would be read as that. Keeping everything on `script` avoids both.
- **A separate `preload` command alongside `pin`.**
  - It looks like two behaviors — `pin` a script to call by handle, versus `preload` one that runs on every page — so two names seem to fit, and today's bindings lean that way (Java and JavaScript `pin` auto-runs, Python `pin` is a handle). But it is one mechanism: `pin` keeps a script on every page, and whether it runs on its own or waits to be called is a property of the script, not the command — a pinned script that declares parameters is exactly run-on-demand, invoked through `execute`. A second command would split one concept across two names for no behavior the first cannot express.
- **A single merged console/error handler.**
  - One subscription maps directly to the `log.entryAdded` event that carries both, so it is the least to implement. But a user almost always wants console output or uncaught errors, not both interleaved, and a merged handler makes every subscriber re-filter by type; splitting moves that demultiplex into the binding, done once instead of by every user.
- **Returning a bare id from `add`.**
  - It is what every binding returns now, and an integer is the least it can hand back. But once code holds an id, anything more we later want — removing through the handle, exposing what it observes, disabling it — needs a new call or parameter, where an object absorbs it behind the same return. The cost is one type per registration the binding already has internally.
- **Observing attribute mutations only.**
  - It is what most bindings ship, and attribute changes are the common case. But `MutationObserver` reports child-list and character-data natively, so attributes-only discards capability the browser already provides, and Python already exposes the full set. Selecting types per handler keeps the common case a one-liner without capping the rest.
- **Exposing the raw protocol entry as the payload.**
  - A direct passthrough — no shaping code, and it tracks the spec automatically. But the raw entry differs field by field across the `log` and `script` domains and leaves the consumer to resolve the origin and the fields these events are read for; a shaped payload gives the same fields in every binding and extracts them once.
- **A separate script timeout setting for `execute`.**
  - BiDi defines no script timeout, so a new one could be designed fresh for this API. But users already have one answer to "how long before a script gives up", and a second setting would need reconciling with it, more so if `execute` ever supersedes `execute_script`. A per-call `timeout` is not a second setting: it falls back to the session's value and changes nothing beyond its own call. Giving `execute` no timeout at all was not an option either: a promise that never settles would hang the test with nothing to report.
- **Targeting `execute` (and event origins) by realm.**
  - The protocol runs scripts against realms, so a `realm` argument mirrors it and can name a worker directly. But a realm id is a BiDi type, which this record's boundary keeps off the surface, and it is not durable: the remote end tears realms down on navigation, so a stored realm goes stale while a pinned script — the very thing you would run in it — survives. A window handle survives navigation and is something the user already holds, so it is the durable target. Workers, which have no handle, are left to a separate record rather than forced through the same argument, which also spares the payload an asymmetric "worker events carry only a realm" case.

## Consequences

- Convergence is mostly reclassifying what exists: Java, JavaScript, and Python keep `pin` but return
  a registration object instead of a bare id and settle on one behavior — a script the browser keeps
  on every page, invoked through `execute` when it declares parameters. Java and JavaScript `pin`
  take a function body today, so their users rewrite pinned scripts as function expressions; Python also drops its
  second payload shape; Ruby adds `execute`, `pin`, and the DOM-mutation handler; .NET builds the
  high-level surface it lacks.
- `add_event_handler` is new surface every binding adds; the DOM-mutation handler becomes its first
  built-in specialization (a pinned observer plus payload shaping) rather than a separate mechanism,
  and custom async events no longer force a drop to the low-level module.
- `execute` overlaps the existing `execute_script`. Whether to deprecate `execute_script` is left to a
  separate decision, under the normal deprecation policy. Until then, Selenium 5 documentation and
  examples use `driver.script.execute` for new code, and `execute_script` remains supported. Users
  carrying an existing `execute_script` string across pass `body`; new examples use the function form.
- `execute` converting arguments and results as `execute_script` does matches Python today. Java's
  `execute` returns a `RemoteValue` and JavaScript's returns the raw protocol result, so both change
  what `execute` returns, through the deprecation policy since the current return types are public.
- Bindings need to store the value of the script timeout when a user sets it in either the
  capabilities or through the timeouts API. When the binding stops waiting, the script keeps
  running in the browser; the client has no way to stop it.
- Scoping adds a window-handle parameter to handlers, `execute`, and `pin`, where most bindings expose
  only the current context today. Reaching workers and the fuller window-handle/user-context model are
  out of scope here. Python already exposes a realm id on `ScriptResult` and `PinnedScript`; keeping
  realm off the surface means walking those back under the deprecation policy before parity work
  copies them into Java and Ruby.
- Sandbox is additive: bindings pass an optional sandbox name to `execute`, `pin`, and
  `add_event_handler`, and run their own injected scripts in one so instrumentation stays out of the
  page's own world.
- Bindings wrap each pinned source in a small preload that reads its `length` and either stores or
  calls it, need a per-page key to keep stored callables under (in the sandbox
  where one is used), and need to keep each pinned source so `execute(handle)` can run it on a page
  the pinned script has not reached.
- Preload removal is future-only: `unpin` (and detaching a handler) stops the script from arming
  later loads but does not undo what already ran — an observer injected into the current page keeps
  running until navigation. A handler that must stop cleanly on the live page has to build teardown
  into the injected script; the record does not promise retroactive removal.
