# 18205. Accessibility tree snapshots are computed by a Selenium-owned script until a native command exists

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/18205

## Context

Agents and LLM-driven tools increasingly read pages through an accessibility snapshot: a tree of
roles, names and states that is compact and maps to how a user would describe an action.
Playwright (`locator.ariaSnapshot()`), Puppeteer (`page.accessibility.snapshot()`) and
WebdriverIO (`@wdio/snapshot`) offer one. Selenium does not, so users write their own (see
#15969).

Neither WebDriver Classic nor BiDi has an accessibility tree command. The BiDi request,
[w3c/webdriver-bidi#443](https://github.com/w3c/webdriver-bidi/issues/443), has been open since
2023 and has stalled on the lack of an agreed tree: accname and core-AAM define names and role
mappings, but Chromium, Gecko and WebKit build the tree itself differently, and a command would
have to settle node inclusion, hidden semantics, shadow DOM flattening, cross-origin iframes and
CSS-generated content.

There is precedent for exposing accname-derived data without a tree: the `accessibility` locator
in `browsingContext.locateNodes`, and Get Computed Role / Get Computed Label in Classic.
Chromium exposes its native tree over CDP (`Accessibility.getFullAXTree`), which Puppeteer uses;
Playwright and `@wdio/snapshot` compute the tree with injected script. Playwright's text output
has become a de facto format in agent tooling.

## Decision

Selenium computes the snapshot with its own JavaScript, run through standard script execution,
in both WebDriver Classic and BiDi sessions. The output is the same whichever protocol the
session uses.

### 1. Public API

The snapshot methods live on their own interface, as screenshots do with `TakesScreenshot`,
implemented by both the driver and the element. On the driver the method snapshots the current
browsing context; on an element it snapshots that element's subtree. Both return an
`AccessibilityNode`. Bindings without typed role interfaces put the methods on the driver and
element directly, as they do for screenshots. Casing, and whether the call is synchronous or
asynchronous, follow each binding's idiom.

| Binding    | Interface                      | Method                                         |
|------------|--------------------------------|------------------------------------------------|
| Java       | `TakesAccessibilitySnapshot`   | `getAccessibilitySnapshot()`                   |
| .NET       | `ITakesAccessibilitySnapshot`  | `await GetAccessibilitySnapshotAsync()`        |
| Python     | (none)                         | `accessibility_snapshot()`                     |
| Ruby       | (none)                         | `accessibility_snapshot`                       |
| JavaScript | (none)                         | `await getAccessibilitySnapshot()`             |

The contract:

- The driver's snapshot is rooted at the driver's current browsing context: the top-level
  document, or the frame the driver has switched into. Its root node has role `document`, is named
  from that document's title, and references its document element.
- An element's snapshot always produces a root node, even when the pruning rule below would drop
  it; if the element is hidden, by itself or by an ancestor, that node has no children.
- Both descend into every child frame, including cross-origin ones, and attach each frame's tree
  as the children of its `iframe` node. A frame whose document cannot be reached (for example,
  mid-navigation) gives an `iframe` node with no children; the snapshot as a whole does not fail.
  Taking a snapshot leaves the driver's current browsing context unchanged.
- A snapshot is a copy taken at one point in time. It does not update when the page changes.
- A stale element raises the binding's existing stale element error.
- `AccessibilityNode` has one more method, which renders the tree as text (`toText()` /
  `to_text` / `ToText()`, per idiom). The format is one line per node,
  `- role "name" [state] [state=value]: value`, with children indented two spaces and text leaves
  written as `- text: content`. An empty name is left out, as is the value when absent or empty.
  A name is quoted with `\` and `"` backslash-escaped; a value escapes `\`, CR and LF as `\\`,
  `\r` and `\n`, so a node never spans two lines. States are written in the order of the table
  below; a `true` state is written bare, a `false` one is left out, and any other value is
  spelled. The description, the link `url` and element references are not rendered. That is the
  line grammar of Playwright's aria snapshot, restricted to these fields and with no refs. The
  text is derived from the tree and carries no information the tree lacks.

### 2. Data model

Every binding exposes the following shape, mapping field names to its own casing and `element`
to its element type.

```text
AccessibilityNode {
  role:        string                  // WAI-ARIA role token; "text" for text leaves, "iframe" for frames
  name:        string                  // computed accessible name; "" when there is none
  description: string                  // computed accessible description; "" when there is none
  value?:      string                  // current value, for textbox, combobox, searchbox and range roles
  url?:        string                  // resolved link target, for role link with an href
  states:      map<string, bool | int | "mixed">   // {} when there are none
  element?:    element reference       // absent when the node is not backed by an element
  children:    AccessibilityNode[]     // [] for leaves
}
```

| State      | Type              | Present                                   |
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
would mislead. `iframe` is not a WAI-ARIA role; it marks the node under which a frame's tree is
attached. Elements html-aam gives no corresponding role are reported as `generic`.

An element produces a node when it is not hidden (in the accname sense) and has a role other than
`generic`, `none` or `presentation`, or has a non-empty name. Elements that produce no node have
their children attached to the nearest ancestor that does. The precise pruning is pinned by a
shared test corpus, not by this record.

Compatibility rule: adding an optional field or a new `states` key is not a breaking change, and
consumers must ignore keys they do not recognise. Removing or renaming a field, or changing its
type or meaning, is breaking and needs a new decision record and the deprecation policy. Changes
to computed names, roles or pruning that bring output closer to a browser's native tree are
accuracy fixes, not schema changes, and can ship in any release.

### 3. Element references

Every node backed by an element carries it as the binding's normal element type, so a snapshot
node can be acted on without a second lookup. Element commands resolve references against the
driver's current browsing context, so a node inside a child frame works only after the driver
switches into that frame; bindings do not switch implicitly, because that changes session state as
a side effect. The `iframe` nodes on the path carry the elements needed to switch. Text leaves and
nodes with no element of their own (CSS-generated content) carry no reference. The tree follows
accessibility parentage, so with `aria-owns` a node's tree parent and DOM parent can differ; the
reference still identifies the element.

### 4. Implementation

One JavaScript implementation computes the tree, including role, accessible name and hidden-state
computation. Selenium writes and owns it, with no third-party runtime dependency, and no binding
reimplements tree logic. A shared test corpus, with expected tree and text per page, is the
cross-binding contract, and records known divergences from each engine's native tree. Output is
documented as *computed*, not as the browser's accessibility tree.

## Considered options

- **Propose the spec first and wait.** The right end state, but #443 has had no consensus on the
  tree since 2023. Rejected as the first step.
- **Use CDP directly, Chromium only.** High fidelity in one engine, nothing elsewhere, and output
  tied to Chromium's internal tree. Rejected.
- **BiDi only.** Simpler isolation (a sandbox realm), but leaves Classic sessions with nothing for
  a feature that needs only script execution. Rejected.
- **Adopt Playwright's text format as the primary interface.** A lossy rendering whose format
  another project controls, with no element references. Kept as the text rendering only.
- **Methods on the driver and element interfaces.** Adding them breaks or burdens implementers,
  and in .NET most users hold `IWebDriver` / `IWebElement` and would cast anyway. A role interface
  follows `TakesScreenshot`. Rejected.
- **Render the text in the page script.** The script runs once per document and never sees the
  stitched tree, and a deserialized `AccessibilityNode` could not render without a session.
  Rejected.
- **Reuse `@wdio/snapshot` or build on `dom-accessibility-api`.** Either ties every Selenium
  release to another project's code and cadence. Rejected; we accept the cost of our own
  implementation.

## Consequences

- **Availability over fidelity.** Users get a snapshot in every browser now, computed by script;
  where it differs from the browser's tree, the browser's tree is what assistive technology users
  encounter.
- **Known inaccuracy at the edges.** Name computation, `display: contents`, CSS-generated
  content, closed shadow roots and engine-specific pruning will diverge. Chromium keeps leading
  whitespace in names that script trims, so a computed name passed to the `locateNodes`
  accessibility locator can match nothing. The *computed* label and divergence list exist to stop
  users treating the output as an accessibility audit.
- **Classic is less isolated.** Without a sandbox realm, page scripts that override built-ins can
  affect the result under Classic, and reaching child frames means switching into them and back.
- **Format drift.** The text follows Playwright's grammar; if Playwright changes it, we follow or
  document the difference.
- **Frame references.** Acting on a node in a child frame needs a frame switch first.
- **Maintenance.** We own an accname and role implementation, the tree walk and the corpus until a
  native command exists. Keeping up with accname and html-aam is the largest ongoing cost.
- **A native command later.** If BiDi gains a tree command, bindings can use it per browser behind
  the same `AccessibilityNode` shape, keeping the script as the fallback.
