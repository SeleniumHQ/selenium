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
event a page-side script defines (decisions 3–7); a final decision (8) says where each one runs — a
window handle for events, a realm for `execute`. The accessor is protocol-neutral — nothing
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
   specialization of, exposed for events no binding pre-defines. The handler runs the script now and,
   unless limited to the current context, keeps it on every future load so it survives navigation;
   `remove_event_handler` detaches the subscription and stops future loads.

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
   payload names its origin.** The origin is the source realm (always present) and the window handle
   it belongs to (present for a tab-level event; a worker-realm event carries the realm alone). Beyond
   origin, a console message carries level, text, type, and arguments; a JavaScript error carries its
   message and stack trace; a DOM mutation carries the target element, the mutation kind, and the
   fields for that kind — an attribute name with its old and new value, the old and new character
   data, or the added and removed nodes. Only the JavaScript error carries a stack trace; a console
   message does not. `add_event_handler` is the exception to the shaping: it delivers whatever its
   script emits, unshaped (decision 4).

```ruby
driver.script.add_console_message_handler { |m| log(m.level, m.text, m.realm) }
driver.script.add_javascript_error_handler { |e| log(e.message, e.stacktrace) }
```
```java
driver.script().addConsoleMessageHandler(m -> log(m.getLevel(), m.getText(), m.getRealm()));
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

8. **Events attach to a window handle; `execute` runs in a realm.** A handler defaults to the current
   top-level navigable and takes an optional **window handle** to watch another tab. `execute`
   defaults to the current realm and takes an optional **realm** — a frame, a web worker, or a
   service worker, not only a tab — since a script can run wherever one of those exists. How window
   handles, realms, and user contexts relate more fully is out of scope for this record.

```ruby
driver.script.add_console_message_handler(window_handle: tab) { |m| log(m.text) }  # tab: a window handle
driver.script.execute("return self.location.href", realm: worker)                  # realm: frame/worker/tab
```
```java
driver.script().addConsoleMessageHandler(tab, m -> log(m.getText()));      // tab: a window handle
driver.script().execute("return self.location.href", worker);              // worker: a frame/worker/tab realm
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
- **A single `context` argument shared by `execute` and the handlers.**
  - One scope parameter everywhere is simplest to describe. But the two targets differ: an event attaches to a top-level navigable — a tab — while `execute` can run in a frame, a web worker, or a service worker, which are realms. Collapsing both into one `context` blurs a distinction users have to get right, so events take a window handle and `execute` takes a realm.

## Consequences

- Convergence is mostly reclassifying what exists: Java, JavaScript, and Python keep `pin` but return
  a registration object instead of a bare id and settle on one behavior — a script the browser keeps
  on every page, invoked through `execute` when it only defines a callable; Python also drops its
  second payload shape; Ruby adds `execute`, `pin`, and the DOM-mutation handler; .NET builds the
  high-level surface it lacks.
- `add_event_handler` is new surface every binding adds; the DOM-mutation handler becomes its first
  built-in specialization (a pinned observer plus payload shaping) rather than a separate mechanism,
  and custom async events no longer force a drop to the low-level module.
- `execute` overlaps the existing `execute_script`; whether it supersedes that method is a separate
  migration decision, not settled here.
- Scoping adds a parameter, not just a rename: handlers take an optional window handle and `execute`
  an optional realm, where most bindings expose only the current one today. How window handles,
  realms, and user contexts relate is out of scope here.
- Preload removal is future-only: `unpin` (and detaching a handler) stops the script from arming
  later loads but does not undo what already ran — an observer injected into the current page keeps
  running until navigation. A handler that must stop cleanly on the live page has to build teardown
  into the injected script; the record does not promise retroactive removal.
