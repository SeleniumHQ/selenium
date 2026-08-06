# 17817. The driver installs web extensions directly

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17817

## Context

Firefox can install a web extension mid-session through a WebDriver-classic endpoint, but every binding
hangs it off a browser-specific type rather than the driver.

Chromium takes web extensions through capabilities applied at session creation. Branded Chrome stopped
honoring that path in Chrome 137 (Chrome for Testing and unbranded Chromium still do), so installing
after the session starts is now a requirement.

WebDriver BiDi specifies web extension install and uninstall, which both Firefox and Chromium
implement. Most bindings already expose the BiDi module for it, and pointing users at that module
is what we advertise today.

| Binding    | Firefox-only method (classic) | Currently advertised BiDi approach |
|------------|-------------------------------|------------------------------------|
| Java       | `installExtension` (on `FirefoxDriver`) | `new WebExtension(driver).install(...)` |
| Python     | `install_addon` | `driver.webextension.install(...)` |
| Ruby       | `install_addon` (`HasAddons`) | `BiDi::Protocol::WebExtension` (protocol module) |
| .NET       | `InstallAddOn`, `InstallAddOnFromFile`, `InstallAddOnFromDirectory` | `(await driver.AsBiDiAsync()).WebExtension.InstallAsync(...)` |
| JavaScript | `installAddon` | none |

## Decision

1. **Add two methods to the driver instance.** Every binding exposes `installWebExtension` and
   `uninstallWebExtension` on the driver instance itself, not on a browser-specific type or the BiDi
   module.
   * **Install behavior:** accepts an archive, a directory, or base64, as well as vendor-specific options
      (on Firefox, `permanent` and `allowPrivateBrowsing`). The implementation must work with the Grid.
      The method returns a `WebExtension` object which wraps the id.
   * **Uninstall behavior:** accepts the `WebExtension` object rather than a raw id.

2. **Backwards compatible**. These methods must also support WebDriver-Classic functionality for Firefox
   when BiDi is not enabled. Any existing methods or parameters for installing web extensions in Firefox
   will be deprecated in favor of the new methods.

## Considered options

These are the alternatives considered and not taken; the accepted choice is the decision above.

**Where the method lives**
- **Re-implement the existing methods instead of adding a new one** — the direction the project is
  generally moving is to give existing methods new behavior rather than grow the API surface. It
  cannot deliver this capability on its own: the existing methods are Firefox-only and inconsistently
  named, and Chromium has none to re-implement, so there is no uniform method to carry it. A new,
  uniformly-named method is what makes it cross-browser.
- **A dedicated `webExtensions` namespace** — consistent with `network` / `script`, with room to grow,
  but two methods make that seem excessive, especially when the precedent from Firefox is to have the
  method on the driver directly

**Naming**
- **`installExtension` returning `Extension`** — shorter and reuses the name Java already ships, but
  "extension" is overloaded, and reusing Java's classic name collides by return type with its
  `installExtension(Path)`, forcing a distinct-parameter workaround. `installWebExtension` models the
  standard "web extension" noun and keeps the deprecation uniform across all five bindings; the public
  `WebExtension` type sits in its own package, separate from the internal BiDi `WebExtension` module.

**Return type**
- **A raw id string** — untyped; the signature would accept any string.
- **Self acting object with `webExtension.uninstall()`** — out of scope for now

**The legacy `installAddon` methods**
- **Redirect `installAddon` to `installWebExtension` when BiDi is enabled** — keeps the legacy name
  working as an alias instead of steering users to `installWebExtension`, so the two names persist
  rather than converge, but if the point is to move to a new common name we shouldn't extend the old method
- **Keep it completely separate**. `installAddon` is always classic implementation and
  `installWebExtension` is always BiDi implementation. This isn't how we plan to manage other
  transitions, and we want to converge on a single common method.

**Unsigned web extensions**
- **Require an explicit opt-in** — the browser restriction guards a profile someone actually browses with,
  not an automation-launched session, so it adds a step without buying protection.

## Consequences

- Since the implementation must work with the Grid, bindings will have to convert path or archive to Base64
  before sending to target
- **The classic fallback cannot disable private browsing.** Firefox's classic endpoint always installs
  a web extension with private-browsing access and exposes no toggle, so `allowPrivateBrowsing: true`
  (or unspecified) is satisfied on a non-BiDi session. Because the classic `/moz/addon/install` payload
  cannot represent the option, a binding must validate `allowPrivateBrowsing: false` and throw before
  delegating to classic, rather than silently installing with private-browsing access anyway.
