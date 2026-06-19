# 0001. Java WebDriver BiDi bindings are generated from the CDDL spec and expose stateful module classes with subscription-based event cancellation

- Status: Proposed
- Date: 2026-06-19
- Discussion: <!-- link to this record's PR once opened -->

## Context

The WebDriver BiDi specification is defined in CDDL (Concise Data Definition Language). Selenium's
Python and JavaScript/TypeScript bindings already generate their BiDi types and module classes
directly from the merged CDDL spec via a pipeline that produces a binding-neutral JSON model.

The Java binding has grown 143+ hand-written files covering the same protocol surface. These files
are now marked `@Beta` so they can be replaced before the API is considered stable. Several
API-shape decisions made during hand-authoring are inconsistent with the spec structure and with
the other bindings.

Three specific shape questions have cross-binding implications and need a recorded decision:

1. **Module instantiation** — hand-written classes use a public constructor (`new Network(driver)`).
   A factory method (`Network.create(driver)`) can enforce the BiDi capability check at the call
   site and throw a typed exception; a public constructor cannot.

2. **Event subscription lifecycle** — hand-written `onXxx()` methods return `void` or a raw `long`
   listener ID with no standard removal API. Users cannot cancel an individual subscription without
   reaching into internal listener management.

3. **Commands-only vs. unified modules** — `BrowsingContext` exposes commands, while
   `BrowsingContextInspector` exposes events for the same domain. The Network domain has a single
   class for both. The split is not in the spec and creates a confusing dual-class API for one domain.

An additional Java-specific question: whether to continue hand-writing or switch to generation.
Python and JavaScript already generate from the same CDDL source; continued hand-authoring means
Selenium needs three separate implementations to track every spec change.

A detailed design proposal covering the full generator implementation (phases, naming conventions,
Bazel wiring, type mapping, enhancements manifest) is at
https://gist.github.com/pujagani/0a62197fd7c9b6d120e3a658fd7381d0.

## Decision

**Java BiDi bindings are generated from the CDDL spec.** The generator reads two JSON artifacts
produced by the existing JavaScript pipeline (`bidi-ast.json` for type definitions,
`bidi-model.json` for the command/event model) and emits Java source. An enhancements manifest
captures things CDDL cannot express (protocol quirks, extra helper methods).

**Each BiDi protocol domain is one module class** containing both its commands and its events.
There is no split between a "command class" and an "inspector/listener class" for the same domain.

**Module classes are instantiated via a static factory method**, not a public constructor:

```java
Network network = Network.create(driver);  // throws BiDiException if driver lacks BiDi
```

The factory checks `driver instanceof HasBiDi` and throws `BiDiException` (not
`IllegalArgumentException`) on failure. The constructor is `private`. This applies to all
generated module classes across bindings — the precise factory name may differ by language idiom
(`create` in Java, `from_driver` / `Network(driver)` in others), but the capability check and
typed exception are required.

**Event subscriptions return a cancellation handle** (`Subscription` in Java), not `void` or a raw
listener ID. Each `onXxx()` call returns an independent handle; closing it cancels only that
subscription:

```java
Subscription sub = network.onBeforeRequestSent(event -> { ... });
// later:
sub.close();  // or try-with-resources
```

`Subscription` in Java is a `@FunctionalInterface` extending `AutoCloseable` with `void close()`
(no checked exception). Module classes hold **no listener tracking state** — the handle captures
the listener ID at subscription time and cancels it on `close()`. Module classes are **not**
`AutoCloseable` themselves; there is no "close a domain" concept in the spec. Each binding
implements the same semantics with its own idiomatic cancellation type.

**Naming:** where a domain name changes from the hand-written form (e.g. `LogInspector` → `Log`),
the old name is deprecated with a pointer to the new name and removed after one release. All
generated classes carry a `@Beta` annotation for the generation release and the `@Beta` is removed
in the release after the cutover.

## Considered options

- **Keep hand-writing Java BiDi classes** — no generation cost, no new pipeline to maintain. Rejected
  because spec coverage diverges over time: every new spec event/command requires a manual PR to three
  bindings independently. The `@Beta` window exists precisely to allow this switch.

- **Static utility pattern (CDP style)** — commands return `Command<T>` objects; events return
  `Event<T>` objects; callers are responsible for sending and subscribing. Rejected because BiDi
  module classes must carry state (`BiDi bidi`) since each WebDriver instance has its own BiDi
  session. Exposing a stateless utility class forces callers to manage the session reference
  themselves on every call, which is worse ergonomics than what the hand-written classes already
  provide.

- **Split commands/events into separate classes per domain** — matches the existing
  `BrowsingContext` / `BrowsingContextInspector` pattern. Rejected because the split is not in
  the spec, is not followed by the Network domain today, and forces users to instantiate two objects
  and manage two lifecycles for one domain. Unifying is a breaking change allowed by `@Beta`.

- **Return `void` from event subscription methods** — simple, no extra type. Rejected because it
  provides no way for the caller to cancel an individual subscription without going through internal
  APIs. The BiDi protocol itself has a subscription-cancellation concept; the Java API should expose
  it.

- **Return raw `long` listener IDs** — exposes internal listener registry IDs directly. Rejected
  because it leaks an implementation detail, requires callers to call a separate `removeListener(id)`
  method, and gives no type-safety about what kind of thing the `long` represents.

## Consequences

**Breaking changes** (all under `@Beta` — users have one release of warning before removal):

- `new Network(driver)` → `Network.create(driver)` — public constructor removed
- `new Script(driver)` → `Script.create(driver)` — same pattern
- `LogInspector` → `Log` — class renamed; `LogInspector` deprecated for one release
- `BrowsingContext` + `BrowsingContextInspector` → unified `BrowsingContext` —
  `BrowsingContextInspector` is deleted; event subscription is now on `BrowsingContext`
- `onXxx()` return type changes from `void` / `long` to `Subscription` — callers that ignored the
  return value are unaffected; callers storing raw `long` IDs must switch to `sub.close()`

**Easier:** spec evolution — new events and commands require only updating the CDDL source;
the generator propagates changes to Java automatically. Cross-binding consistency — type names
and method names are derived mechanically from the same CDDL source. Individual subscription
cancellation is now first-class.

**Harder:** debugging generated code requires understanding the generator pipeline.

**Follow-up decisions this one makes necessary:** once generated module classes are stable,
`RemoteWebDriver` can be updated to call BiDi module classes directly instead of the classic
WebDriver wire protocol. That migration is out of scope for this decision.

## Binding status

| Binding    | Status   | Notes / tracking link |
|------------|----------|-----------------------|
| Java       | pending  | Generator implementation tracked in this PR |
| Python     | complete | Already generates from CDDL; factory/subscription pattern TBD |
| Ruby       | pending  |                       |
| .NET       | pending  |                       |
| JavaScript | complete | Already generates from CDDL; subscription type TBD |

## Appendix

### Existing generator pipeline (JavaScript)

The JavaScript generator (`javascript/selenium-webdriver/generate_bidi.mjs`) runs in three stages:
1. Parse and merge CDDL spec files into an AST
2. Build a binding-neutral command/event model from the AST
3. Emit TypeScript bindings from the model

The Java generator reads the JSON output of stages 1 and 2 (`bidi-ast.json`,
`bidi-model.json`) — no CDDL parsing in Java.

### Subscription interface (Java)

```java
@FunctionalInterface
public interface Subscription extends AutoCloseable {
    @Override void close();  // narrows checked exception to unchecked
}
```

Generator event template (3 lines per event):

```java
public Subscription onBeforeRequestSent(Consumer<BeforeRequestSentParameters> callback) {
    long id = bidi.addListener(BEFORE_REQUEST_SENT, callback);
    return () -> bidi.removeListener(id);
}
```

### Module class shape (Java)

```java
@Beta
public class Network {   // NOT AutoCloseable

    private static final Event<BeforeRequestSentParameters> BEFORE_REQUEST_SENT =
        new Event<>("network.beforeRequestSent", BeforeRequestSentParameters::fromJson);

    private final BiDi bidi;

    private Network(BiDi bidi) { this.bidi = Require.nonNull("BiDi", bidi); }

    public static Network create(WebDriver driver) {
        Require.nonNull("WebDriver", driver);
        if (!(driver instanceof HasBiDi)) {
            throw new BiDiException("WebDriver instance must support BiDi protocol");
        }
        return new Network(((HasBiDi) driver).getBiDi());
    }

    public AddInterceptResult addIntercept(AddInterceptParameters params) {
        return bidi.send(new Command<>(
            "network.addIntercept", params.toMap(), AddInterceptResult::fromJson));
    }

    public Subscription onBeforeRequestSent(Consumer<BeforeRequestSentParameters> callback) {
        long id = bidi.addListener(BEFORE_REQUEST_SENT, callback);
        return () -> bidi.removeListener(id);
    }
}
```
