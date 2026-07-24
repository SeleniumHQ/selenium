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

**Any implementation of this layer must exhibit the behaviors below.** Some are settled by the spec; the
rest are choices this record standardizes so bindings don't diverge — the next section marks which is
which.

An implementation must exhibit them at runtime, not merely declare them in its types or schema. A
statically-typed deserializer will fill a correctly-typed object from malformed input — most often a null
in a non-nullable field — and return it as valid unless a check is written, so a layer can type-check
perfectly and still violate the contract. Conformance is shown by the rejection firing on malformed
input, not by a happy-path round trip or matching types.

### How to read this contract

Each item is tagged with the *kind* of requirement it is:

| Tier | Meaning |
|---|---|
| **Compliance** | The spec determines the answer; there is nothing for this record to decide. |
| **Decision** | A genuine choice this record owns, not compelled by the spec. |

The behaviors are uniform across every binding — a malformed payload is malformed in any language. Only
their *form* varies:

- **Mechanism** — a static type system or runtime checks.
- **Object** — a dataclass, a record, a value type.
- **Exception** — malformed input must *raise* rather than return a bad value; the error's type and
  hierarchy are idiomatic.

### Outbound (constructing and sending)

1. **Spec strings go on the wire verbatim.** *(Compliance.)* The exact spec string appears on the wire
   for method names, enum values, and fixed/const values; no casing or naming transform alters it. The
   spec's `beforeunload` goes on the wire unchanged; a binding that camelCases it to `beforeUnload` fails.

2. **Optionality and nullability are represented exactly as the spec declares.** *(Compliance.)*
   - **Omitted is distinct from explicit null.** An unset optional is *absent* from the payload; an
     explicit null serializes as `null`. The remote end acts on the difference.
   - **Per-field nullability is honored** as declared.
   - **A nullable constant is a settable value.** Where a field's value is a constant *and* nullable
     (`browsingContext.setBypassCSP`, `emulation.setScriptingEnabled`), the layer must send the literal
     *or* `null`, never only the literal. (A non-nullable constant is always the literal, so it can be a
     fixed value.)

3. **Outbound is validated locally, before sending.** *(Decision.)* A caller mistake is caught here as a
   local error, rather than sent for the remote end to reject on a round-trip. Three things are checked
   before the message leaves: enum and const-value membership, required-field presence, and no unknown
   properties on a closed type. An undefined enum value raises locally; so does a value that is neither
   the literal nor `null` for a nullable constant (a `true`/`null` field rejects `false`; see item 2). A
   static binding gets these from its type system; a dynamic one checks them explicitly. This layer
   carries only spec-modeled commands — a higher layer needing one the spec does not model builds its own
   path rather than routing untyped data through a typed one.

### Extensibility (cross-cutting)

4. **Extensibility follows the spec's per-type signal.** *(Decision.)* Whether a type admits extra
   properties is read from its own CDDL definition, per type and never a hand-maintained list, so vendor
   extension works exactly where the spec permits it. Outbound, an `Extensible` type carries
   caller-supplied extras onto the wire (vendor fields such as `goog:*` capabilities or vendor proxy
   keys), while a closed type rejects them (item 3); injecting extras into a closed type is the single
   prohibition here. Inbound, the signal governs only whether extras are *preserved* (item 8), not
   whether they are tolerated — tolerance is uniform across every type (item 6). The message envelope is
   itself `Extensible` (`Command = { id, CommandData, Extensible }`), but the transport forms it above
   this layer, so those message-level extras are out of scope.

### Inbound (receiving and parsing)

5. **Variants and vocabulary are resolved by the spec's declared rule.** *(Compliance.)* A union resolves
   to a variant by its declared rule — a discriminator value, the presence of required keys, or a
   declared default — never a re-derived structural guess, so a valid payload always resolves to the same
   variant, and resolving it wrong is a parsing bug. An *unrecognized* token or variant is out of scope
   here — raising on it is the strict default (item 7). For a union whose arms are all objects, a
   non-object payload selects no variant and raises.

6. **Inbound payloads are validated against the resolved type.** *(Decision.)* Once item 5 has resolved
   the type, every key in the payload falls into one of three cases, and a declared field is checked
   rather than populated silently:
   - **Corruption — always raises.** A null in a non-nullable field, a value of the wrong primitive
     type, a list/scalar cardinality mismatch, a non-object where a field expects an object. The wire
     asserted something untrue, and absorbing it is what misrepresents protocol state.
   - **Absence — raises.** A required field is missing. Nothing untrue was asserted and every field that
     did arrive is still correct, so absence is the one case a relaxation may reach (item 7).
   - **Undeclared key — never raises.** Every type tolerates a property it does not define, open or
     closed; most parsers do this by default, and a reject-unmapped setting would violate it. The spec
     does not compel this — §4 Transport gives no normative requirements for local ends, and
     `Extensible` is declared per type — so universal tolerance is this record's forward-compatibility
     choice. Whether such a key is also *preserved* is item 8.

7. **Inbound is strict by default.** *(Decision.)* Unrecognized enum tokens and union variants (item 5)
   and failed field checks (item 6) raise; a strict contract is cheaper to loosen than a lenient one is
   to tighten. A specific field may be relaxed where a real remote end sends it off-spec, and any such
   relaxation is bounded:
   - **Only absence is relaxable** (item 6): never corruption, and never a field item 5 dispatches on.
   - **It removes a check; it never exposes a type, variant, or enum value the spec does not define.**
     Inventing one to absorb a malformed payload models a browser's bug as protocol, and it outlives
     the bug.
   - **The tolerated absence is still reported**, never silently absorbed. A binding *may* additionally
     let a caller admit an uncatalogued absence at runtime, so a user is not blocked until the next
     release; that is a per-binding convenience, not required here, and it too reports.

   An error the remote reports always raises as that error, whatever else is relaxed. A malformed part
   of an `ErrorResponse` degrades what the raised error carries but never replaces it with a parse
   failure — the command did fail, and an error response has no protocol state to misrepresent beyond the
   failure itself.

8. **Preserving extras is scoped to types that are both extensible and re-sendable.** *(Decision.)*
   Tolerating an undeclared key (item 6) is the floor; *preserving* it — **storing** it readable after
   parse and **echoing** it back on serialization — is worth doing only where a received instance can go
   back out onto the wire, so it happens only when both spec-derivable facts hold:
   - **Extensible** — its CDDL definition includes the `Extensible` group (`Extensible = (*text => any)`),
     admitting arbitrary extra properties.
   - **Re-sendable** — it can appear within a command's parameters, so a received instance can be handed
     back.

   Which types meet both is determined by each type's spec definition, not a hand-maintained list —
   cookies, capabilities, and proxy configuration among them. A cookie read from `storage.getCookies`
   with a vendor attribute, then passed to `storage.setCookie`, must reach the wire with that attribute
   intact. Any other type — an
   inbound-only extensible type such as a log entry, or a closed type — tolerates an undeclared key
   without erroring (item 6) but does not preserve it. Where a type both stores inbound extras and takes
   caller-set outbound extras, the two merge on serialization and a caller-set value wins. Widening this
   scope, should the layer ever go public, is the alternative weighed in Considered options.

### Surface

9. **Names mirror the spec, mapped to language idiom.** *(Decision.)* The surface method mirrors the spec
   command, and params/fields carry idiomatic names of their wire keys, so the layer reads as a direct
   projection of the spec and cross-references cleanly across bindings. For example, a Python
   `set_viewport(device_pixel_ratio=…)` call serializes the wire key `devicePixelRatio` under
   `browsingContext.setViewport`. This is a naming convention rather than a spec requirement (keeping the
   *wire* names exact is item 1); language sugar belongs in the higher public layer, not here.

10. **Structured data is typed, not raw maps.** *(Decision.)* Params and results are typed value objects:
    enums are the language's closed-vocabulary type, and discriminated-union variants are distinct types
    branched on by type, not by inspecting a tag value. A `script.evaluate` result, for example, comes
    back as a `StringValue` or `NumberValue`, not a raw `{type, value}` map. This typing is the foundation
    the inbound items stand on: a raw-map surface structurally cannot do union dispatch (5), field checks
    (6), or read-only objects (11).

11. **Objects this layer hands to callers are read-only.** *(Decision.)* A received object that reaches a
    caller (e.g. the request inside a network handler) is immutable at the top level, because mutating it
    changes nothing on the wire and the layer would rather forbid the mutation than let it mislead. The
    caller reads the object and acts through the higher layer. Shallow immutability is enough; nested
    containers need not be deep-frozen.

## Considered options

The Compliance items (1, 2, 5) have no valid alternative; a divergence there is a bug.

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
  misrepresenting protocol state is worse than a clear error; strictness loosens on evidence (item 7)
  when a real payload demands it.
- **Item 6 — do not enforce required-ness inbound at all**, treating every field as possibly absent.
  Rejected: it erases the signal, and a divergence never recorded is never reported upstream or retired.
  webdriverbidi-net retired six such relaxations in nineteen months precisely because strictness
  surfaced them; a binding enforcing nothing accumulates the same divergences with no record of any.
- **Item 7 — start lenient and tighten later** rather than starting strict. Rejected on merit: it is
  cheaper to loosen a strict contract than to tighten a lenient one. Being internal only lowers the cost
  of the strict path (a rejection on browser drift is a dev-side fix, not a user-facing break); it is not
  the reason to be strict — a careful public implementation can be strict too.
- **Item 7 — mandate a runtime escape hatch** for uncatalogued absences, as a required behavior of every
  binding. Not adopted: no implementation ships that exact shape (net's `TransportErrorBehavior` discards
  the whole message rather than admitting the absent field), and a global strictness toggle is a
  configuration concern this record otherwise scopes out. Left as a per-binding option instead —
  permitted because it spares a user the release-cadence wait, not required because the catalogued
  relaxation path already covers the divergences that recur.
- **Item 8 — keep extras broad**, preserving unknown fields on all extensible types. This is the right
  choice for a public surface, which can't narrow later without dropping a field a user relies on.
  Rejected here only because the layer is internal: it can scope tight and widen later at no cost. *This
  is the one decision the internal premise actually turns on.*
- **Item 9 — free naming** rather than mirroring the spec. Rejected: mirroring the spec command and
  params aids cross-referencing and keeps bindings comparable.
- **Item 10 — raw dicts** rather than typed objects; the spec permits it. Rejected: raw maps structurally
  cannot do strict dispatch, field checks, or read-only objects.
- **Item 11 — mutable received objects** rather than read-only. Rejected: a received object is
  informational, so read-only prevents mistaking it for a control surface.

## Consequences

- The contract holds for any implementation regardless of language or production method; conformance is
  checkable independently of how the layer was built.
- The per-type signals items 5/6/8 need are all derivable from the spec; a binding that discards one, or
  parses into a lenient runtime, falls out of conformance on exactly the items that depend on it.
