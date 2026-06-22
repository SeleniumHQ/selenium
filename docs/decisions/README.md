# Design Decisions

This directory is the log of design decisions that apply across the Selenium project —
one file per decision, numbered in the order they were proposed.

Selenium ships the same API in multiple languages. Decisions about user-visible behavior,
API shape, and cross-binding semantics need to be made once, recorded, and implemented
consistently everywhere. This log is the canonical record of those decisions: when a
question comes up in review, the answer should be a link to a file here.

## What needs a decision record

- User-visible behavior that should be consistent across bindings: API naming and shape,
  error types and messages, default timeouts, capability handling
- WebDriver Classic / BiDi semantics and how the protocol is exposed (or deliberately not exposed)
- Deprecation and backwards-compatibility commitments
- Anything the TLC has labeled [`A-needs-decision`](https://github.com/SeleniumHQ/selenium/labels/A-needs-decision)
  and resolved

## What doesn't

- Single-binding internals (a Java maintainer picking a data structure)
- Build tooling and infrastructure choices
- Anything cheaply reversible

When in doubt, ask whether the question is likely to be raised again. If it is, record the decision.

## Process

1. **Propose.** Anyone may propose: copy [0000-template.md](0000-template.md) to `NNNN-short-title.md` using the
   next unused number, fill it in, and open a PR with `Status: Proposed`. Keep it to about a
   page — if the debate already happened in an issue, the record can be short and link to it.
2. **Discuss.** The PR thread is the discussion record. Decisions that need synchronous
   discussion are raised at a TLC meeting; the outcome goes back into the PR. Disagreement
   about the considered options is resolved by revising the document during review, so the
   merged record reflects the debate accurately. The TLC sets its meeting agenda; proposals
   advance as agenda time allows.
3. **Decide.** The Selenium Project Lead merges the record once the approval requirements
   below are met and discussion has run its course, with the status updated to `Accepted` —
   merging constitutes acceptance. Proposals the TLC considers and declines are merged as
   `Rejected`; proposals withdrawn or abandoned before TLC consideration are closed and the
   number lapses.
4. **Implement.** Each binding tracks its convergence in the decision's binding-status table.
   Updating that table (and only that table) doesn't require TLC review.

## Approval

- TLC members respond to a proposal with a GitHub review: an approval, a "no objection"
  comment review (saw it, deferring to the others), or a request-changes review stating
  what would resolve it.
- Records are accepted by consensus: a majority of TLC members have responded, none with
  an unresolved objection. Before acceptance, a record must have been open at least one
  week and an agenda item at a TLC meeting — no one should learn of a decision after it
  is made.
- If substantive edits are made, the author re-requests reviews.
- An objection that revision cannot resolve — including support for a different considered
  option — is discussed at a TLC meeting. If consensus still fails, the Selenium Project
  Lead decides which position prevails; the record is updated to match, and overruled
  dissent is summarized rather than erased.

## Rules

- **A decision must stand alone.** A reader gets the decision, the rationale, and the rejected
  alternatives without following any links; linked material is background, not required reading.
- **Accepted decisions are immutable**, except for the status line and the binding-status
  table. Changing a decision means a new record that supersedes the old one — update the old
  record's status to `Superseded by [NNNN](...)`.
- **Numbers are stable once merged.** They get cited in reviews and issues. If two open PRs
  claim the same number, the later one renames before merge. Gaps in numbering are acceptable.
- **Durable supporting material goes in the record itself** (an Appendix section at the end).
  Ephemeral evidence and debate stay in the PR thread.
