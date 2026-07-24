# NNNN. The driver installs extensions directly

<!-- NNNN is this proposal's PR number; rename the file to NNNN-driver-extension-install.md once GitHub assigns it. -->

- Status: Proposed
- Discussion: <!-- link to this record's PR once opened -->

## Context

Installing a browser extension is a routine automation need. Firefox can already install one
mid-session, through a WebDriver-classic endpoint — but exposed under a different name in every
binding and hanging off a browser-specific type rather than the driver.

Chromium has traditionally taken extensions through capabilities, applied when the session is
created. Branded production Chrome stopped honoring that path in Chrome 137; Chrome for Testing and
unbranded Chromium builds still honor it. Installing an extension after the session is created is
therefore now a requirement, not a convenience.

A Chromium driver reaches the browser over one of two transports: a local TCP debugging port, or a
pipe inherited from the process that launched the browser. The port is what makes CDP reachable;
the pipe is private to the driver and carries WebDriver BiDi only. Chrome accepts extension install
over BiDi only on the pipe.

WebDriver BiDi specifies extension install and uninstall, which both Firefox and Chromium
implement. Bindings already expose the BiDi module for it, and pointing users at that module is
what we advertise today.

| Binding    | Firefox-only method (classic) | Currently advertised BiDi approach |
|------------|-------------------------------|------------------------------------|
| Java       | `installExtension` (on `FirefoxDriver`) | `new WebExtension(driver).install(...)` |
| Python     | `install_addon` | `driver.webextension.install(...)` |
| Ruby       | `install_addon` (`HasAddons`) | `BiDi::Protocol::WebExtension` (protocol module) |
| .NET       | `InstallAddOn`, `InstallAddOnFromFile`, `InstallAddOnFromDirectory` | `driver.AsBiDiAsync()` → `BiDi.WebExtension.InstallAsync(...)` |
| JavaScript | `installAddon` | none |

## Decision

1. **Installing an extension is supported directly on the driver.** Every binding exposes, on the
   driver instance itself, a cross-browser implementation of `installExtension` — taking an unpacked
   directory, a packed archive, or base64 bytes — and `uninstallExtension`, taking the id returned by
   install. It must also support any browser-specific install options the browser exposes. The
   existing Firefox methods route through it when BiDi is enabled.

2. **Extension installation works with default settings when BiDi is enabled.** Enabling BiDi
   switches Chromium to the pipe transport and permits unsigned extensions, so installing an
   extension requires no additional flags from the user, signed or not. Firefox already exposes BiDi
   natively.

3. **A session provides BiDi or CDP, not both.** The pipe carries BiDi but not CDP, so a BiDi
   session has no CDP available. No configuration provides both — a single transport carries one or
   the other — so a caller who needs CDP does not enable BiDi.

## Considered options

**Where the method lives**
- **On the driver instance** (Accepted) — an installed extension is session state, and the driver is
  the object every binding already hands the user; it is the one shape that works identically in all
  five bindings.
- **Keep pointing users at the BiDi module** (Rejected) — the status quo, and what we advertise
  today. Per [ADR 17670](17670-bidi-implementation-boundaries.md) that module is the internal implementation: protocol-shaped, outside the
  deprecation policy, and reached differently in every binding — direct construction in Java, an
  accessor in Python, a protocol class in Ruby, through a BiDi object in .NET, and absent in
  JavaScript. It also makes users know which protocol services the command in order to use it.
- **A dedicated `extensions` namespace on the driver** (Rejected) — the strongest alternative:
  consistent with the high-level `network` / `script` surfaces, available in every binding, and with
  room for later operations such as listing or enabling. Rejected because the surface is two verbs,
  which does not earn the extra indirection, and a flat method matches the Firefox install methods
  it replaces. Worth revisiting if extension operations grow.

**Naming of the method**
- **Extend `install_addon` cross-browser** (Rejected) — "add-on" is Mozilla terminology that
  misleads for Chromium extensions, and the classic name already differs across bindings, so there
  is no single name to preserve.
- **`installWebExtension`** (Rejected) — "web extension" is the BiDi module's noun; per ADR 17670 the
  supported surface should not mirror the protocol.
- **`installExtension` / "extension" concept** (Accepted) — neutral, the word users say, and matches
  Java's existing `installExtension`.

**Signed and unsigned extensions**

Signed extensions install over the pipe with no additional browser flags. Unsigned extensions — the
common case for locally built or test extensions — additionally require Chrome's unsigned-extension
flag, which must be set when the browser launches and cannot be added once the session is running.

- **Allow unsigned extensions by default** (Accepted) — automation routinely loads locally built,
  unsigned extensions, and the flag has no effect unless the user's own code installs one. Because
  it must be set at launch, an opt-in would force the choice before the user knows whether they will
  need it, turning a late discovery into a session restart.
- **Leave unsigned extensions to an explicit opt-in** (Rejected) — a more conservative browser
  posture, but the restriction exists to stop malicious software installing extensions into a
  browser someone actually browses with. That does not describe a session the automation itself
  launched, so the opt-in adds a step without buying protection.

**Default transport**
- **Keep the port as the default** (Rejected) — the method would then require the user to pass
  specific Chrome flags before it works at all, which is the friction this decision exists to
  remove.
- **Switch to the pipe when BiDi is enabled** (Accepted).

## Consequences

- **Extensions can be added and removed mid-session**, on both Firefox and Chromium, without
  preparing capabilities before the session starts.
- **CDP is unavailable in a BiDi session.** Users who need `execute_cdp_cmd`, port-based DevTools,
  or Grid `se:cdp` do not enable BiDi for that session. This needs a release-note call-out.
- **Chromium BiDi sessions are more secure** — no localhost CDP control port for other local
  processes to attach to. The gain is largest on shared, containerized, or CI Grid nodes.
- **Grid needs no code changes.** BiDi over Grid is proxied through chromedriver's own
  `webSocketUrl` and never used the CDP port; with the pipe, a session that would have exposed
  `se:cdp` simply comes back BiDi-only.
- **Firefox is unaffected by the transport change** — it exposes BiDi natively and gates nothing on
  transport.
