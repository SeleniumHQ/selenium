# 17786. Behavioral contract for the low-level WebDriver BiDi layer

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17786

## Context

The WebDriver BiDi specification is defined in CDDL. Any client implementation has a low-level layer
that turns typed calls into wire messages and wire messages back into typed objects. It sits above a
transport (which sends commands and correlates responses by id) and below the orchestration and high-level
API that build on it. *This record is about the low-level layer.*

These behaviors surface only at the wire boundary, and nothing shared enforces them, so bindings drift
apart without a common reference.

The transport layer (the connection that carries messages and matches responses to their commands) and
the orchestration layer (session lifecycle, event subscription and routing, and the high-level API these
feed) are out of scope, as is any ergonomic sugar over these types that a higher public layer adds.

## Decision

In this record, "the spec" is the declared schema the layer validates against, which includes all relevant
published WebDriver BiDi specifications and any vendor-defined extensions. The spec fixes the layer's
baseline: spec strings reach the wire verbatim, an *omitted* field stays distinct from an explicit `null`,
and a union resolves by the rule the spec declares. What it leaves open,
this record decides in three parts. The first is the typed **representation** the layer exposes; the other
two are behavior observable at the wire boundary: what it sends **outbound**, and what it receives
**inbound**.

### Representation

The layer mirrors the spec's modules in the language: each command becomes a typed call, each event a
typed payload, and each data type a typed object. A caller creates them to send and reads them on receipt.

1. **Represent payloads as typed objects, not raw maps.** Parameters, results, and event payloads must be
   typed objects: an enum is the language's closed-vocabulary type, and each variant of a union is a
   distinct type, though variants with identical fields may share a single type that records which variant a
   value is. Where the spec marks a type extensible, the object also carries an untyped map for the fields
   the spec does not declare; a non-extensible type does not. A key the type declares must never appear in
   that map.
2. **Mirror the spec's command and field names.** Method and field names must follow the spec command
   and its wire keys, in the language's idiom.
3. **Preserve a numeric value's full range and precision.** The native type chosen for a numeric value must
   cover the full range the spec declares for it, with no narrowing or lossy conversion. BiDi integers exceed
   a 32-bit integer's range, so a binding must not hold them in one. A field with a narrower declared range
   may use a narrower native type that still covers it.
4. **Hold a value strictly to its declared type, with no coercion.** This is a definition, not a behavior of
   its own: the outbound (decision 5) and inbound (decision 7) decisions are what enforce it. A value must be
   a valid instance of its declared type; the layer must treat it as invalid when it fails:
   - **structurally**: a `null` in a non-nullable field, an incorrect primitive type, a cardinality
     mismatch (a list where a single value is declared, or vice versa), or a non-object where a typed object
     is expected. A primitive matches by JSON kind, not language representation: `number` admits any JSON
     number, while `integer` rejects a fractional value (`5.7`) but accepts a whole one written `5` or `5.0`.
   - **by vocabulary**: an enum value outside its defined set, a nullable constant set to anything other
     than its literal or `null`, a closed-union discriminator the spec does not declare (such as an unknown
     `script.RemoteValue` type), or a payload that fails to select any variant (e.g., a missing
     discriminator or insufficient structural fields).

### Outbound

An outbound payload is Selenium's responsibility. Unless it strictly conforms to the spec, the layer must
error instead of sending it (caught at compile time where a binding's types allow, otherwise at runtime).

5. **Reject an invalid or missing value.** An invalid value does not match its declared type (decision 4);
   a missing one is a required field without a value.
6. **Send an extra field only on an extensible type.** An extensible type carries it in the map (decision 1)
   and serializes it; a non-extensible type has no such map, so an extra field cannot be represented.

### Inbound

An inbound payload is the remote end's responsibility; the layer must tolerate what it can accurately
represent and reject only what it cannot, providing flexibility for a remote end on a spec version newer or
older than the one the binding validates against.

7. **Reject an invalid value.** A value that is present but not a valid instance (decision 4)
   cannot yield a valid object, so the layer must raise an error.
8. **Tolerate a missing required field.** The layer must represent the missing field as *omitted* rather
   than an explicit `null` or a substituted placeholder. By default it must log a warning with the
   details; an optional strict mode may raise an error instead.
9. **Tolerate an undeclared field.** If the type is declared extensible, the layer must preserve the
   field in the type's map (decision 1). If it is not, the layer must log a warning that an undeclared field
   was received, and drop it.
10. **Preserve received values faithfully.** Fidelity is of the value, not its byte-form: a binding may hold
    any value it parses, a declared field or a retained extra alike, in an ergonomic native type (a 64-bit
    integer for a `js-int`, a date object for a date), provided it loses nothing and can reproduce what the
    wire carried. It must not truncate, round, re-case, or otherwise normalize a value beyond
    recovery.

An error response (a result the remote returns with an error code) must error for the provided reason, an
unrecognized error code included, even if that reason would otherwise fail one of the validations above.

## Considered options

- **Mandate generation rather than specify behavior.** Require each binding to generate its
  (de)serialization from the schema, rather than specify the behavior it must exhibit however built.
  Rejected: generation does not by itself guarantee any behavior and adds cost where it isn't ergonomic; the
  behaviors are identical however the code is produced, so the contract is the behavior and generation an
  optional strategy.
- **Rely on the type system alone, with no runtime conformance.** Let outbound checks fall out of
  compilation and inbound objects out of casting, with no runtime rejection. Rejected: a statically-typed
  deserializer fills a correctly-typed object from malformed input and returns it as valid, so types alone
  pass inbound corruption through, and the contract has to fire at runtime.
- **Raw dicts rather than typed objects** (decision 1); the spec permits it. Rejected: raw maps structurally
  cannot do union dispatch, validated field access, or closed-vocabulary enums.
- **Free naming rather than mirroring the spec** (decision 2). Rejected: divergent surface names let the
  bindings drift out of step with the spec and one another, defeating the cross-binding coherence that is the
  point of one contract across many languages.
- **Defer outbound validation to the server** (decision 5). Send the command and let the remote end return
  the error the spec defines. Rejected: a local error is clearer and cheaper than a round-trip, and a static
  binding gets it for free.
- **Enforce required-ness in the object's constructor** (decisions 5 and 8). Let the object reject a missing
  field itself rather than at the serialization boundary. Rejected: constructor enforcement is symmetric:
  it rejects an incomplete inbound payload as readily as an outbound one, making tolerated absence
  impossible. A permissive object with enforcement at the boundaries is what lets the two directions differ.
- **Tolerate malformed values, not only absence** (decision 7). Best-effort a wrong-typed or unmappable
  value rather than erroring. Rejected: unlike a missing field, a present-but-invalid value cannot yield a
  valid typed object, and tolerating it means a placeholder or a broken object, the failure this layer
  exists to prevent.
- **Tolerate an unknown `RemoteValue` variant instead of erroring** (decision 7). Surface an unknown-value
  carrier that keeps the raw discriminator rather than erroring. Rejected: the trigger is rare (the
  value-type set is near-complete), and the carrier is a permanent cost, an unknown branch every exhaustive
  match must handle. Its one merit is recoverability: a consumer can re-derive "throw on unknown" on top of
  a carrier, but not the reverse. That does not outweigh the cost, and a binding that wants a carrier can
  still layer one on top. This covers only a carrier for a discriminator the spec does not declare; a shared
  carrier for a declared variant a binding has not modeled distinctly is the decision-1 representation
  choice, not this behavior.
- **Enforce required-ness inbound too** (decision 8). Error on a missing required field as the outbound path
  does. Rejected: the remote end is not ours to control, so a browser lagging a newly-required field would
  cost the caller the whole message until Selenium regenerated and shipped a fix, a hard block over a value
  no caller depended on. Tolerating absence costs the caller nothing and never blocks them.
- **Keep inbound strict, relaxing reactively via a manifest** (decision 8). Type inbound required-ness as
  present-or-error, and annotate the specific lagging fields in a checked-in manifest so the generator
  relaxes only those. Rejected: inbound strictness has no user-facing value, and even scoped to one field it
  still blocks the caller until the project notices the lag, annotates it, and ships a release, a reactive
  burden Selenium cannot promise. Tolerating absence and warning preserves the same signal with nothing to
  maintain.
- **Surface message-level extras in this layer** (decision 9) rather than leaving them to the transport.
  Rejected: the envelope is the transport's; this layer governs per-type extensibility only.
- **Retain extras only where they can be sent back** (decision 9), narrower than every extensible type.
  Rejected: "can be sent back" has no schema-defined mapping (a `network.Cookie` round-trips through the
  differently-typed `storage.PartialCookie`), so the scope would differ across bindings. The spec's
  `Extensible` marker sanctions the extra fields themselves; retaining them on every extensible type is
  Selenium's own choice, at the cost of only a few kept fields on types nothing sends back.

## Consequences

- Conformance is checkable independently of how the layer is built, in any language and whether generated
  or hand-written, so long as the runtime behavior matches.
- Outbound validity differs in cost by binding: a static binding gets it from construction, while a
  dynamic binding must enforce it with an explicit runtime check. The contract requires the behavior from
  both; where a dynamic binding does not yet check, that is a gap to close, not an exemption.
- Required-ness is asymmetric: a required field must be present to send (decision 5) but is tolerated when
  absent on receipt (decision 8); the layer validates what it controls and accepts what it does not.
- Tolerating absence constrains the type, not just the deserializer: a static binding cannot type an inbound
  field non-null yet leave it *omitted* when missing. A nullable slot suffices for most fields (real data is
  never `null` there, so an *absent* field maps to `null` = *omitted*; a wire-level explicit `null` stays
  invalid per decision 7); a required *nullable* field (network `context`/`navigation`,
  response sizes, log `text`, ~30 in all) instead needs *omitted* kept distinct from `null`. The trigger is
  schema-detectable (`required ∧ nullable`).
