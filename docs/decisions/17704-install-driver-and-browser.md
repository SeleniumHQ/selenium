# 17704. A static `install` method downloads the driver and browser

- Status: Proposed
- Discussion: https://github.com/SeleniumHQ/selenium/pull/17704

## Context

By default Selenium Manager doesn't execute until a driver session is being started, so the
first session pays the download cost for any missing driver or browser, and a missing or
offline binary isn't discovered until then.

Warming the cache ahead of time is useful whenever that cost or failure should happen at a
controlled point rather than on first use: provisioning a CI image, a test suite's setup
step, or simply confirming a binary is available before relying on it. It can be done today,
but only through the internal `DriverFinder` resolution API, which is shaped differently in
each binding and not meant as public surface:

| Binding    | Current way to trigger an early download |
|------------|------------------------------------------|
| Java       | `new DriverFinder(service, options).getBrowserPath()` |
| Python     | `DriverFinder(service, options).get_browser_path()` |
| Ruby       | `DriverFinder.new(options, service).browser_path` |
| .NET       | `await new DriverFinder(options).GetBrowserPathAsync()` |
| JavaScript | `driverFinder.getBinaryPaths(capabilities)` |

This record proposes a convenient public method instead. It does not propose changing
Selenium Manager behavior.

## Decision

Each binding adds a static `install`, idiomatic in spelling and async per language, on the
classes whose binaries Selenium Manager can download:

- **On the driver class** (e.g. `Chrome::Driver.install!`, `ChromeDriver.InstallAsync()`):
  downloads the browser and its driver.
- The driver-class method **accepts an optional options instance**, so a caller can target a
  specific browser version or binary; environment variables alone can't express that.
- **On the service class** (e.g. `Chrome::Service.install!`): downloads the driver.

Calling it triggers Selenium Manager to download whatever is missing. Default behaviors apply
and can be adjusted using existing defined environment variables for Selenium Manager (e.g.,
`SE_FORCE_BROWSER_DOWNLOAD`, `SE_SKIP_BROWSER_IN_PATH`, and `SE_SKIP_DRIVER_IN_PATH`).

Returning the resolved paths is a permitted implementation choice, but not the intent: the
method exists for its side effect, a warmed cache, not for a value callers should depend on.

The method exists only where Selenium Manager downloads the binaries; browsers that use a
system driver or browser (Safari, IE) don't get it.

## Considered options

- **No public method (Rejected).** Leaves callers reaching into internal APIs.
- **An instance method (Rejected).** Warming happens before a session exists; a static is
  where users start one.
- **Defaults only, no options instance (Rejected).** Environment variables can adjust
  download behavior but can't select a specific browser version or binary.
- **A single method on only the driver or only the service class (Rejected).** Each is the
  natural entry point for the binaries it owns; offering only one makes a caller holding the
  other construct it first.

## Consequences

- Provisioning binaries ahead of a session becomes a supported, one-call operation.
