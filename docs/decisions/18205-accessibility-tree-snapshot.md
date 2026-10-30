# 18205. Accessibility tree snapshots ship as a script-based Selenium module before a BiDi command exists

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18205

## Context

Agents and LLM-driven tools increasingly read pages through an accessibility snapshot: a tree of
roles, names and states that is compact and maps to how a user would describe an action.
Playwright (`locator.ariaSnapshot()`), Puppeteer (`page.accessibility.snapshot()`) and
WebdriverIO (`@wdio/snapshot`) offer one. Selenium does not, so users write their own (see
#15969).

WebDriver BiDi has no accessibility tree command. The request has been open as
[w3c/webdriver-bidi#443](https://github.com/w3c/webdriver-bidi/issues/443) since 2023 and has
stalled on the lack of an agreed tree: accname and core-AAM define names and role mappings, but
Chromium, Gecko and WebKit build the tree itself differently, and a command would have to settle
node inclusion, hidden semantics, shadow DOM flattening, cross-origin iframes and CSS-generated
content. [w3c/webdriver-bidi#1164](https://github.com/w3c/webdriver-bidi/issues/1164) brings
agentic use cases into the WG's scope, but nothing yet defines a tree.

There is precedent for exposing accname-derived data without a tree: the `accessibility` locator
in `browsingContext.locateNodes`, and Get Computed Role / Get Computed Label in classic
WebDriver. Chromium exposes its native tree over CDP (`Accessibility.getFullAXTree`), which
Puppeteer uses; Playwright and `@wdio/snapshot` compute the tree with injected script.
Playwright's YAML output has become a de facto format in agent tooling.

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
as their normal element type, so a snapshot node can be used without a second lookup. Shared ids
are scoped to the document, not the realm, so references created in the sandbox are valid in any
realm of that document.

Where a reference can be used depends on the command. BiDi commands that take a
`SharedReference` accept it from any frame, and so does a subtree snapshot. Classic element
commands (click, send keys, and the rest) resolve references against the driver's current
frame, so they work only while the driver is switched into the node's document; otherwise they
raise "no such element". That applies to a node inside a child frame when the driver is at the
top level, and to a top-level node when the driver is switched into a frame. Bindings do not
switch frames implicitly, because that changes the session's current browsing context as a side
effect. The `iframe` nodes on the path to a node carry the elements needed to switch there. Text leaves and nodes
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
- **Propose the spec first and wait.** The right end state, but #443 has had no consensus on the
  tree since 2023. Rejected as the first step; it remains the second.
- **Use CDP directly, Chromium only.** High fidelity in one engine, nothing elsewhere, more CDP
  surface, and output tied to Chromium's internal tree. Rejected.

**Session types**
- **Also support WebDriver Classic via Execute Script.** Classic has no sandbox realm, reaching
  cross-origin frames means switching the current frame, and two code paths would have to match.
  Rejected for now; a later record can revisit it if classic-only users ask.

**Data model**
- **Adopt Playwright's YAML as the primary interface.** A lossy rendering whose format another
  project controls, with no element references. Kept as the text rendering only.
- **Leave the schema to the implementing PR.** The first binding to ship would define a
  five-binding compatibility commitment by accident. Rejected.
- **Reference text nodes as well as elements.** No binding's element type can represent a `Text`
  node. Rejected.

**API placement**
- **A dedicated `accessibility` namespace, or one driver method with an optional root.** The
  existing accessibility methods (`getAriaRole`, `getAccessibleName`) live on the element, and two
  methods do not justify a namespace. Rejected.

**Implementation source**
- **Reuse `@wdio/snapshot`, or ask WebdriverIO to depend on `@selenium/atoms`.** Its output is a
  text tree with refs in page globals, built around WebdriverIO's session model, and either way
  one project would ship the other's release cadence. Rejected.
- **Build on `dom-accessibility-api`.** A pre-1.0, single-maintainer dependency inside every
  release, and output identical to WebdriverIO's by construction, leaving nothing independent to
  compare. Rejected; we accept the cost of our own implementation.

**Text rendering**
- **Render the text in the atom.** One renderer instead of five. But the atom runs once per
  document and never sees the stitched tree, so the binding would have to send the whole tree back
  into the page (about 366 KB for 5,000 nodes) for an extra round trip, and a saved or
  deserialized `AccessibilityNode` could not render without a live session. The grammar is small
  and fixed, and every binding's output is checked against the corpus's expected text, so drift
  fails a test. Rejected.

## Consequences

- **Availability over fidelity.** Users get a snapshot in every BiDi-capable browser soon, but
  computed by script; where it differs from the browser's tree, the browser's tree is what
  assistive technology users encounter.
- **Known inaccuracy at the edges.** Name computation, `display: contents`, CSS-generated
  content, closed shadow roots and engine-specific pruning will diverge. One case is already
  known: Chromium keeps leading whitespace in names (`" Logout"`) that script trims, so a computed
  name passed to the `locateNodes` accessibility locator can match nothing
  (webdriverio/webdriverio#16131). The *computed* label and the divergence list exist to stop
  users treating the output as an accessibility audit.
- **Format drift.** The text rendering follows Playwright's grammar, so if Playwright changes it
  we follow or document the difference. Selenium's and WebdriverIO's trees may also differ.
- **Element references.** Acting on a node needs no re-query by role and name, which sidesteps
  the name divergence above. References die with their document (stale element error), and add
  per-node serialization cost that the first implementation should measure; an option to omit
  them would be additive.
- **Frame references and Classic commands.** Until element actions are dispatched over BiDi, a
  node outside the driver's current frame needs a frame switch before Classic commands work on it.
  Routing click and send keys through `input.performActions` would remove that, but it changes how
  element actions are dispatched generally, so it needs its own record. This is the known gap and
  the likely follow-up.
- **Classic users get nothing.** Remote ends without BiDi get a clear error. Acceptable given the
  project's direction, but a visible gap.
- **Maintenance.** We own an accname and role implementation, the tree walk, the corpus, and five
  bindings' stitching and renderers until a native command exists. Keeping up with accname and
  html-aam is the largest ongoing cost; in return we fix divergences directly, and the comparison
  with `@wdio/snapshot` shows whether that control pays off.
- **What the module has to produce for #443.** The schema, a divergence list against each engine's
  native tree with test cases, and evidence of which node types, states and scoping options are
  used, including how often element references drive follow-up commands. If they do, a native
  command should return a `SharedReference` per element-backed node; CDP's tree already carries
  DOM node ids, which suggests this is feasible in Chromium. Without that evidence the module is an
  alternative to the spec, not input to it.
