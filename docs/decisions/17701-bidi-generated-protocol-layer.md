# 17701. BiDi's low-level definitions are generated from a shared spec model without orchestration

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17701

## Context

The WebDriver BiDi specification is defined in CDDL (Concise Data Definition Language).
A binding's BiDi support spans four layers, from the wire up:

- **Transport / session substrate** — the connection, sending each command and correlating its
  response by the envelope id, and delivering inbound event frames upward. Domain-blind.
- **Low-level definitions** — the types, command shapes, and event shapes the spec defines
  (including the id types — a subscription, an intercept — and the commands that produce and consume
  them), exposed by generated modules that can execute a single command.
- **Orchestration** — the stateful coordination across those commands and events: storing a
  subscription to unsubscribe later, mapping an intercept id to a handler, matching an event to its
  registered callback, and wrapping events into the objects a handler receives.
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

**2. Generated data objects are immutable; generated modules may call single commands.** The
generated protocol data objects — command parameters and results, event payloads — are immutable
and information-only. Generated domain modules may expose directly callable single-command methods
(e.g. a generated `BrowsingContext.navigate(...)` that executes one command) as internal, unsupported
implementation APIs — not the supported, user-facing surface, which is the high-level API.

**3. Stateful orchestration stays out of the generated layer.** Generated modules execute individual
commands, but own no stateful coordination: subscriptions, event dispatch, handler and intercept-id
mappings, body collectors, and lifecycle management live in the orchestration layer, which imports
the generated definitions rather than being spliced into them (e.g. through an enhancements manifest).
A thin convenience over a single command may be generated; what must not land here is coordination.
The generated definitions stay a projection of the spec, so regenerating them never disturbs the
orchestration that imports them, and they depend only on the transport's send-and-deliver interface.

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

- **Generate each binding independently from CDDL** — every binding walks the CDDL/AST and builds
  its own model with its own logic, rather than consuming one shared model.
  - The grouping of modules, commands, and events follows the spec, but the normalization, naming,
    and gap handling are re-derived per binding, so they drift apart over time.
  - A shared, binding-neutral model makes those decisions once; each binding still emits
    language-idiomatic code from it.

## Consequences

- What users program against is the high-level API, not the generated definitions, so regenerating
  from a changed spec does not change it.
- The generated definitions can live in their own namespace that the higher layers migrate onto,
  and the existing implementation is retired.
- Orchestration and the high-level API are checked-in source, navigable and reviewable, and
  regenerating the definitions never touches them.
- A binding that today combines the layers in one class (with injected orchestration and
  enhancements) splits them: the generated definitions move to their own namespace, which the
  orchestration and high-level API import.
