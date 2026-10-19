# 18205. Accessibility tree snapshots ship as a script-based Selenium module before a BiDi command exists

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18205

## Context

Agents and LLM-driven tools increasingly read pages through an accessibility snapshot rather
than the DOM or a screenshot: a tree of roles, names and states is compact, semantically
dense, and maps to how a user would describe an action. Playwright (`locator.ariaSnapshot()`)
and Puppeteer (`page.accessibility.snapshot()`) both offer this, and WebdriverIO now ships
`@wdio/snapshot`. Selenium does not. Users who need one write their own; the third-party
`angiejones/mcp-selenium` server, for example, added its own accessibility snapshot in
February 2026 (see also the discussion in #15969).

WebDriver BiDi has no accessibility tree command. The request has been open as
[w3c/webdriver-bidi#443](https://github.com/w3c/webdriver-bidi/issues/443) since 2023, and
part of it (querying by role and name) was resolved by the `accessibility` locator in
`browsingContext.locateNodes`. When the WG discussed the remainder in September 2024
([minutes](https://www.w3.org/2024/09/27-webdriver-minutes.html)), orkon said it could not be
implemented without agreement on what the tree looks like. jgraham said he did not expect trees
to be comparable between browsers in the near future. accname and core-AAM define how an
element's name and role are computed and mapped to platform APIs, but the tree itself is a
platform construct, and Chromium, Gecko and WebKit build it differently. A tree command would
have to settle node inclusion and pruning, what "hidden" means, shadow DOM flattening,
cross-origin iframes, and CSS-generated content.

Some work is in progress. As part of the Interop 2025 accessibility investigation, geckodriver
and safaridriver have prototypes that expose per-node internal accessibility properties.
Tentative testdriver methods for them were accepted in WPT RFC 226 (February 2026). Separately,
[w3c/webdriver-bidi#1164](https://github.com/w3c/webdriver-bidi/issues/1164) brings agentic use
cases into the WG's scope. The accessibility tree is cited there as an example feature, the
revised charter is expected to take effect in October 2026, and the topic is in the TPAC 2026
agenda topic bank. None of this yet defines a tree.

There is precedent for exposing accname-derived data without a tree: the `locateNodes`
accessibility locator, and Get Computed Role / Get Computed Label in classic WebDriver.
Chromium exposes its full native tree over CDP (`Accessibility.getFullAXTree`), which Puppeteer
uses. Playwright's `ariaSnapshot()` and `@wdio/snapshot` both compute the tree with script
injected into the page; `@wdio/snapshot` uses `dom-accessibility-api`, the role and name library
Testing Library also uses. Playwright's YAML output has become a de facto format in agent
tooling.

## Decision

Selenium will provide an accessibility snapshot as a Selenium module built only on standard
BiDi, ahead of any spec work:

1. A single JavaScript implementation computes the tree in the page. Selenium writes and owns
   all of it, including role, accessible name and hidden-state computation, with no third-party
   runtime dependency. It ships as an atom in
   `@selenium/atoms` (exported as `@selenium/atoms/accessibility-snapshot`), in both the
   injectable-string and callable-function forms the package already provides, and every binding
   embeds the same build artifact. In the browser it is installed with
   `script.addPreloadScript` into a sandbox realm, and injected on demand via
   `script.callFunction` for documents that loaded before the preload was added. Using a sandbox
   keeps page scripts from interfering with the implementation.
2. The command takes a browsing context, or a node within one, as its root and returns a
   structured JSON tree. Each node carries `role`, `name`, `description`, `states`, and
   `children`. The exact schema is settled in the implementing PR.
3. Every node backed by a DOM node carries that node as a BiDi `SharedReference`, produced by
   ordinary `script.callFunction` result serialization with `maxDomDepth: 0`. Bindings surface
   it as their normal element type, so a snapshot node can be clicked, typed into, or used as
   the root of a further snapshot without a second lookup. Shared ids are scoped to the
   document, not the realm, so references created in the sandbox are valid everywhere else.
   Nodes with no DOM node of their own (CSS-generated content, and any node the walk
   synthesizes) carry no reference; text leaves reference their `Text` node. The tree follows
   accessibility parentage, so with `aria-owns` a node's tree parent and its DOM parent can
   differ; the reference still identifies the DOM node.
4. The client stitches iframes together: it runs the script in each child context's realm and
   attaches the result under the owning `iframe` node. This includes cross-origin frames, which
   in-page script cannot reach.
5. Any text serialization, including a Playwright-style YAML rendering, happens on the client
   and is not part of the data model.
6. Output is labelled as *computed*, not as the browser's accessibility tree. Known divergences
   from each engine's native tree are documented and kept current.
7. Selenium takes no dependency on WebdriverIO's implementation, and does not ask WebdriverIO
   to depend on Selenium's. `@wdio/snapshot` is used as a point of comparison: we run both
   against the same test pages and record where Selenium's output is more or less accurate
   against each engine's native tree. Where it is cheap, we offer to align node shapes so that
   either project's serializers can read both trees, but no release is blocked on that.
8. The implementation, usage data and divergence list are contributed to
   w3c/webdriver-bidi#443 as input to a BiDi accessibility module with a native tree command,
   rather than opening a separate proposal. We expect to ask the Chrome DevTools team to
   co-sponsor, given CDP's existing tree. Neither their interest nor any timeline has been
   confirmed.

## Consequences

- **Availability over fidelity.** Users get a snapshot in every BiDi-capable browser soon,
  but the snapshot comes from script rather than from the browser's tree. Where they differ,
  the browser's tree is what assistive technology users actually encounter.
- **Known inaccuracy at the edges.** Name computation will not match each engine exactly.
  `display: contents`, CSS-generated content, closed shadow roots and engine-specific pruning
  are the expected problem areas. One divergence is already known: Chromium keeps leading
  whitespace in accessible names (`" Logout"` for an icon followed by text), which
  script-computed names trim, so a computed name passed to the `locateNodes` accessibility
  locator can match nothing (webdriverio/webdriverio#16131). The *computed* label and the
  divergence document are how we stop users treating the output as an accessibility audit.
- **Format drift.** Playwright controls the format agents have been trained on. We will reuse
  their node shape and role/state vocabulary where it costs little, so a client-side
  serializer can match their text output. If Playwright changes its format we will have to
  follow it or explain the difference. Without a shared schema, Selenium's and WebdriverIO's
  trees may also differ, and users moving between the two will see it.
- **Node references.** Acting on a snapshot node needs no re-query by role and name, which
  sidesteps the name-divergence problem above and is something Playwright's text format can
  only approximate with page-global ref strings. References share the lifetime of the
  document: after navigation they fail with `no such node`, and callers take a new snapshot.
  Each reference adds serialization overhead per node, so the implementing PR should measure
  large trees and, if needed, add an option to omit references.
- **Maintenance.** We own an accname and role implementation, the tree walk, and their test
  corpus until a native command exists. accname and html-aam keep changing, and keeping up with
  them is the largest ongoing cost in this design. In return we can fix divergences directly,
  without waiting on an upstream library, and the comparison with `@wdio/snapshot` shows whether
  that control is producing a more accurate tree. Because `@selenium/atoms` is
  versioned with Selenium releases, any change to the output shape counts as a breaking change
  for downstream users. The package's existing atoms are small primitives behind WebDriver
  commands; this one is larger and implements no spec command, so the computed-not-authoritative
  label applies to the package as well. When a native command ships, the module should switch to
  it per browser and keep the same return shape, so the script becomes a fallback rather than
  being deleted.
- **What the module has to produce for #443.** A concrete node schema, a list of divergences
  from each engine's native tree with test cases, and evidence of which node types, states and
  scoping options people actually use, including how often node references are used for
  follow-up commands. If they are, a native command should return a `SharedReference` for each
  DOM-backed node; CDP's tree already carries a DOM node id per node, which suggests this is
  feasible at least in Chromium. The 2024 discussion stalled on the lack of an agreed tree
  shape, so a concrete schema, plus a comparison of two independent script implementations
  against native trees, is the most useful thing we can bring.
  Without that evidence the module is just an alternative to the spec, not input to it.
- **Bindings.** Every binding exposes the command, with the shared script used in each. Each
  binding needs its own client-side iframe stitching.

## Alternatives considered

- **Propose the spec first and wait.** This is the correct end state, and #443 already exists to
  carry it. But it has been open since 2023 without consensus on the tree, and waiting leaves
  Selenium without the capability for an open-ended period. Rejected as the *first* step; it
  remains the second.
- **Use CDP directly, Chromium only.** Gives high fidelity in one engine and nothing elsewhere.
  It also adds new CDP surface that Selenium is trying to move users off, and produces output
  tied to Chromium's internal tree rather than anything that could be standardised. Rejected.
- **Adopt Playwright's YAML as the primary interface.** Agents already consume it, but it is
  a lossy text rendering whose format is controlled by another project. It cannot carry node
  references for follow-up actions, and it is the wrong thing to propose for a protocol.
  Rejected as the data model. Kept as an optional client-side serializer.
- **Reuse `@wdio/snapshot` directly.** It already works over BiDi and classic and handles
  scoping and iframes. But its primary output is a text tree with refs stored in page globals,
  it is built around WebdriverIO's session model and Appium page sources, and the bindings
  could not consume it without shipping a second project's release cadence inside every
  Selenium release. Rejected.
- **Ask WebdriverIO to depend on `@selenium/atoms`.** This would give byte-identical output, but
  WebdriverIO has just shipped its own collector and has no reason to replace it. Rejected.
- **Build on `dom-accessibility-api`.** This is an independent, MIT-licensed accname
  implementation used by Testing Library and `@wdio/snapshot`, and it would remove most of the
  accname work. But it is pre-1.0 with a single maintainer, so fixing divergences would depend
  on one person's priorities and releases, and it would ship inside every Selenium release. It
  would also make Selenium's output match WebdriverIO's by construction, leaving no independent
  implementation to compare against. Rejected; we accept the maintenance cost of our own
  implementation instead.
