# 17670. BiDi implementation boundaries

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17670

## Context

Bindings use WebDriver BiDi to implement and extend the Selenium API. This record settles what
users program against: where the supported API ends and the internal BiDi implementation begins.

No binding conforms yet: each exposes BiDi implementation details from the driver object rather
than keeping them internal.

| Binding    | Current behavior |
|------------|------------------|
| Java       | Driver exposes the raw BiDi connection (`HasBiDi.getBiDi()`); protocol types are public |
| Python     | `driver.network` / `driver.script` are the right high-level names, but return the low-level BiDi modules (`bidi`-namespaced) instead of neutral wrappers |
| Ruby       | Driver exposes a BiDi accessor (`driver.bidi`) |
| .NET       | Driver extension returns a BiDi type (`AsBiDiAsync()` → `IBiDi`) |
| JavaScript | Driver exposes a BiDi accessor (`driver.getBidi()`) |

All bindings also expose a BiDi-named option to enable the session (`enableBiDi` / `enable_bidi`),
which can be renamed to be protocol-neutral.

## Decision

BiDi is an implementation mechanism, not a public API. Three decisions follow:

1. **The supported API is protocol-neutral.** It never references BiDi — no BiDi types, and
   nothing that hands a user a BiDi object. Users program against the Selenium API and its
   high-level APIs, under the deprecation policy.
2. **The BiDi implementation is internal and unsupported.** It faithfully implements the
   commands, events, and modules of the BiDi spec (and could be generated from the CDDL). It
   stays publicly reachable but is not governed by the deprecation policy: the spec is written to
   be stable, but because it is not ours we do not guarantee it. Each binding marks it internal
   by its own convention.
3. **Low-level access is by composition, never off the driver.** The implementation is reached
   by composing it with the driver — `BiDi::Protocol::Network.new(driver)` — never exposed as a
   member of the driver, because anything reachable off the driver reads implicitly as supported.

Everything else — orchestration, event dispatch, socket listening, transport — is an
implementation detail, likely private, left to each binding.

Marking a surface *Beta* does not satisfy decision 2 — Beta signals an API becoming supported,
the opposite of internal.

Illustratively (Ruby):

```ruby
driver.network.add_request_handler(...)                # supported — neutral, returns no BiDi type
BiDi::Protocol::Network.new(driver).add_intercept(...) # internal — composed with the driver, unsupported
driver.bidi.network.add_intercept(...)                 # not allowed — internal exposed as a driver member
```

## Considered options

1. Expose the whole protocol as a public API (Rejected)
   * the internal layer faithfully implements a living spec, so we cannot guarantee its stability — it can't be committed to as supported, public API
2. A supported, separate "mid-level" API for working with the internal BiDi implementation (Rejected)
   * protocol coupling — users build on BiDi-shaped concepts, the same trap CDP created
   * two supported surfaces — a protocol-neutral high-level one and a BiDi-shaped mid-level one — leave users unsure which to reach for
3. Expose the internal implementation as a driver member, e.g. `driver.bidi.network` (Rejected)
   * a member of the driver reads implicitly as supported; composing the class with the driver instead keeps it distinct
4. Internal implementation mechanism only, reached by composing with the driver (Accepted)

## Consequences

- Users never need to know which protocol services a command.
- Existing public surfaces that fail conformance are brought in line per the deprecation policy.
- Specific supported API behavior is specified in other ADRs.
