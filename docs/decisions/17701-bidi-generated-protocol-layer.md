# 17701. BiDi's low-level definitions are generated from a shared spec model and imported, not injected

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17701

## Context

The WebDriver BiDi specification is defined in CDDL (Concise Data Definition Language).
A binding's BiDi support spans four layers, from the wire up:

- **Transport / session substrate** — the connection, sending each command and correlating its
  response by the envelope id, and delivering inbound event frames upward. Domain-blind.
- **Low-level definitions** — the types, command shapes, and event shapes the spec defines,
  including the id types (a subscription, an intercept) and the commands that produce and consume
  them.
- **Orchestration** — the code that composes the definitions into capabilities and manages their
  lifecycle: storing a subscription to unsubscribe later, mapping an intercept id to a handler,
  matching an event to its registered callback, and wrapping events into the objects a handler
  receives.
- **High-level API** — the protocol-neutral, idiomatic capabilities users program against.

Bindings differ today in how they produce the definitions and how cleanly they separate them from
the orchestration above:

| Binding    | Current behavior |
|------------|------------------|
| Java       | Hand-written (~143 module classes); definitions and orchestration on the same class; separate protocol-neutral high-level (`RemoteNetwork`). |
| Python     | Generated from CDDL; orchestration injected into the generated classes via an enhancements manifest. |
| Ruby       | Hand-written low-level; orchestration fused with the high-level API. |
| .NET       | Hand-written module classes. |
| JavaScript | Generated from CDDL; orchestration injected into the generated classes via an enhancements manifest. |

They also differ on source of truth — the CDDL spec or the existing implementation — and on whether
they share one model or each interpret CDDL independently.

This record decides the low-level definitions layer — what it is, where it comes from, and how the
layers around it relate to it. This ADR assumes #17670 is accepted and that BiDi is an internal
implementation.

## Decision

**1. The spec is the oracle, through one shared model.** The definitions are generated from a
single shared, binding-neutral projection of the spec — not reconstructed from the existing
implementation, and not parsed independently per binding. Because the spec, not the existing code,
defines the shape, the generated definitions need not match the existing implementation — in API
shape or byte-for-byte. The shared model is the one place the spec is interpreted and normalized, so
bindings stay consistent with each other; each still emits its own language-idiomatic code from it.

**2. The generated definitions are read-only data, not the actionable surface.** Where a generated
object reaches a user — for example, the request object inside a network handler — it is immutable,
informational data; users act through the orchestration wrapper, not on the generated object.

**3. Orchestration stays out of the low-level definitions.** The definitions carry the spec — types,
commands, and events — and nothing that coordinates them: subscription lifecycle, event dispatch,
mapping ids to handlers, and the objects handed to a handler live in a separate layer that imports
the definitions, not spliced into the generated classes (e.g. through an enhancements manifest). A
thin, stateless convenience over a single command is a lesser matter; what must not land here is
coordination. The definitions stay a projection of the spec, so regenerating them never disturbs the
layer that imports them, and they depend only on the transport's send-and-deliver interface.

## Considered options

- **Keep hand-maintaining the definitions** — each binding writes and updates the protocol types,
  commands, and events by hand, with no generation.
  - The same protocol is hand-maintained separately in every binding, so they drift apart — the
    inconsistency this record exists to prevent.
  - Every spec change is a manual edit repeated in each binding, with no shared source of truth.

- **Put the orchestration in the generated low-level class (e.g. via an enhancements manifest)** —
  splice the coordination — subscription lifecycle, dispatch, handler wrapping — into the generated
  classes alongside the spec types, as Python and JavaScript do today.
  - Couples two layers that change for different reasons: a spec update and a coordination change
    touch the same artifact, and regenerating risks the coordination.
  - Coordination is harder to find, review, and type-check when it lives inside generated output.
  - Thin conveniences are not the concern — the objection is coordination in the low-level layer.

- **Derive the definitions from the existing implementation** — generate to
  reproduce the current shape.
  - Treats the existing implementation as the source of truth instead of the spec, carrying its
    inconsistencies forward.
  - Nothing supported depends on the generated definitions, so they need not match it.

- **Generate each binding independently from CDDL** — every binding interprets the spec on its own
  (or hand-writes), with no shared model.
  - Each binding normalizes types, names, and gap handling separately, so the bindings drift apart
    over time — the cross-binding inconsistency this record exists to prevent.
  - A shared, binding-neutral model avoids the drift while still letting each binding emit
    language-idiomatic code from it: the source model is shared, the generated definitions are
    per-language.

## Consequences

- The supported API depends only on the wrapper, not on the generated definitions'
  shape, so regenerating from a changed spec does not change what users program against.
- The generated definitions can live in their own namespace that the higher layers migrate onto,
  and the existing implementation is retired.
- Orchestration and the high-level API are checked-in source, navigable and reviewable, and
  regenerating the definitions never touches them.
- A binding that today combines the layers in one class (with injected orchestration and
  enhancements) splits them: the generated definitions move to their own namespace, which the
  orchestration and high-level API import.
