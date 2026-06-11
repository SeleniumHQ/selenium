# 0001. BiDi is an implementation mechanism, not a public API

- Status: Proposed
- Date: 2026-06-11
- Discussion: _PR pending_, https://github.com/SeleniumHQ/selenium/issues/17628

## Context

Bindings use WebDriver BiDi to implement and extend the Selenium API. This record
settles BiDi's relationship to the public API: what users program against, and where
protocol code lives. CDP was managed differently across the bindings, but all of them
resulted in users needing to understand CDP implementation details to work with it 
to one extent or another. This is happening in BiDi the same way.

## Decision

BiDi is an implementation mechanism, not a public API. New capabilities are exposed as
high-level, protocol-neutral APIs, idiomatic per language, subject to our standard
deprecation policy. Everything in a BiDi namespace is internal: still reachable for 
anything not yet wrapped, but not documented and subject to change without warning.

A binding conforms when:

1. The supported API never references BiDi — no types, methods, properties, or entry points. 
2. BiDi implementation code (including everything generated from CDDL) is visibly internal — marked per language convention as not intended for public consumption.

## Considered options

1. Expose the whole protocol as a public API (Rejected)
   * not user-friendly syntax
2. A supported-but-separate public protocol namespace (Rejected)
   * multiple implementations are confusing
3. Internal implementation mechanism only (Accepted)

## Consequences

- Users never need to know which protocol services a command.
- Each new capability requires API design work across bindings before it ships.
- Existing public surfaces that fail the conformance tests are brought in line per the deprecation policy, tracked below.

## Binding status

| Binding    | Status  | Notes / tracking link |
|------------|---------|-----------------------|
| Java       | pending |                       |
| Python     | pending |                       |
| Ruby       | pending |                       |
| .NET       | pending |                       |
| JavaScript | pending |                       |
