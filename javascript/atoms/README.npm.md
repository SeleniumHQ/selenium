# @selenium/atoms

Browser injection atoms for Selenium WebDriver, published as TypeScript-typed
ES modules.

Atoms are small, self-contained functions that run inside the page under
automation. They encode the browser-compatibility behaviour that the W3C
WebDriver specification leaves to implementations — what "displayed" means, how
`getAttribute` reconciles attributes with IDL properties, and how a locator
resolves to elements. Selenium's own language bindings inject the same logic,
compiled to an IIFE; this package exposes it to other JavaScript tooling that
needs to match Selenium's behaviour exactly.

## Installation

```sh
npm install @selenium/atoms
```

This is an ES-module-only package and requires Node.js 18 or newer.

## Usage

```js
import { getAttribute, findElements, isDisplayed } from '@selenium/atoms'
```

Each atom is also available as its own subpath export, so a bundler can tree
shake down to just the one you need:

```js
import getAttribute from '@selenium/atoms/get-attribute'
import findElements from '@selenium/atoms/find-elements'
import isDisplayed from '@selenium/atoms/is-displayed'
```

### API

```ts
getAttribute(element: Element, attribute: string): string | null
findElements(target: Record<string, unknown>, root?: Document | Element | ShadowRoot): Element[]
isDisplayed(element: Element, ignoreOpacity?: boolean): boolean
```

`findElements` takes a locator object keyed by strategy, matching the WebDriver
wire format:

```js
findElements({ css: '.result' })
findElements({ 'link text': 'Continue' }, shadowRoot)
```

### Accessibility snapshot

```ts
accessibilitySnapshot(root?: Element | Document): AccessibilityNode

interface AccessibilityNode {
  role: string                       // WAI-ARIA role; "text" for text leaves
  name: string                       // accessible name, "" when none
  description: string                // accessible description, "" when none
  value?: string                     // textbox, searchbox, combobox and range roles
  states: Record<string, boolean | number | 'mixed'>
  element?: Element                  // absent on text leaves
  children: AccessibilityNode[]
}
```

```js
import accessibilitySnapshot from '@selenium/atoms/accessibility-snapshot'

const tree = accessibilitySnapshot()                 // the whole document
const dialog = accessibilitySnapshot(dialogElement)  // one subtree
```

The snapshot is *computed* by script from the DOM, following WAI-ARIA 1.2,
html-aam and accname 1.2. It is not the browser's own accessibility tree, and
it can differ from it at the edges. Elements that are hidden in the accname
sense are left out; generic wrappers are pruned and their children hoisted;
text an ancestor's name was computed from is not repeated as leaves. Frames are
reported as `iframe` leaves with no children, whatever role attribute they
carry, since a child document is another browsing context the page cannot
reach; callers that can reach it stitch its snapshot in. Keys in `states` are
`checked`, `pressed`, `expanded`, `selected`, `level`, `disabled` and
`focused`; new keys may be added in any release, so ignore keys you do not
recognise. A password field's `value` is masked, one bullet per character, as
the browser's own tree exposes it.

`accessibilitySnapshotWire(root?: Element)` returns the same snapshot in the
shape the Selenium bindings fetch over WebDriver BiDi: `{ json, elements,
windows }`, the tree as JSON text with each `element` replaced by an index into
`elements` and each frame node given a `frame` index into `windows` (the
frame's content window), so a binding parses one string and maps two arrays
instead of decoding a nested remote value. It answers `null` for a root this
document does not own (one owned by another document, or a `null` root, which
is how Firefox hands over a shared id of another document's node) and
`{ error: 'detached' }` for a root no longer in its document. Page scripts have
no reason to use it over `accessibilitySnapshot`.

The atoms operate on the DOM of the document they are evaluated in, so they must
run in the page rather than in the driver process — for example via
`Runtime.evaluate` over CDP, `script.callFunction` over WebDriver BiDi, or
Selenium's own `executeScript`.

## Versioning

This package is released from the Selenium monorepo and shares its version with
the `selenium-webdriver` npm package.

## License

Apache-2.0. See `LICENSE` and `NOTICE`.
