# JavaScript Testing Guide

This guide helps contributors write tests in the Selenium JavaScript codebase.

## Test Framework

- Tests use Mocha.
- Test HTML pages accessed via `Pages` object.
- `suite()` wrapper handles multi-browser setup.
- Assertions use Node.js `assert` module.

```javascript
const assert = require('node:assert')
const { Browser, By } = require('selenium-webdriver')
const { Pages, ignore, suite } = require('../lib/test')

suite(function (env) {
  let driver

  before(async function () {
    driver = await env.builder().build()
  })

  after(function () {
    return driver.quit()
  })

  it('should find element', async function () {
    await driver.get(Pages.simpleTestPage)
    let element = await driver.findElement(By.id('foo'))
    assert.strictEqual(await element.getText(), 'expected')
  })

  ignore(env.browsers(Browser.SAFARI)).it('skipped on Safari', async function () {
    // This test is skipped on Safari
  })
})
```

## Running Tests

```shell
bazel test //javascript/selenium-webdriver:small-tests  # Unit tests (no browser)
bazel test //javascript/selenium-webdriver/...  # All tests

# Per-file browser targets are named test-<file>-<browser>; discover exact names with:
# bazel query //javascript/selenium-webdriver:all | grep element-finding
bazel test //javascript/selenium-webdriver:test-element-finding-test.js-chrome
bazel test //javascript/selenium-webdriver:test-element-finding-test.js-edge
bazel test //javascript/selenium-webdriver:test-element-finding-test.js-firefox

# Against a Grid (chrome and firefox only). Each target starts its own Selenium
# standalone server and routes every session through it.
bazel test //javascript/selenium-webdriver:test-upload-test.js-chrome-remote
bazel test //javascript/selenium-webdriver/... --test_tag_filters=chrome-remote

# What GitHub Actions runs on every pull request, on macOS and Windows
bazel test //javascript/selenium-webdriver/... --test_tag_filters=os-sensitive,se-manager

# Additional Arguments
bazel test //javascript/selenium-webdriver/... --flaky_test_attempts=3
bazel test //javascript/selenium-webdriver/... --test_output=all
```

Each large test file gets a target per browser it runs against: chrome, edge and firefox, or
the ones its `suite()` is limited to (`{ browsers: [...] }`), as recorded in
`test/test_browsers.bzl`. It also gets chrome and firefox `-remote` targets, except the files in
`NO_GRID_TESTS` in `BUILD.bazel`, which test a local driver service itself.

CI runs every target on Linux (RBE), with pinned browsers. On GitHub Actions, every pull request
also runs what RBE cannot vouch for: the tests tagged `os-sensitive` (`OS_SENSITIVE_TESTS`) on
macOS and Windows, and those tagged `se-manager` (`SE_MANAGER_TESTS`, which find the browser and
driver through Selenium Manager) on macOS, Windows and Linux. Everything else runs on Windows
nightly.

## Skipping Tests

Use `ignore()` with browser predicates to skip tests:

```javascript
const { ignore, suite } = require('../lib/test')

suite(function (env) {
  // Skip single test on Safari
  ignore(env.browsers(Browser.SAFARI)).it('test name', async function () {})

  // Skip on multiple browsers
  ignore(env.browsers(Browser.CHROME, Browser.FIREFOX)).it('test name', async function () {})

  // Skip entire describe block
  ignore(env.browsers(Browser.IE)).describe('feature', function () {
    it('test 1', async function () {})
    it('test 2', async function () {})
  })
})
```

Browser values: `Browser.CHROME`, `Browser.FIREFOX`, `Browser.SAFARI`, `Browser.EDGE`, `Browser.IE`

To skip a test that cannot run through a Grid, use `env.remote()` and give the reason, ideally
a tracked issue:

```javascript
// System access can only be granted to a local geckodriver, not a Grid session.
ignore(env.remote()).describe('context switching', function () {})
```

## Helpers

### From `lib/test`

| Export              | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `suite(fn)`         | Test wrapper that handles driver setup per browser        |
| `ignore(predicate)` | Skip tests when predicate returns true                    |
| `Pages`             | Object with test page URLs (`Pages.simpleTestPage`, etc.) |
| `whereIs(path)`     | Get URL for test resource                                 |

### Inside `suite(fn)`

| Member                   | Description                               |
| ------------------------ | ----------------------------------------- |
| `env.builder()`          | Get WebDriver builder for current browser |
| `env.browsers(...names)` | Predicate for browser matching            |
| `env.remote()`           | Predicate for running through a Grid      |

### Test Utilities (`test/lib/testutil.js`)

| Utility                        | Description                            |
| ------------------------------ | -------------------------------------- |
| `callbackPair(success, error)` | Create callback pair for async testing |
| `StubError`                    | Error class for testing error handling |
| `assertIsStubError(err)`       | Assert error is StubError              |

## Test Organization

```
javascript/selenium-webdriver/
├── test/
│   ├── lib/                  # Small tests (no browser)
│   │   ├── by_test.js
│   │   └── promise_test.js
│   ├── *_test.js            # Large tests (browser required)
│   ├── chrome/              # Chrome-specific tests
│   ├── firefox/             # Firefox-specific tests
│   └── bidi/                # BiDi protocol tests
└── lib/test/                # Test helpers
    ├── index.js
    └── fileserver.js
```

Test files end in `_test.js`.

## Build Files

- Adding tests shouldn't require Bazel changes for existing directories.
- Small tests (no browser) go in `test/lib/` and are listed in `SMALL_TESTS`.
- Large tests (browser required) go in `test/`.
- A large test file whose `suite()` is limited to some browsers needs a matching entry in
  `test/test_browsers.bzl`; `test/lib/test_browsers_test.js` fails and names the entry to add if
  they disagree.
