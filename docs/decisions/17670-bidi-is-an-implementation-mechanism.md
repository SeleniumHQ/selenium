# 17670. BiDi is an implementation mechanism, not a public API

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17670

## Context

Bindings use WebDriver BiDi to implement and extend the Selenium API. This record
settles BiDi's relationship to the public API: what users program against, and where
protocol code lives. CDP was managed differently across the bindings, but all of them
resulted in users needing to understand CDP implementation details to work with it
to one extent or another. This is happening in BiDi the same way.

No binding conforms yet: each exposes BiDi implementation details through the driver,
and none treats its BiDi namespace as internal.

| Binding    | Current behavior |
|------------|------------------|
| Java       | Driver leaks the raw BiDi connection (`HasBiDi.getBiDi()`) — internal module plumbing surfaced on the driver; protocol types are public |
| Python     | `driver.network` / `driver.script` are the right high-level names, but return the low-level BiDi modules (`bidi`-namespaced) instead of neutral wrappers, exposing the low-level API |
| Ruby       | Driver exposes a BiDi accessor (`driver.bidi`) |
| .NET       | Driver extension returns a BiDi type (`AsBiDiAsync()` → `IBiDi`) |
| JavaScript | Driver exposes a BiDi accessor (`driver.getBidi()`) |

## Decision

BiDi is an implementation mechanism, not a public API. New capabilities are exposed as
high-level, protocol-neutral APIs, idiomatic per language, subject to our standard
deprecation policy. Every binding must:

1. never reference BiDi in its supported API — no BiDi types in signatures, and no driver method or property that exposes BiDi or hands back a BiDi object; and
2. keep BiDi implementation code (including everything generated from CDDL) visibly internal — marked per language convention as not intended for public consumption.

This relocates low-level access, it does not remove it: the BiDi namespace stays reachable
by naming it directly (`BiDi::Network.new(driver)`) — technically reachable, but unsupported,
undocumented, and subject to change without warning — and what is removed is the driver as a
path into BiDi. Each binding in the table above shows that one fault — the driver offering a
way in. `HasBiDi.getBiDi()` is the starkest: not access anyone uses, just internal plumbing
that surfaced on the driver.

Marking a surface *Beta* (or any "stabilizing toward public" status) does not satisfy
requirement 2: Beta signals an API on its way to becoming supported, which is the opposite
of internal.

Illustratively (Ruby):

Supported, high-level — `driver.network` is the protocol-neutral API; it returns a neutral
wrapper, not a BiDi type, and offers no path down to the protocol:

```ruby
driver.network.add_request_handler(...)
```

Internal, low-level — reached only by naming the BiDi namespace explicitly; accessible but internal/unsupported:

```ruby
BiDi::Network.new(driver).add_intercept(phases: [:before_request_sent], url_patterns: [...])
```

Not allowed — the supported API providing a path to the low-level protocol, whether through a
dedicated accessor or through the high-level object itself:

```ruby
driver.bidi.network.add_intercept(...)   # a BiDi accessor on the driver
driver.network.add_intercept(...)        # driver.network leaking the low-level call
```

## Considered options

1. Expose the whole protocol as a public API (Rejected)
   * the protocol is generated from a living CDDL spec and regenerated as the spec changes, so we cannot manage deprecations on it — it can't be committed to as supported, public API
   * exposing the raw protocol is not user-friendly syntax anyway
2. A supported, separate public API for conveniently working with the low-level BiDi implementation — a "mid-level" tier beside the high-level API (Rejected)
   * protocol coupling — users build on BiDi-shaped concepts, the same trap CDP created
   * mixing a protocol-agnostic high-level API with a BiDi-specific mid-level one leaves users unsure which to reach for
   * it raises a large set of unanswered questions about which level owns which orchestration functionality
3. Allow methods and classes to reference BiDi (Rejected)
   * users shouldn't need to know the underlying implementation mechanism; things should just work without additional ceremony
4. Internal implementation mechanism only (Accepted)

## Consequences

- Users never need to know which protocol services a command.
- Each new capability requires API design work across bindings before it ships.
- Existing public surfaces that fail the conformance tests are brought in line per the
  deprecation policy, tracked in the ADR implementation-tracking issue linked from this
  record's PR.
- How the internal BiDi layer is produced and structured — generated definitions, their
  separation from orchestration — is decided separately.
