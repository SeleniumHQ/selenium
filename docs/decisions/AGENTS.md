<!-- Guidance for AI agents drafting or reviewing design decision records -->

Read `docs/decisions/README.md` first: its Rules say what a record must be. This file covers
what agents tend to get wrong on top of that.

## Writing a record
- The template's prompts are not a checklist. Leave a section or prompt empty when there is
  nothing to put in it
- State each point once. Consequences does not repeat the Decisions, and the PR body does not
  repeat the record
- Use bullets where they make parallel items easier to read
- Don't give general explanations of the spec or the protocol. Include only the existing
  behavior and project policy needed to understand the decision
- Don't list parameters or toggles a method might take. Its name, output, default behavior, and
  any other behavior every binding must support are the decision
- Finish with a pass that cuts anything a reviewer would neither contest nor need

## Revising a record
- A review question is answered in the thread. Change the record only when the answer changes
  or clarifies a decision
- Make the smallest change that addresses the feedback, and where possible replace text rather
  than appending to it
- Don't edit the record to match an implementation. Changes come from review and TLC discussion
- Don't narrate revisions ("revised after review") in the record or the PR body; the commit
  history and the thread already hold that

## Opening the PR
- Remove the template's comments from the record
- Use `.github/PULL_REQUEST_TEMPLATE/adr.md` as the PR body, not the default PR template
