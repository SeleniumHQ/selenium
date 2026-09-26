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

**Running scripts**

1. **`execute(script, *args)` runs a script and returns its result — there is no `execute_async`.**
   `script` is a source string or a handle from `pin`. A returned promise is awaited, so one method
   covers both sync and async, and async-versus-sync is a per-language return-type detail, not a
   second method. Passing a handle invokes the pinned script without resending its source — the
   original point of pinning — so a large atom travels once and each call carries only the invocation.

```ruby
driver.script.execute("return document.title")
```
```java
driver.script().execute("return document.title");
```

2. **`pin(source)` registers a script the browser keeps on every future page** — run before the
   page's own scripts on each navigation and in every new browsing context for the rest of the
   session. It does not apply to the already-loaded page; `execute` runs things now. It returns a
   handle: pass it to `execute` to invoke the pinned script without resending the source, or to
   `unpin` to discard it. A pinned callable is defined on each load and invoked on demand through its
   handle; a self-running script simply takes effect on each load.

```ruby
displayed = driver.script.pin("(el) => el.offsetParent !== null")  # the atom rides on every future page
driver.get("https://example.com")
driver.script.execute(displayed, driver.find_element(id: "menu")) # invoked by handle; atom not resent
driver.script.unpin(displayed)
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

4. **`add_event_handler(name, script)` subscribes to events a page-side script defines.** The script
   is handed a callback; each call delivers its argument to the handler unchanged — the raw value the
   script emitted, not a shaped payload. This is the general mechanism the DOM-mutation handler is a
   specialization of, exposed for events no binding pre-defines. The handler runs the script now and
   by default re-arms it on every future load in the same window so it survives navigation; an option
   confines it to the current document. `remove_event_handler` detaches the subscription and stops
   future loads.

```ruby
h = driver.script.add_event_handler("paint",
      "(emit) => new PerformanceObserver(l => emit(l.getEntries())).observe({type: 'paint'})") do |entries|
  log(entries)
end
driver.script.remove_event_handler(h)
```
```java
Registration h = driver.script().addEventHandler("paint",
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
   payload names the window handle it came from.** A console message carries level, text, type, and
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
   handle is a named argument, distinct from a script's positional args so a binding never mistakes it
   for one, and it survives navigation so a scope the user holds stays valid. Reaching a worker or
   worklet, which has no window handle, and how window handles relate to user contexts, are left to a
   separate record.

```ruby
driver.script.pin("(el) => el.offsetParent !== null")                      # every tab, present and future
driver.script.pin("(el) => el.offsetParent !== null", window_handle: tab)  # only this tab's future loads
driver.script.add_console_message_handler(window_handle: tab) { |m| log(m.text) }  # just this tab
```
```java
driver.script().pin("(el) => el.offsetParent !== null");                   // every tab
driver.script().pin("(el) => el.offsetParent !== null", otherTab);         // only that tab
```

**Sandbox**

9. **`execute` and `pin` accept an optional sandbox — an isolated world.** A sandbox shares the page's
   DOM but keeps its own globals, so an injected script neither reads the page's own scripts nor
   collides with their names. Naming one creates it on first use; it has no separate lifecycle and
   goes away with its context, so it is a plain named argument, not an object to close.
   `add_event_handler`, which leaves a script and an `emit` callback on the page for the session, is
   the case that most wants it.

```ruby
driver.script.execute("window.__probe ??= performance.now()", sandbox: "selenium")
driver.script.add_event_handler("paint", paint_script, sandbox: "selenium") { |e| log(e) }
```
```java
driver.script().pin(paintScript, Sandbox.named("selenium"));
```

## Considered options

- **A separate `log` accessor for the console and error events.**
  - These come from the BiDi `log` domain, so a `log` accessor mirrors the protocol and reads naturally to someone thinking in spec terms. But it splits console and error away from the DOM-mutation event and the scripts they are used alongside, spreading one workflow over two objects; and `log` already means browser logs in Selenium (`manage().logs()`, log levels), so `driver.log` would be read as that. Keeping everything on `script` avoids both.
- **A separate `preload` command alongside `pin`.**
  - It looks like two behaviors — `pin` a script to call by handle, versus `preload` one that runs on every page — so two names seem to fit, and today's bindings lean that way (Java and JavaScript `pin` auto-runs, Python `pin` is a handle). But it is one mechanism: `pin` keeps a script on every page, and whether it runs on its own or waits to be called is a property of the script, not the command — a pinned helper that only defines a function is exactly run-on-demand, invoked through `execute`. A second command would split one concept across two names for no behavior the first cannot express.
- **A single merged console/error handler.**
  - One subscription maps directly to the `log.entryAdded` event that carries both, so it is the least to implement. But a user almost always wants console output or uncaught errors, not both interleaved, and a merged handler makes every subscriber re-filter by type; splitting moves that demultiplex into the binding, done once instead of by every user.
- **Returning a bare id from `add`.**
  - It is what every binding returns now, and an integer is the least it can hand back. But once code holds an id, anything more we later want — removing through the handle, exposing what it observes, disabling it — needs a new call or parameter, where an object absorbs it behind the same return. The cost is one type per registration the binding already has internally.
- **Observing attribute mutations only.**
  - It is what most bindings ship, and attribute changes are the common case. But `MutationObserver` reports child-list and character-data natively, so attributes-only discards capability the browser already provides, and Python already exposes the full set. Selecting types per handler keeps the common case a one-liner without capping the rest.
- **Exposing the raw protocol entry as the payload.**
  - A direct passthrough — no shaping code, and it tracks the spec automatically. But the raw entry differs field by field across the `log` and `script` domains and leaves the consumer to resolve the origin and the fields these events are read for; a shaped payload gives the same fields in every binding and extracts them once.
- **Targeting `execute` (and event origins) by realm.**
  - The protocol runs scripts against realms, so a `realm` argument mirrors it and can name a worker directly. But a realm id is a BiDi type, which this record's boundary keeps off the surface, and it is not durable: the remote end tears realms down on navigation, so a stored realm goes stale while a pinned script — the very thing you would run in it — survives. A window handle survives navigation and is something the user already holds, so it is the durable target. Workers, which have no handle, are left to a separate record rather than forced through the same argument, which also spares the payload an asymmetric "worker events carry only a realm" case.

## Consequences

- Convergence is mostly reclassifying what exists: Java, JavaScript, and Python keep `pin` but return
  a registration object instead of a bare id and settle on one behavior — a script the browser keeps
  on every page, invoked through `execute` when it only defines a callable; Python also drops its
  second payload shape; Ruby adds `execute`, `pin`, and the DOM-mutation handler; .NET builds the
  high-level surface it lacks.
- `add_event_handler` is new surface every binding adds; the DOM-mutation handler becomes its first
  built-in specialization (a pinned observer plus payload shaping) rather than a separate mechanism,
  and custom async events no longer force a drop to the low-level module.
- `execute` overlaps the existing `execute_script`; whether to supersede it is still open, and if we
  do it follows the normal deprecation policy, not a special migration.
- Scoping adds a window-handle parameter to handlers, `execute`, and `pin`, where most bindings expose
  only the current context today. Reaching workers and the fuller window-handle/user-context model are
  out of scope here. Python already exposes a realm id on `ScriptResult` and `PinnedScript`; keeping
  realm off the surface means walking those back under the deprecation policy before parity work
  copies them into Java and Ruby.
- Sandbox is additive: bindings pass an optional sandbox name to `execute` and `pin`, and injected
  handlers should default to one so instrumentation stays out of the page's own world.
- Preload removal is future-only: `unpin` (and detaching a handler) stops the script from arming
  later loads but does not undo what already ran — an observer injected into the current page keeps
  running until navigation. A handler that must stop cleanly on the live page has to build teardown
  into the injected script; the record does not promise retroactive removal.
