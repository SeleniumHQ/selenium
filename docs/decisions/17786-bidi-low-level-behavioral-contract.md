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

## Decision

**Any implementation of this layer must exhibit the behaviors below.** Some follow from conforming to the
WebDriver BiDi specification; the rest are choices this record standardizes so bindings don't diverge —
the next section marks which is which.

An implementation must exhibit them at runtime, not merely declare them in its types or schema. A
statically-typed deserializer will fill a correctly-typed object from malformed input — most often a null
in a non-nullable field — and return it as valid unless a check is written, so a layer can type-check
perfectly and still violate the contract. Conformance is shown by the rejection firing on malformed
input, not by a happy-path round trip or matching types.

### How to read this contract

Each item is tagged with the *kind* of requirement it is:

| Tier | Meaning |
|---|---|
| **Compliance** | Follows from conforming to the spec. Enumerated for comprehensiveness and correctness. |
| **Decision** | A genuine choice this record owns, not compelled by the spec. |

The behaviors are uniform across every binding — a malformed payload is malformed in any language. Only
their *form* varies:

- **Mechanism** — a static type system or runtime checks.
- **Object** — a dataclass, a record, a value type.
- **Exception** — a shared error *category* is required; the exact type is idiomatic.

### Outbound (constructing and sending)

1. **Spec strings go on the wire verbatim.** *(Compliance.)* The exact spec token appears on the wire for
   method names, enum values, and fixed/const values; no casing or naming transform alters it. The
   spec's `beforeunload` goes on the wire unchanged; a binding that camelCases it to `beforeUnload` fails.

2. **Optionality and nullability are represented exactly as the spec declares.** *(Compliance.)*
   - **Omitted is distinct from explicit null.** An unset optional is *absent* from the payload; an
     explicit null serializes as `null`. The remote end acts on the difference.
   - **Per-field nullability is honored** as declared.
   - **A nullable constant is a settable value.** Where a field's value is a constant *and* nullable
     (`browsingContext.setBypassCSP`, `emulation.setScriptingEnabled`), the layer must send the literal
     *or* `null`, never only the literal. (A non-nullable constant is always the literal, so it can be a
     fixed value.)

3. **Outbound is validated locally, before sending.** *(Decision.)* Enum and const-value membership,
   required-field presence, and no unknown properties on closed types are checked before the message
   leaves, so a caller mistake is a local error rather than a server round-trip. Passing an enum value the
   spec doesn't define, for instance, raises locally instead of being sent for the remote end to reject —
   as does a value neither the literal nor `null` for a nullable constant (a `true`/`null` field rejects
   `false`; see item 2). A static
   binding gets the check from the type system; a dynamic one does it explicitly. (These classes carry
   only spec-modeled, validated commands; a higher layer needing a command the spec doesn't model would
   create its own separate implementation rather than route untyped data through a typed one.)

### Extensibility (cross-cutting)

4. **Extensibility follows the spec's per-type signal, inbound and outbound.** *(Decision.)* Whether a
   type admits extra properties is read from its own spec definition, per type and never a hand-maintained
   list, so vendor extension works exactly where the spec permits it and validation stays strict
   everywhere else. In practice: an `Extensible` type carries caller-supplied extras onto the wire (vendor
   fields such as `goog:*` capabilities or vendor proxy keys) and tolerates unknown inbound properties,
   while a closed type rejects unknown properties outbound (item 3) and accepts-but-ignores them inbound
   (item 7). The one prohibition is never injecting arbitrary properties into a *closed* type, which would
   defeat item 3. (Message-level extras are separate: the command envelope is itself `Extensible`
   (`Command = { id, CommandData, Extensible }`), but it is formed above this layer by the transport, so
   those extras are out of scope here — neither required nor forbidden, surfaced wherever a binding likes.)

### Inbound (receiving and parsing)

5. **Variants and vocabulary are resolved by the spec's declared rule.** *(Compliance.)* A union resolves
   to a variant by its declared rule (discriminator value, presence of required keys, or declared
   default), never a re-derived structural guess, so a valid payload always resolves to the same variant;
   resolving it wrong is a parsing bug. Raising on an *unrecognized* enum token or union variant is the
   strict default (a Decision, item 9), not part of this compliance floor; for a union whose arms are
   all objects, a non-object payload has no variant to select and raises.

6. **Inbound fields are validated strictly against the resolved type.** *(Decision.)* Once item 5 has
   resolved the type, each field is checked against it, because a wrong field populated silently — a null
   dropped into a non-nullable slot, say — misrepresents the protocol state instead of failing. Each of
   these raises: a missing required field; a null in a non-nullable field; a value of the wrong primitive
   type; a list/scalar cardinality mismatch; a non-object where a field expects an object. Relaxations are
   reactive (item 9). **Satisfying item 5 does not satisfy item 6.**

7. **Unknown inbound properties never cause an error.** *(Compliance.)* Every type tolerates unknown
   properties — non-negotiable, because the spec permits extension. Most parsers do this by default; a
   reject-unmapped setting would violate it. (Whether an unknown property is also *preserved* is item 8.)

8. **Preserving extras is scoped to types that are both extensible and re-sendable.** *(Decision.)*
   Tolerating an unknown property (item 7) is the floor; *preserving* it — **storing** it readable after
   parse and **echoing** it back on serialization — is worth doing only where a received instance can go
   back out onto the wire, so it happens only when both spec-derivable facts hold:
   - **Extensible** — its CDDL definition includes the `Extensible` group (`Extensible = (*text => any)`),
     admitting arbitrary extra properties.
   - **Re-sendable** — it can appear within a command's parameters, so a received instance can be handed
     back.

   The types meeting both are read from the schema, not a fixed list — cookies, capabilities, and proxy
   configuration among them. A cookie read from `storage.getCookies`
   with a vendor attribute, then passed to `storage.setCookie`, must reach the wire with that attribute
   intact. Every other type (an extensible-but-inbound-only log entry, or a non-extensible type) tolerates
   and drops (item 7). Where a type both stores inbound extras and takes caller-set outbound extras, the
   two merge on serialization and a caller-set value wins. (Widening this scope, if the layer ever went
   public, is the alternative weighed in Considered options.)

9. **Inbound is strict by default, relaxed only reactively and uniformly.** *(Decision.)* The layer
   rejects spec-incorrect data rather than absorbing it, because a clear error beats silently
   misrepresenting the response, and it is cheaper to loosen a strict contract than to tighten a lenient
   one. When a real remote end is seen sending off-spec data, the specific field or command is relaxed
   through a documented, reversible change (citing the offending implementation and the spec issue),
   applied to every binding at once — never one alone, and never by starting lenient. One exception is
   sanctioned from the start: an enum that reports an error (an unrecognized error code in an
   `ErrorResponse`), where raising would swallow the error being reported; there, an unknown token is
   surfaced, not thrown.

### Surface

10. **Names mirror the spec, mapped to language idiom.** *(Decision.)* The surface method mirrors the spec
    command and params/fields carry idiomatic names of their wire keys, so the layer reads as a direct
    projection of the spec and cross-references cleanly across bindings. For example, a Python
    `set_viewport(device_pixel_ratio=…)` call serializes the wire key `devicePixelRatio` under
    `browsingContext.setViewport`. This is a naming convention rather than a spec requirement (keeping the
    *wire* names exact is item 1); language sugar belongs in the higher public layer, not here.

11. **Structured data is typed, not raw maps.** *(Decision.)* Params and results are typed value objects:
    enums are the language's closed-vocabulary type, and discriminated-union variants are distinct types
    branched on by type, not by inspecting a tag value. A `script.evaluate` result, for example, comes
    back as a `StringValue` or `NumberValue`, not a raw `{type, value}` map. This typing is the foundation
    the inbound items stand on: a raw-map surface structurally cannot do union dispatch (5), field checks
    (6), or read-only objects (12).

12. **Objects this layer hands to callers are read-only.** *(Decision.)* A received object that reaches a
    caller (e.g. the request inside a network handler) is immutable at the top level, because mutating it
    changes nothing on the wire and the layer would rather forbid the mutation than let it mislead. The
    caller reads the object and acts through the higher layer. Shallow immutability is enough; nested
    containers need not be deep-frozen.

## Considered options

The Compliance items (1, 2, 5, 7) have no valid alternative; a divergence there is a bug.

- **Specify a production method (mandate generation) rather than behavior.** Generation does not by
  itself guarantee any behavior and imposes cost where it isn't ergonomic; the behaviors are identical
  however the code is produced. Rejected: the contract is the behavior, generation an optional strategy.
- **Item 3 — defer to the server.** Send the command and let the remote end return an error rather than
  validating locally; the spec defines those errors, so it is legal. Rejected: a local error is clearer
  and cheaper than a round-trip, and a static binding gets it for free.
- **Item 4 — surface message-level extras in the definitions layer** rather than leaving them to the
  transport. Rejected: the envelope is the transport's; this layer governs per-type
  extensibility only.
- **Item 6 — lenient inbound.** Best-effort an off-spec response rather than raising. Rejected: silently
  misrepresenting protocol state is worse than a clear error; strictness relaxes reactively (item 9)
  when a real payload demands it.
- **Item 8 — keep extras broad**, preserving unknown fields on all extensible types. This is the right
  choice for a public surface, which can't narrow later without dropping a field a user relies on.
  Rejected here only because the layer is internal: it can scope tight and widen later at no cost. *This
  is the one decision the internal premise actually turns on.*
- **Item 9 — start lenient and tighten later** rather than starting strict. Rejected on merit: it is
  cheaper to loosen a strict contract than to tighten a lenient one. Being internal only lowers the cost
  of the strict path (a rejection on browser drift is a dev-side fix, not a user-facing break); it is not
  the reason to be strict — a careful public implementation can be strict too.
- **Item 10 — free naming** rather than mirroring the spec. Rejected: mirroring the spec command and
  params aids cross-referencing and keeps bindings comparable.
- **Item 11 — raw dicts** rather than typed objects; the spec permits it. Rejected: raw maps structurally
  cannot do strict dispatch, field checks, or read-only objects.
- **Item 12 — mutable received objects** rather than read-only. Rejected: a received object is
  informational, so read-only prevents mistaking it for a control surface.

## Consequences

- The contract holds for any implementation regardless of language or production method; conformance is
  checkable independently of how the layer was built.
- The per-type signals items 5/6/8 need are all derivable from the spec; a binding that discards one, or
  parses into a lenient runtime, falls out of conformance on exactly the items that signal feeds.
