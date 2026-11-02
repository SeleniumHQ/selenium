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

The atoms operate on the DOM of the document they are evaluated in, so they must
run in the page rather than in the driver process — for example via
`Runtime.evaluate` over CDP, `script.callFunction` over WebDriver BiDi, or
Selenium's own `executeScript`.

## Versioning

This package is released from the Selenium monorepo and shares its version with
the `selenium-webdriver` npm package.

## License

Apache-2.0. See `LICENSE` and `NOTICE`.
