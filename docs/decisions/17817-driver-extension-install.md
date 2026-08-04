# 17817. The driver installs extensions directly

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17817

## Context

Firefox can install an extension mid-session through a WebDriver-classic endpoint, but every binding
hangs it off a browser-specific type rather than the driver.

Chromium takes extensions through capabilities applied at session creation. Branded Chrome stopped
honoring that path in Chrome 137 (Chrome for Testing and unbranded Chromium still do), so installing
after the session starts is now a requirement.

Chromium can connect to BiDi over either an inherited pipe or a debugging port. Selenium's CDP API
only works through the debugging port, but for security reasons Chromium does not allow installing an
extension over BiDi through the debugging port, only through the inherited pipe. That leaves two
options:

1. Require the user to pass arguments in capabilities to switch to the pipe before extensions can be
   installed.
2. Switch Selenium's default connection to the inherited pipe, which removes support for the CDP API
   (Decision 5).

Over the pipe it is still possible to send CDP commands through the vendored `goog/cdp/execute`
endpoint, but no asynchronous behavior (events) is supported.

WebDriver BiDi specifies extension install and uninstall, which both Firefox and Chromium
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

1. **Methods available on the driver.** Every binding exposes `installExtension` and
   `uninstallExtension` on the driver instance itself — not on a browser-specific type or the BiDi
   module.

2. **Install behavior.** `installExtension` accepts a packed archive, an unpacked directory, or
   base64 bytes, supports browser-specific install options (on Firefox, `permanent` and
   `allowPrivateBrowsing`), and returns an `Extension`.

3. **Uninstall behavior.** `uninstallExtension` takes the `Extension` that install returned — only
   that object, not a raw id, so the call is type-checked; its id is readable as `.id`. A convenience
   `extension.uninstall()` is deferred as a non-breaking future upgrade, pending the network handler
   ADR ([#17685](https://github.com/SeleniumHQ/selenium/pull/17685)).

4. **The classic Firefox install methods are not deprecated yet.** `installExtension` requires BiDi,
   which is not the default transport, so the classic methods remain the supported path for non-BiDi
   sessions and keep working even when BiDi is enabled. They are superseded by `installExtension` and
   become deprecation, then removal, candidates once BiDi is the default and the replacement is
   available without opting in. In Java, whose classic method is already named `installExtension(Path)`,
   the cross-browser method coexists as an overload — a typed source plus a Firefox options object,
   distinct from the classic `Path`/`Boolean` signature — so nothing is renamed or broken. Chromium
   has nothing here; it never had a session-time install method.

5. **`installExtension` requires BiDi, and enabling BiDi disables the CDP API.** Once BiDi is
   enabled, no further flags or configuration are needed, signed or unsigned. Enabling BiDi turns
   Selenium's CDP API off (the vendored CDP endpoint stays available); on Firefox, which has no CDP,
   this costs nothing.

## Considered options

These are the alternatives considered and not taken; the accepted choice is the decision above.

**Where the method lives**
- **The BiDi module** — internal per [ADR 17670](17670-bidi-implementation-boundaries.md): protocol-shaped, reached differently in each binding, and absent in JavaScript.
- **A dedicated `extensions` namespace** — consistent with `network` / `script`, with room to grow, but two verbs don't earn the indirection; revisit if extension operations grow.

**Handle type**
- **A raw id string** — untyped; the signature would accept any string.

**Base64 encoding**
- **Emit the BiDi `path` / `archivePath` variant** — the browser resolves the path, which breaks when a Grid sits between client and browser.
- **Accept only file and directory** — drops the classic base64 entry point, so `installExtension` would no longer be a strict superset for Java and .NET.

**The classic Firefox methods**
- **Deprecate them now** — the replacement requires BiDi, which is not the default transport, so a
  warning would push non-BiDi users toward a method they cannot use without opting in first.
- **Remove them outright** — breaks existing users and violates the deprecation policy.

**Unsigned extensions**
- **Require an explicit opt-in** — the browser restriction guards a profile someone actually browses with, not an automation-launched session, so it adds a step without buying protection.

## Consequences

- **Extensions can be added and removed mid-session**, on Firefox and Chromium.
- **`installExtension` requires BiDi on every browser** — without it the call errors telling the user
  to enable it. Firefox users not ready for BiDi keep using the classic method until then.
- **CDP users switch to the BiDi equivalent, the raw CDP endpoint, or leave BiDi off** — enabling
  BiDi disables Selenium's CDP API.
- **Local input is transmitted base64-encoded**, so install works through a Grid.
