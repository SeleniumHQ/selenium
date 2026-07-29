# 17786. Behavioral contract for the low-level WebDriver BiDi layer

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17786

## Context

The WebDriver BiDi specification is defined in CDDL. Any client implementation has a low-level layer
that turns typed calls into wire messages and wire messages back into typed objects. It sits above a
transport (which sends commands and correlates responses by id) and below the orchestration and high-level
API that build on it. *This record is about the low-level layer.*

These behaviors are observable at the wire boundary, so bindings diverge on them without a shared
reference. One contract can state them for every binding at once — the same behavior in any language.

The transport layer (the connection that carries messages and matches responses to their commands) and
the orchestration layer (session lifecycle, event subscription and routing, and the high-level API these
feed) are out of scope.

## Decision

The spec settles the layer's baseline: spec strings reach the wire verbatim, an *omitted* field stays
distinct from an explicit *null*, and a union resolves by the spec's declared rule rather than a structural
guess. What the spec leaves open, this record decides.

Where the type system prevents a violation it satisfies the contract: a static binding whose types make
an invalid outbound payload unconstructable meets decision 1 at compile time. Inbound is different — a
statically-typed deserializer fills a correctly-typed object from malformed input (typically a null in a
non-nullable field) and returns it as valid, so the inbound decisions must be exhibited at runtime, not
merely declared in types or schema.

1. **Outbound is validated before sending.** A caller mistake surfaces as a local error rather than a
   remote round-trip. For all commands defined in the spec:
   - **Error if an enum value is undefined**, or a nullable constant is set to anything but its literal
     or null;
   - **Error unless all required fields are set**;
   - **Error if an unknown property is set**, unless the spec marks its type as extensible.

   A static binding gets these from its type system; a dynamic one must check them explicitly.

2. **Inbound is validated against the resolved type.** Process error responses first: a remote error
   surfaces as an error even if its payload fails validation — the checks below must not turn it into a
   local serialization failure. The error's contents and shape are otherwise out of scope.

   Otherwise, once the spec's union rule resolves the payload's type (if applicable), each mismatch is
   handled by its kind:
   1. **Error if corrupted** — the value cannot fit the resolved type: a null in a non-nullable field, a
      wrong primitive type, a cardinality mismatch, a non-object where an object is expected.
   2. **Warn if a required field is missing** — the field must be left *omitted* (not an explicit *null*,
      and not a generic placeholder), so an implementation based on a previously generated spec does not fail
      against a browser implementing a more recent one. An absent field reads the same whether it reflects
      that lag or a genuine defect — the layer cannot tell them apart — so it warns rather than errors,
      leaving a strict mode to escalate to an error for callers who want it.
   3. **Warn if a property is undeclared** — a property the type does not define is tolerated rather than
      rejected (forward-compatibility). Where an extensible type's data can be sent again through a command —
      the received type or its command-parameter counterpart is extensible — any unknown property it arrived
      with is kept on the object, so a caller can reproduce it on the wire: a vendor attribute received on a
      `network.Cookie` can be set again through `storage.setCookie` unchanged.

   Each warning identifies the type and the field or property at fault; its level, format, and channel are
   the implementation's.

   A closed vocabulary with no catch-all — a union such as `script.RemoteValue`, or an enum token outside
   its defined set — errors on the unknown member rather than coercing it onto a defined one; an error
   response's code is the exception, surfacing under the rule above rather than failing here.

3. **All objects must be typed, with spec-mirrored names.**
   - **Typed, not raw maps.** Parameters and results are typed value objects: an enum is the language's
     closed-vocabulary type, and each variant of a union is a distinct type, branched on by type rather than
     by inspecting a tag value.
   - **Full numeric precision.** An int64- or bigint-range value uses the language's wide-integer or
     arbitrary-precision type, never a narrowing double.
   - **Spec-mirrored names.** Method and property names mirror the spec command and its wire keys, in the
     language's idiom.
   - **Faithful to what was received.** The layer represents received values as they arrived — no
     normalization, coercion, or lossy re-encoding — so what a caller reads back is what the wire carried.

   Further language sugar belongs in the higher public layer, not here.

## Considered options

- **Mandate generation rather than specify behavior.** Generation does not by itself guarantee any
  behavior and adds cost where it isn't ergonomic; the behaviors are identical however the code is produced.
  Rejected: the contract is the behavior, generation an optional strategy.
- **Rely on the type system alone, with no runtime conformance.** Let outbound checks fall out of
  compilation and inbound objects out of casting, with no runtime rejection. Rejected: a statically-typed
  deserializer fills a correctly-typed object from malformed input and returns it as valid, so types alone
  pass inbound corruption through — the contract has to fire at runtime.
- **Defer outbound validation to the server** (decision 1). Send the command and let the remote end return
  the error the spec defines. Rejected: a local error is clearer and cheaper than a round-trip, and a static
  binding gets it for free.
- **Enforce required-ness inbound too** (decision 2). Error on a missing required field as the outbound path
  does. Rejected: the remote end is not ours to control, so a browser lagging a newly-required field would
  cost the caller the whole message until Selenium regenerated and shipped a fix — a hard block over a value
  no caller depended on. Tolerating absence costs the caller nothing and never blocks them.
- **Keep inbound strict, relaxing reactively via a manifest** (decision 2). Type inbound required-ness as
  present-or-error, and annotate the specific lagging fields in a checked-in manifest so the generator
  relaxes only those. Rejected: inbound strictness has no user-facing value, and even scoped to one field it
  still blocks the caller until the project notices the lag, annotates it, and ships a release — a reactive
  burden Selenium cannot promise. Tolerating absence and warning preserves the same signal with nothing to
  maintain.
- **Tolerate malformed values, not only absence** (decision 2). Best-effort a wrong-typed or unmappable
  value rather than erroring. Rejected: unlike a missing field, a present-but-invalid value cannot yield a
  valid typed object — tolerating it means a placeholder or a broken object, the failure this layer exists
  to prevent.
- **Tolerate an unknown `RemoteValue` variant instead of erroring** (decision 2). Surface an unknown-value
  carrier that keeps the raw discriminator rather than erroring. Rejected: the trigger is rare (the
  value-type set is near-complete) and the carrier is a permanent cost — an unknown branch every exhaustive
  match must handle. Its one merit — a carrier is more recoverable than an error, since a consumer can
  re-derive "throw on unknown" on top of it, not the reverse — does not outweigh that; a binding that wants
  it can still layer one on top.
- **Enforce required-ness in the object's constructor** (decisions 1 & 2). Let the object reject a missing
  field itself rather than at the serialization boundary. Rejected: constructor enforcement is symmetric —
  it rejects an incomplete inbound payload as readily as an outbound one, making tolerated absence
  impossible. A permissive object with enforcement at the boundaries is what lets the two directions differ.
- **Surface message-level extras in this layer** (decision 2) rather than leaving them to the transport.
  Rejected: the envelope is the transport's; this layer governs per-type extensibility only.
- **Retain extras on every extensible type** (decision 2), not only those that are sent back. This is the right
  choice for a public surface, which cannot narrow later without dropping a field users rely on. Rejected
  here only because the layer is internal: it can scope tight now and widen later at no cost. *This is the
  one decision the internal premise turns on.*
- **Raw dicts rather than typed objects** (decision 3); the spec permits it. Rejected: raw maps structurally
  cannot do union dispatch, field checks, or a faithful record of what was received.
- **Free naming rather than mirroring the spec** (decision 3). Rejected: divergent surface names let the
  bindings drift out of step with the spec and one another, defeating the cross-binding coherence that is the
  point of one contract across many languages.

## Consequences

- Conformance is checkable independently of how the layer is built — any language, generated or
  hand-written — so long as the runtime behavior matches.
- Required-ness is asymmetric: a required field must be present to send (decision 1) but is tolerated when
  absent on receipt (decision 2) — the layer validates what it controls and accepts what it does not.
- Tolerating absence constrains the type, not just the deserializer: a static binding cannot type an inbound
  field non-null yet leave it omitted when missing. A nullable slot suffices for most fields (real data is
  never null there, so null marks omitted); a required *nullable* field (network `context`/`navigation`,
  response sizes, log `text`, ~30 in all) instead needs omitted kept distinct from null. The trigger is
  schema-detectable (`required ∧ nullable`).
