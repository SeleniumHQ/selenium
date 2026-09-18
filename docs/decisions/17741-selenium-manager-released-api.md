# 17741. Selenium Manager ships as an official, independently released tool

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17741

## Context

Releasing Selenium Manager (SM) independently of the bindings means a binding and the SM it
invokes can differ in version. This record settles what that commits us to. A decision belongs
here only if it either cannot change after 1.0 without a breaking change — the forward-compatibility
behavior and every committed default — or is an obligation the independent release itself creates.
Bugs and additive enhancements (new browsers, warning wording) are out of scope.

## Decision

**Versioning and distribution.** SM takes its own semantic version from `1.0.0` and is released
standalone as well as bundled. Bindings ship and default to a known-good SM, but already let a user
point at a different binary, so a binding and the SM it runs may differ in version.

**Output.** The default follows standard CLI convention — result on stdout, logs on stderr — so
`$(selenium-manager …)` captures only the result. Bindings request output explicitly and are
unaffected, so only the standalone audience is impacted.

**Forward compatibility.** Neither the bindings nor the binary may fail solely because of version
skew. How an older SM treats an input it does not recognize depends on the input:

- *Unknown switch* → warn (tell the user to update SM) and ignore; the binding still gets valid
  paths. A switch only adjusts resolution, so dropping it is safe.
- *Unknown value of a switch that has a default* (output format, log level) → use the default and warn.
- *Unknown value of a switch with no default* → error, naming the value and telling the user to
  update SM (e.g. `Selenium Manager 1.2 does not support browser 'chrome-for-testing'`). There is
  nothing to fall back to; for `--browser` these are distinct browsers where substituting one would
  be the wrong result. Erroring is safe because such values are only ever requested explicitly.
- New switches must be optional — an older binding will omit them.
- Nothing in the contract — switches, values, output fields — is removed or renamed without a
  deprecation cycle.
- Current defaults must not change once released, and must all be documented
  ([configuration reference](https://www.selenium.dev/documentation/selenium_manager/#configuration)).

**Resolution.**

- When provided a driver location, SM validates the correct browser and downloads it if necessary,
  instead of being bypassed. This is not backward compatible, so a toggle is necessary to control
  desired behavior.
- A `PATH` driver whose version does not match the browser is not used; SM fetches a matching one.

**Telemetry.**

- The binding must pass in the Selenium version and language (name and version).
- SM must pass in the SM version.
- Each time SM sends data, it logs what was sent and how to disable it.

## Considered options

- **Leaving Beta.**
  - Stay in Beta — contract stays mutable.
  - Drop the label but keep versioning coupled to the bindings — empty releases, no standalone use.
  - Independently versioned, standalone-released — **selected**.
- **Default output.**
  - Keep logs on stdout — pollutes `$(selenium-manager …)`.
  - Follow standard CLI convention: result on stdout, diagnostics on stderr — **selected**.
- **Unknown switch, or unknown value of a switch with a default.**
  - Error — turns expected skew into a broken session.
  - Warn and ignore the switch, or use the default value — **selected**.
- **Unknown value of a switch with no default** (e.g. `--browser`).
  - Warn and substitute a fallback — silently does something other than what was asked.
  - Error, directing the user to update SM — **selected**.
- **A provided driver.**
  - Keep bypassing SM — the browser is left unmanaged.
  - Always run SM — breaks backward compatibility.
  - Run it behind a toggle, default unchanged — **selected**.
- **A mismatched `PATH` driver.**
  - Use it with a warning — usually still fails at session start.
  - Do not use it, fetch a matching one — **selected**.

## Consequences

- Once released, the contract constrains every `rust/` change: no switch, value, or output field
  changes without a deprecation cycle, and the current defaults are locked.
