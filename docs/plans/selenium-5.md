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

### Network async/event API — [17685](../decisions/17685-network-handler-behavior.md)

The cross-binding API for adding, removing, and clearing handlers for requests, responses, and
authentication.

### Classic behavior when BiDi is enabled — _ADR pending_

Enabling BiDi must not change the behavior of any existing API. This record sets that rule and what
follows from it: BiDi adds capability without changing defaults, error types, or timing of the
classic surface; where BiDi cannot express a classic semantic, the binding emulates it locally
rather than degrading it. Routing classic commands over BiDi stays out of scope — this is about
the session that has both.

### Browsing context representation — _ADR pending_

What identifies a browsing context in every API added in this release: the window handle strings
used today, or context objects, and whether `switchTo` gains an object-oriented alternative and a
deprecation path. Required because the navigation, upload, and download records each need a type to
name when scoping a handler, and [17685](../decisions/17685-network-handler-behavior.md) already
made window handle and user context the scoping currency. The record may resolve as "handles stay
as they are"; what it may not do is leave the question open for each later record to answer
differently.

### Navigation async/event API — _ADR pending_

The cross-binding API for navigation lifecycle handlers — navigation started, committed, aborted,
and failed; DOM content loaded and load; fragment navigated; history updated — and the behavior
that goes with them: what `get` waits for, how that relates to the page load timeout, that a
navigation id may be absent, that same-document navigation never completes a load, and that a
navigation which becomes a download ends the wait.

### Prompt handling — _ADR pending_

BiDi applies the prompt handler when the prompt opens, offers only accept, dismiss, and ignore, and
has no equivalent of the classic notify variants or of the classic default. This record settles the
capability shape (a single value or a per-type map, and that it can be set per user context), the
local behavior that keeps the existing alert API and the unexpected-alert error working, and file
dialog handling, which the protocol treats as one more prompt type.

### File uploads — _ADR pending_

An element-scoped upload method, the deprecation path for passing file paths to `sendKeys` and for
the file detector, and how uploads reach a remote browser.

### Downloads — _ADR pending_

Configuring download behavior, handlers for a download beginning and ending, and how both relate to
the existing downloadable-files API that Grid serves today.

### Script and logging async/event API — _ADR pending_

The cross-binding API for pinned scripts (pin / unpin / execute) and for console-message,
JavaScript-error, and DOM-mutation handlers. The record should also say whether realm lifecycle is
exposed at all, so it is settled rather than left unclaimed.

### Selenium Manager released API — _ADR pending_

Formalize the interface and behaviors required to drop the Beta label and release independently of
the bindings.

## Sequencing

The records are independent decisions, but two orderings matter and proposing against them wastes
review time:

- **Browsing context representation comes before navigation, uploads, and downloads.** Each of
  those names a context type in its scoping arguments; settling it once avoids three records
  answering it differently.
- **Classic behavior when BiDi is enabled comes before prompt handling.** Prompt handling is the
  sharpest instance of that rule, and the general rule should not be inferred from the hardest
  case.

Records that add a new family of event handlers follow the handler lifecycle and scoping already
settled in [17685](../decisions/17685-network-handler-behavior.md) — add, remove, clear, and
scoping by window handle or user context — or state why that family differs.

## Out of scope

These are deferred, not rejected: none blocks Selenium 5.

### Full classic-over-BiDi migration

Routing every classic command through BiDi. Backwards-compatible behavior for a session with BiDi
enabled is required and is covered above; it does not depend on this.

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

A high-level API for managing browsing contexts, beyond the representation settled above —
creating and closing them as objects, exposing the context tree, and handlers for contexts being
created and destroyed.

### Capability mapping

High-level APIs over individual BiDi capability modules — permissions, storage, and emulation. The
prompt capability is in scope above, because it is a backwards-compatibility question rather than a
new module.

### Events from extension modules

Handlers for events defined outside the core BiDi specification — web bluetooth and speculative
prefetch.
