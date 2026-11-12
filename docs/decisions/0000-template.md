<!-- AI agents drafting or revising this record: follow docs/decisions/AGENTS.md. Remove this
     and every other comment before opening the PR. -->

# NNNN. Name of the behavior or surface this record governs

<!-- NNNN is this proposal's PR number. A record usually settles several decisions, so the title
     names what they cover rather than stating one of them. Good: "The network async/event API",
     "BiDi implementation boundaries"; bad: "Network stuff", "Decisions about BiDi" -->

- Status: Proposed <!-- Proposed | Accepted | Rejected | Superseded by [NNNN](NNNN-title.md) -->
- Discussion: <!-- link to this record's PR, the only issue or PR link in the record -->

## Context

What problem are we solving, and what forces are in tension? W3C spec language, user
expectations, existing behavior that differs between bindings, implementation constraints.

<!-- Summarize prior discussion rather than linking it: issues, PRs, and open proposals are linked
     from the PR's Related section, not from the record. Do not make the proposal conditional on
     external factors: list the prerequisites in the PR's Related section and write this record as
     if they are met. Add a table of current behavior per binding only when the bindings differ
     and that difference is the reason for the decision; keep each cell to a short phrase.
     Otherwise a sentence is enough. Tables that help reviewers weigh the proposal (cost, who
     already conforms) go in the PR body. -->

## Decisions

The decisions, numbered so the options below and reviewers can refer to them, stated in
language-neutral terms. This is the normative part: what every binding MUST do, and what is left
to each language.

<!-- Give each choice a reviewer could accept or reject on its own a number of its own; choices
     that stand or fall together share one. For an API, name the methods users will call and fix
     their output, their default behavior, and any other behavior every binding must support.
     Casing and how a user configures that behavior are left to each language. Leave optional
     behavior out: a binding may offer it as long as the default behavior and output hold, and
     behavior every binding must support is added by a later record. Record what and why, not
     how: implementation lives in the adopting PRs. Use code sketches only to describe the API
     shape being decided, and show each in at least one statically typed binding (Java, .NET) and
     one dynamic binding (Python, Ruby, JavaScript). -->

## Considered options

- **Option A** — what it is; why it was rejected or accepted
- **Option B** — what it is; why it was rejected or accepted

<!-- Every numbered decision has its alternatives listed here, with why each was rejected.
     If no reviewer could reasonably prefer an alternative, it is not a decision: what follows
     from the other decisions goes in Consequences, and definitions or existing spec behavior
     go in Context. Work deferred to a later record is not an option; it goes in the PR's
     Proposal notes. Excluding something users would expect is a decision, numbered above with
     its alternatives. A decision that an accepted record already settles cites that record
     instead. These are mutually exclusive answers to the same question, not a menu of separable
     features — a record may bundle related sub-choices; independent adoptability alone is
     not grounds to split it (see the README's scoping guidance). Revise this section during
     review as alternatives are contested or added — the merged record, not the PR thread, is
     the authoritative account of why each rejected option was not chosen. -->

## Consequences

What gets easier, what gets harder, what users will notice. Deprecations triggered by the
decisions and their timelines. Work the decisions imply for bindings, described by outcome
rather than as tasks.

<!-- Per-binding convergence is NOT tracked here. When this record is accepted, open an ADR
     tracking issue (the "ADR Implementation Tracking" issue template) with one checkbox per
     binding, and link it from this record's PR. Keeping it out of the committed record avoids
     churn on an otherwise immutable file. -->
