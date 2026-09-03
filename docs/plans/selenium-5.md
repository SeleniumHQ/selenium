# Selenium 5 Release Charter

- Status: Proposed
- Owner: Selenium Technical Leadership Committee (TLC)
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17717

## Purpose

Selenium 5 is a focused alignment release: the bindings converge on consistent behavior across
languages. It follows the project's existing deprecation policy — provide a replacement, mark the
old path deprecated, and remove it only after two releases — and is not an occasion for
gratuitous breaking changes.

This document is the index of the decisions that define Selenium 5. Each needs an accepted ADR to
settle its cross-binding design, then implementation in every binding — Java, JavaScript, Python,
Ruby, and .NET — with behavior consistent and implementation idiomatic per language. A decision is
marked _ADR pending_ until its record is accepted, at which point this charter is updated to link
it. An ADR does not name a milestone; this charter records what belongs to Selenium 5.

## Required for release

### BiDi support boundary — [17670](../decisions/17670-bidi-implementation-boundaries.md)

How the WebDriver BiDi protocol is exposed to users across the bindings. The ADR sets where the
boundary sits between supported Selenium API and internal implementation, and how each binding
marks it.

### Network async/event API — _ADR pending_

The cross-binding API for adding, removing, and clearing handlers for requests, responses, and
authentication.

### Script and logging async/event API — _ADR pending_

The cross-binding API for pinned scripts (pin / unpin / execute) and for console-message,
JavaScript-error, and DOM-mutation handlers.

### Selenium Manager released API — _ADR pending_

Formalize the interface and behaviors required to drop the Beta label and release independently of
the bindings.

## Out of scope

These are deferred, not rejected: none blocks Selenium 5.

### Full classic-over-BiDi migration

Routing every classic command through BiDi.

### Partial BiDi implementation support

What it means to support a remote end that does not implement every BiDi feature — choosing the
BiDi or Classic path per session (not every command can switch mid-session), for older browsers or
drivers with incomplete BiDi. Part of the classic-over-BiDi migration.

### DevTools deprecation

Deprecating or removing DevTools (CDP) support.

### Convenience layers on the core APIs

Higher-level helpers built on the network and script/event primitives — for example task-oriented
network actions (`mock`, `block`, `redirect`) and one-shot event waiters (`expect_*`).

### Browser context API

A high-level API for managing browsing contexts — for example exposing them as handle objects.

### Capability mapping

High-level APIs over individual BiDi capability modules — permissions, storage, emulation, user
prompts.
