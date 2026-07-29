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

The spec fixes the layer's baseline — spec strings reach the wire verbatim, an *omitted* field stays
distinct from an explicit *null*, and a union resolves by the spec's declared rule rather than a structural
guess; what it leaves open, this record decides, as behavior observable at the wire boundary, whatever a
binding's types guarantee on their own.

1. **A value must be a valid instance of its declared type — sent or received.** The layer neither sends
   nor accepts one that does not fit:
   - **structurally** — a null in a non-nullable field, a wrong primitive type, a cardinality mismatch (a
     list where a single value is declared, or the reverse), or a non-object where a typed object is
     declared. A primitive matches by JSON kind, not language representation: `number` admits any JSON
     number, while `integer` rejects a fractional or float-encoded one (a whole-valued `5.0` included);
     neither direction coerces across the boundary silently.
   - **by vocabulary** — an enum value outside its defined set, a nullable constant set to anything but its
     literal or null, an unresolvable member of a closed union (such as `script.RemoteValue`), or a payload
     that resolves to no variant at all (a missing discriminator, or structural fields insufficient to
     select one).

   A static binding gets this from its type system — an invalid outbound payload is unconstructable — but a
   correctly-typed object can still be filled from malformed input, so inbound the check must run at runtime;
   a dynamic binding checks both directions explicitly.

2. **Outbound, a caller's own missing or extra field is rejected.** For any command defined in the spec, a
   missing required field, or an unknown property on a non-extensible type, is a local error rather than a
   remote round-trip — strict, because the payload is the caller's to get right.

3. **Inbound, those same two are tolerated.** Process error responses first: a remote error surfaces as an
   error even if its payload fails validation — an unrecognized error code included — and the checks here
   must not turn it into a local serialization failure; the error's contents are otherwise out of scope.
   Otherwise these rules govern every typed payload the layer parses — a command's result and a
   server-initiated event's parameters alike, with response correlation and event routing out of scope:
   - **A missing required field warns, and is left *omitted*** — not an explicit *null*, and not a generic
     placeholder — so a binding generated from a newer schema does not fail against a browser still omitting
     a newly-required field. An absent field reads the same whether it reflects that lag or a genuine
     defect — the layer cannot tell them apart — so it warns rather than errors, with an opt-in strict mode
     to escalate to an error.
   - **An undeclared property warns, and is tolerated** (forward-compatibility). Where the type is
     round-trippable — the received type or its command-parameter counterpart is extensible — the unknown
     property is kept on the object, so a caller can reproduce it on the wire: a vendor attribute received on
     a `network.Cookie` can be set again through `storage.setCookie` unchanged. Other undeclared properties
     are tolerated but not retained.

   Each warning identifies the type and the field or property at fault; its level, format, and channel are
   the implementation's.

4. **All objects must be typed, with spec-mirrored names.**
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
- **Defer outbound validation to the server** (decision 2). Send the command and let the remote end return
  the error the spec defines. Rejected: a local error is clearer and cheaper than a round-trip, and a static
  binding gets it for free.
- **Enforce required-ness inbound too** (decision 3). Error on a missing required field as the outbound path
  does. Rejected: the remote end is not ours to control, so a browser lagging a newly-required field would
  cost the caller the whole message until Selenium regenerated and shipped a fix — a hard block over a value
  no caller depended on. Tolerating absence costs the caller nothing and never blocks them.
- **Keep inbound strict, relaxing reactively via a manifest** (decision 3). Type inbound required-ness as
  present-or-error, and annotate the specific lagging fields in a checked-in manifest so the generator
  relaxes only those. Rejected: inbound strictness has no user-facing value, and even scoped to one field it
  still blocks the caller until the project notices the lag, annotates it, and ships a release — a reactive
  burden Selenium cannot promise. Tolerating absence and warning preserves the same signal with nothing to
  maintain.
- **Tolerate malformed values, not only absence** (decision 1). Best-effort a wrong-typed or unmappable
  value rather than erroring. Rejected: unlike a missing field, a present-but-invalid value cannot yield a
  valid typed object — tolerating it means a placeholder or a broken object, the failure this layer exists
  to prevent.
- **Tolerate an unknown `RemoteValue` variant instead of erroring** (decision 1). Surface an unknown-value
  carrier that keeps the raw discriminator rather than erroring. Rejected: the trigger is rare (the
  value-type set is near-complete) and the carrier is a permanent cost — an unknown branch every exhaustive
  match must handle. Its one merit — a carrier is more recoverable than an error, since a consumer can
  re-derive "throw on unknown" on top of it, not the reverse — does not outweigh that; a binding that wants
  it can still layer one on top.
- **Enforce required-ness in the object's constructor** (decisions 2 & 3). Let the object reject a missing
  field itself rather than at the serialization boundary. Rejected: constructor enforcement is symmetric —
  it rejects an incomplete inbound payload as readily as an outbound one, making tolerated absence
  impossible. A permissive object with enforcement at the boundaries is what lets the two directions differ.
- **Surface message-level extras in this layer** (decision 3) rather than leaving them to the transport.
  Rejected: the envelope is the transport's; this layer governs per-type extensibility only.
- **Retain extras on every extensible type** (decision 3), not only those that are sent back. This is the right
  choice for a public surface, which cannot narrow later without dropping a field users rely on. Rejected
  here only because the layer is internal: it can scope tight now and widen later at no cost. *This is the
  one decision the internal premise turns on.*
- **Raw dicts rather than typed objects** (decision 4); the spec permits it. Rejected: raw maps structurally
  cannot do union dispatch, field checks, or a faithful record of what was received.
- **Free naming rather than mirroring the spec** (decision 4). Rejected: divergent surface names let the
  bindings drift out of step with the spec and one another, defeating the cross-binding coherence that is the
  point of one contract across many languages.

## Consequences

- Conformance is checkable independently of how the layer is built — any language, generated or
  hand-written — so long as the runtime behavior matches.
- Required-ness is asymmetric: a required field must be present to send (decision 2) but is tolerated when
  absent on receipt (decision 3) — the layer validates what it controls and accepts what it does not.
- Tolerating absence constrains the type, not just the deserializer: a static binding cannot type an inbound
  field non-null yet leave it omitted when missing. A nullable slot suffices for most fields (real data is
  never null there, so null marks omitted); a required *nullable* field (network `context`/`navigation`,
  response sizes, log `text`, ~30 in all) instead needs omitted kept distinct from null. The trigger is
  schema-detectable (`required ∧ nullable`).
