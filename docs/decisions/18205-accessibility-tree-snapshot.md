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
accessibility locator, and Get Computed Role / Get Computed Label in classic WebDriver, which
every binding already exposes on its element type (`getAriaRole` / `getAccessibleName` and
equivalents). Chromium exposes its full native tree over CDP (`Accessibility.getFullAXTree`),
which Puppeteer uses. Playwright's `ariaSnapshot()` and `@wdio/snapshot` both compute the tree
with script injected into the page; `@wdio/snapshot` uses `dom-accessibility-api`, the role and
name library Testing Library also uses. Playwright's YAML output has become a de facto format in
agent tooling.

## Decision

Selenium will provide an accessibility snapshot as a Selenium module built only on standard
BiDi, ahead of any spec work.

### 1. Public API

Every binding exposes two methods, both returning an `AccessibilityNode`: one on the driver,
which snapshots the whole page, and one on the element type, which snapshots that element's
subtree. Casing, and whether the call is synchronous or asynchronous, follow each binding's
idiom; the `AccessibilitySnapshot` stem and the `AccessibilityNode` type name are fixed.

| Binding    | Whole page                              | Subtree                                  |
|------------|-----------------------------------------|------------------------------------------|
| Java       | `driver.getAccessibilitySnapshot()`     | `element.getAccessibilitySnapshot()`     |
| Python     | `driver.accessibility_snapshot()`       | `element.accessibility_snapshot()`       |
| Ruby       | `driver.accessibility_snapshot`         | `element.accessibility_snapshot`         |
| .NET       | `driver.GetAccessibilitySnapshot()`     | `element.GetAccessibilitySnapshot()`     |
| JavaScript | `await driver.getAccessibilitySnapshot()` | `await element.getAccessibilitySnapshot()` |

Adding them must not break existing implementers of the driver and element types: Java uses
`default` interface methods that throw `UnsupportedOperationException`, as `getAriaRole` does,
and .NET uses extension methods rather than new interface members.

The contract:

- The whole-page snapshot is rooted at the top-level browsing context of the current window,
  whatever frame the driver has switched to. To scope to a frame, take a subtree snapshot of its
  `iframe` element.
- The whole-page root node has role `document`, is named from the document's title, and
  references the document element. A subtree snapshot's root always produces a node, even when
  the pruning rule below would drop it; if the root is hidden, by itself or by an ancestor, that
  node has no children.
- Both methods descend into every child frame, including cross-origin ones, and attach each
  frame's tree as the children of its `iframe` node. A frame whose document cannot be reached
  (for example, mid-navigation) gives an `iframe` node with no children; the snapshot as a whole
  does not fail.
- A snapshot is a copy taken at one point in time. It does not update when the page changes.
- A stale element root raises the binding's existing stale element error.
- WebDriver Classic sessions are out of scope. Calling either method on a session without BiDi
  raises the binding's existing unsupported-operation error, with a message saying BiDi is
  required. This follows [17817](17817-driver-extension-install.md): raise rather than silently
  doing less.
- `AccessibilityNode` has one more method, which renders the tree as text (`toText()` /
  `to_text` / `ToText()`, per idiom). The format is one line per node,
  `- role "name" [state] [state=value]: value`, with children indented two spaces and text leaves
  written as `- text: content`. An empty name is left out, as is the value when absent or empty.
  States are written in the order of the table below; a `true` state is written bare, a `false`
  one is left out, and any other value is spelled. The description and element references are
  not rendered. That is the line grammar of Playwright's aria snapshot, restricted to the fields
  below and with no refs. The text is derived from the tree and carries no information the tree
  lacks.

### 2. Data model

The in-page script returns, and every binding exposes, the following shape. Bindings map
field names to their own casing and map `element` to their element type.

```text
AccessibilityNode {
  role:        string                  // WAI-ARIA role token; "text" for text leaves, "iframe" for frames
  name:        string                  // computed accessible name; "" when there is none
  description: string                  // computed accessible description; "" when there is none
  value?:      string                  // current value, for textbox, combobox, searchbox and range roles
  states:      map<string, bool | int | "mixed">   // {} when there are none
  element?:    element reference       // absent when the node is not backed by an element
  children:    AccessibilityNode[]     // [] for leaves
}
```

The `states` keys, and when each is present:

| Key        | Type              | Present                                   |
|------------|-------------------|-------------------------------------------|
| `checked`  | `bool \| "mixed"` | whenever the role supports it             |
| `pressed`  | `bool \| "mixed"` | when a button sets `aria-pressed`         |
| `expanded` | `bool`            | when the element sets it, or natively (`summary`) |
| `selected` | `bool`            | always for `option`, `tab` and `treeitem`; for grid cells, rows and headers only when set |
| `level`    | `int`             | always for headings; for other roles when the element sets it |
| `disabled` | `true`            | only when disabled                        |
| `focused`  | `true`            | only on the focused node                  |

`pressed` and grid `selected` follow ARIA's default for an absent attribute: a button without
`aria-pressed` is not a toggle button, and most grids are not selectable, so reporting `false`
would mislead. `iframe` is not a WAI-ARIA role; it marks the node under which a binding attaches
the frame's tree. Elements html-aam gives no corresponding role are reported as `generic`.

An element produces a node when it is not hidden (in the accname sense) and has a role other than
`generic`, `none` or `presentation`, or has a non-empty name. Elements that produce no node have
their children attached to the nearest ancestor that does. The precise pruning is pinned by the
shared test corpus below, not by this record.

Compatibility rule: adding an optional field or a new `states` key is not a breaking change, and
consumers must ignore keys they do not recognise. Removing or renaming a field, or changing its
type or meaning, is breaking and needs a new decision record and the deprecation policy. Changes
to computed names, roles or pruning that bring output closer to a browser's native tree are
accuracy fixes, not schema changes, and can ship in any release.

### 3. Element references

Every node backed by an element carries that element as a BiDi `SharedReference`, produced by
ordinary `script.callFunction` result serialization with `maxDomDepth: 0`. Bindings surface it
as their normal element type, so a snapshot node can be clicked, typed into, or used as the root
of a further snapshot without a second lookup. Shared ids are scoped to the document, not the
realm, so references created in the sandbox are valid everywhere else. Text leaves and nodes
with no element of their own (CSS-generated content, and any node the walk synthesizes) carry no
reference. Bindings' element types represent elements only, so text leaves do not reference
their `Text` node. The tree follows accessibility parentage, so with `aria-owns` a node's tree
parent and its DOM parent can differ; the reference still identifies the element.

### 4. Implementation and cross-binding adoption

- A single JavaScript implementation computes the tree in the page. Selenium writes and owns all
  of it, including role, accessible name and hidden-state computation, with no third-party
  runtime dependency. It ships as an atom in `@selenium/atoms` (exported as
  `@selenium/atoms/accessibility-snapshot`), in both the injectable-string and callable-function
  forms the package already provides. Every binding embeds the same build artifact; no binding
  reimplements tree logic.
- In the browser it is installed with `script.addPreloadScript` into a sandbox realm, and
  injected on demand via `script.callFunction` for documents that loaded before the preload was
  added. The sandbox keeps page scripts from interfering with the implementation.
- The only per-binding code is the public methods above, frame stitching (running the script in
  each child context and attaching the result under its `iframe` node), mapping references to
  element types, and the text renderer.
- A shared corpus of test pages in `common/src/web/accessibility/` has an expected JSON tree and
  expected text for each page, and a JSON Schema for the data model above is kept beside the
  atom. Every binding runs the whole corpus in each browser it tests. That corpus, not any one
  binding's tests, is the cross-binding contract. Engine-specific expectations are allowed where
  the corpus records a known divergence, and the expected text is produced by one reference
  renderer that each binding's text renderer is held to.

### 5. Positioning and the spec

- Output is labelled as *computed*, not as the browser's accessibility tree. Known divergences
  from each engine's native tree are documented in the corpus README and kept current.
- Selenium takes no dependency on WebdriverIO's implementation, and does not ask WebdriverIO
  to depend on Selenium's. `@wdio/snapshot` is used as a point of comparison: we run both
  against the same test pages and record where Selenium's output is more or less accurate
  against each engine's native tree.
- The implementation, usage data and divergence list are contributed to
  w3c/webdriver-bidi#443 as input to a BiDi accessibility module with a native tree command,
  rather than opening a separate proposal. We expect to ask the Chrome DevTools team to
  co-sponsor, given CDP's existing tree. Neither their interest nor any timeline has been
  confirmed. When a native command ships, the bindings switch to it per browser and keep the
  same `AccessibilityNode` shape, so the script becomes a fallback rather than being deleted.

## Considered options

**Delivery**
- **Propose the spec first and wait.** This is the correct end state, and #443 already exists to
  carry it. But it has been open since 2023 without consensus on the tree, and waiting leaves
  Selenium without the capability for an open-ended period. Rejected as the *first* step; it
  remains the second.
- **Use CDP directly, Chromium only.** Gives high fidelity in one engine and nothing elsewhere.
  It also adds new CDP surface that Selenium is trying to move users off, and produces output
  tied to Chromium's internal tree rather than anything that could be standardised. Rejected.

**Session types**
- **Also support WebDriver Classic via Execute Script.** The atom could run through Execute
  Script, and classic element references would work. But classic has no sandbox realm, so page
  scripts can break the walk; cross-origin frames can only be reached by switching frames, which
  changes the session's current browsing context as a side effect; and two code paths would have
  to produce identical output. Rejected for now; it can be revisited in a later record if users
  on classic-only remote ends ask for it.

**Data model**
- **Adopt Playwright's YAML as the primary interface.** Agents already consume it, but it is
  a lossy text rendering whose format is controlled by another project. It cannot carry element
  references for follow-up actions, and it is the wrong thing to propose for a protocol.
  Rejected as the data model. Kept as the text rendering.
- **Leave the schema to the implementing PR.** This was the first draft of this record. Because
  the output shape is a compatibility commitment across five bindings, leaving it open would let
  the first binding to ship define it by accident. Rejected.
- **Reference text nodes as well as elements.** BiDi can serialize a `Text` node as a shared
  reference, but no binding's element type represents one and nothing useful can be done with it
  through the existing APIs. Rejected.

**API placement**
- **A dedicated `accessibility` namespace.** Leaves room to grow, but two methods do not justify
  it, and the existing accessibility methods (`getAriaRole`, `getAccessibleName`) already live
  on the element. Rejected.
- **A single driver method taking an optional root element.** Equivalent in power to the two
  methods, but puts element scoping on the driver when the existing accessibility methods put it
  on the element. Rejected.

**Implementation source**
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

## Consequences

- **Availability over fidelity.** Users get a snapshot in every BiDi-capable browser soon,
  but the snapshot comes from script rather than from the browser's tree. Where they differ,
  the browser's tree is what assistive technology users actually encounter.
- **Known inaccuracy at the edges.** Name computation will not match each engine exactly.
  `display: contents`, CSS-generated content, closed shadow roots and engine-specific pruning
  are the expected problem areas. Script cannot see into a closed shadow root, so the host's
  light-DOM children are walked as if rendered, and `aria-owns` on an element inside a shadow
  tree is not applied. One divergence is already known: Chromium keeps leading
  whitespace in accessible names (`" Logout"` for an icon followed by text), which
  script-computed names trim, so a computed name passed to the `locateNodes` accessibility
  locator can match nothing (webdriverio/webdriverio#16131). The *computed* label and the
  divergence document are how we stop users treating the output as an accessibility audit.
- **Format drift.** Playwright controls the format agents have been trained on. The text
  rendering follows their line grammar and role/state vocabulary, so if Playwright changes its
  format we will have to follow it or explain the difference. Selenium's and WebdriverIO's trees
  may also differ, and users moving between the two will see it.
- **Element references.** Acting on a snapshot node needs no re-query by role and name, which
  sidesteps the name-divergence problem above and is something Playwright's text format can
  only approximate with page-global ref strings. References share the lifetime of the
  document: after navigation they raise the binding's stale element error, and callers take a
  new snapshot. Each reference adds serialization overhead per node, so the first implementation
  should measure large trees; an option to omit references would be an additive change. As a
  first data point, a 5,000-node tree is about 366 KB as plain JSON before BiDi serialization
  adds references.
- **Classic users get nothing.** Users on remote ends without BiDi get a clear error rather than
  a snapshot. Given the direction of the project this is acceptable, but it is a visible gap.
- **Maintenance.** We own an accname and role implementation, the tree walk, the shared test
  corpus, and five bindings' frame stitching and text renderers until a native command exists.
  accname and html-aam keep changing, and keeping up with them is the largest ongoing cost in
  this design. In return we can fix divergences directly, without waiting on an upstream library,
  and the comparison with `@wdio/snapshot` shows whether that control is producing a more
  accurate tree. The package's existing atoms are small primitives behind WebDriver commands;
  this one is larger and implements no spec command, so the computed-not-authoritative label
  applies to the package as well.
- **What the module has to produce for #443.** The schema above, a list of divergences
  from each engine's native tree with test cases, and evidence of which node types, states and
  scoping options people actually use, including how often element references are used for
  follow-up commands. If they are, a native command should return a `SharedReference` for each
  element-backed node; CDP's tree already carries a DOM node id per node, which suggests this is
  feasible at least in Chromium. The 2024 discussion stalled on the lack of an agreed tree
  shape, so a concrete schema, plus a comparison of two independent script implementations
  against native trees, is the most useful thing we can bring.
  Without that evidence the module is just an alternative to the spec, not input to it.
