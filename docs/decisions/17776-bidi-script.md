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
1–3) and **subscribing to the page's console, error, and DOM-mutation events** (decisions 4–7). The
accessor is protocol-neutral — nothing below returns a BiDi type — and hosts the console and error
events itself, not a separate `log`. Each decision states what every binding provides; call shapes
are per-language idiom.

**Running scripts**

1. **`execute(script, *args)` runs a script and returns its result.** `script` is either a source
   string or a registered handle; whether the source is resent or referenced from a prior
   registration is a per-language detail.

```ruby
driver.script.execute("return document.title")
```
```java
driver.script().execute("return document.title");
```

2. **`pin(source)` registers a script to run on demand.** It returns a handle that `execute` runs
   without resending the source; a pinned script runs only when executed, and `unpin` discards it.

```ruby
pinned = driver.script.pin("return document.title")
driver.script.execute(pinned)
driver.script.unpin(pinned)
```
```java
PinnedScript pinned = driver.script().pin("return document.title");
driver.script().execute(pinned);
driver.script().unpin(pinned);
```

3. **`preload(source)` registers a script to run automatically** — before page scripts, on the
   current page and every navigation. It returns a handle that `remove_preload` discards; a preload
   script runs only on its own, never by handle.

```ruby
loaded = driver.script.preload("window.__inject = true")
driver.script.remove_preload(loaded)
```
```java
PreloadScript loaded = driver.script().preload("window.__inject = true");
driver.script().removePreload(loaded);
```

**Subscribing to events**

4. **Console messages and JavaScript errors are separate handlers**, even though one `log` event
   feeds both, so a console subscriber does not also receive stack traces. **DOM-mutation handlers
   select which changes to observe** — attribute, child-list, character-data, or any combination.

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

5. **Registering returns an object, not a bare id.** `pin`, `preload`, and each `add_*` handler
   return an object, so a registration can carry more than an identifier; the object is passed back
   to its remover — `unpin`, `remove_preload`, `remove_*_handler` — to detach it.

```ruby
handler = driver.script.add_console_message_handler { |m| log(m.text) }
driver.script.remove_console_message_handler(handler)
```
```java
Registration handler = driver.script().addConsoleMessageHandler(m -> log(m.getText()));
driver.script().removeConsoleMessageHandler(handler);
```

6. **Each event carries a shaped payload — not the raw protocol entry.** It includes an explicit
   source location and stack trace: console message (level, text, type, arguments, source, stack),
   JavaScript error (message, source, stack), DOM mutation (target element, mutation kind, attribute
   name with old and new value, added and removed nodes).

```ruby
driver.script.add_console_message_handler { |m| log(m.level, m.text, m.source.url, m.stacktrace) }
```
```java
driver.script().addConsoleMessageHandler(m ->
    log(m.getLevel(), m.getText(), m.getSource().getUrl(), m.getStacktrace()));
```

7. **An uncaught exception in a handler is logged, not raised** — a passive monitor must not fail the
   session or stall the page.

```ruby
driver.script.add_console_message_handler { |m| raise "boom" }   # logged; the session continues
```
```java
driver.script().addConsoleMessageHandler(m -> { throw new RuntimeException("boom"); }); // logged
```

## Considered options

- **A separate `log` accessor for the console and error events.**
  - These come from the BiDi `log` domain, so a `log` accessor mirrors the protocol and reads naturally to someone thinking in spec terms. But it splits console and error away from the DOM-mutation event and the scripts they are used alongside, spreading one workflow over two objects; and `log` already means browser logs in Selenium (`manage().logs()`, log levels), so `driver.log` would be read as that. Keeping everything on `script` avoids both.
- **A single `pin` covering run-always and run-on-demand.**
  - Fewer commands, and it matches what Java and JavaScript ship today. But those are the bindings that quietly took the run-always meaning while Python took run-by-handle — the shared name is what let them diverge without anyone noticing. Two named commands make the choice explicit and force each binding to say which it implements.
- **A single merged console/error handler.**
  - One subscription maps directly to the `log.entryAdded` event that carries both, so it is the least to implement. But a user almost always wants console output or uncaught errors, not both interleaved, and a merged handler makes every subscriber re-filter by type; splitting moves that demultiplex into the binding, done once instead of by every user.
- **Returning a bare id from `add`.**
  - It is what every binding returns now, and an integer is the least it can hand back. But once code holds an id, anything more we later want — removing through the handle, exposing what it observes, disabling it — needs a new call or parameter, where an object absorbs it behind the same return. The cost is one type per registration the binding already has internally.
- **Observing attribute mutations only.**
  - It is what most bindings ship, and attribute changes are the common case. But `MutationObserver` reports child-list and character-data natively, so attributes-only discards capability the browser already provides, and Python already exposes the full set. Selecting types per handler keeps the common case a one-liner without capping the rest.
- **Exposing the raw protocol entry as the payload.**
  - A direct passthrough — no shaping code, and it tracks the spec automatically. But the raw entry differs field by field across the `log` and `script` domains and omits the resolved source location and stack trace these events are usually consumed for; a shaped payload gives the same fields in every binding and extracts them once.

## Consequences

- Convergence is mostly reclassifying what exists: Java and JavaScript rename today's `pin` (a
  preload script) to `preload`, add a run-by-handle `pin`, and return registration objects instead
  of ids; Python adds `preload` and drops its second payload shape; Ruby adds `execute`, `pin`,
  `preload`, and the DOM-mutation handler; .NET builds the high-level surface it lacks.
- `execute` overlaps the existing `execute_script`; whether it supersedes that method is a separate
  migration decision, not settled here.
