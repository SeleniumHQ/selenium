# @selenium/manager

Selenium Manager discovers the browsers installed on a machine, downloads the
matching drivers, and prints the paths back as JSON. It is the component the
Selenium bindings already shell out to; this package publishes it on its own so
it can be used without installing a binding.

## Running it

No install needed:

```sh
npx @selenium/manager --browser chrome
```

Or install it:

```sh
npm install @selenium/manager
npx selenium-manager --browser chrome
```

Pass `--help` for the full command set.

## Platform packages

`@selenium/manager` carries no binary itself. It declares one optional
dependency per platform, and npm installs only the one that matches the machine:

| Platform                   | Package                          |
| -------------------------- | -------------------------------- |
| Linux x64                  | `@selenium/manager-linux-x64`    |
| Linux arm64                | `@selenium/manager-linux-arm64`  |
| macOS (Intel and Apple Si) | `@selenium/manager-darwin`       |
| Windows (x86, x64, arm64)  | `@selenium/manager-win32`        |

macOS and Windows are one package each: the macOS binary is universal, and the
Windows binary is ia32, which Windows runs on x64 and arm64 as well.

## Using it from Node

`binaryPath()` resolves the binary without launching it, for callers that want
to run it themselves:

```js
const { binaryPath } = require('@selenium/manager')
const { execFileSync } = require('node:child_process')

execFileSync(binaryPath(), ['--browser', 'chrome', '--output', 'json'])
```

Setting `SE_MANAGER_PATH` overrides the resolved path, the same way it does in
every Selenium binding.

## Links

- Source: https://github.com/SeleniumHQ/selenium/tree/trunk/javascript/selenium-manager
- Documentation: https://www.selenium.dev/documentation/selenium_manager
- Issues: https://github.com/SeleniumHQ/selenium/issues
