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
bazel test //javascript/selenium-webdriver:all  # All tests

# Specific browser tests
bazel test //javascript/selenium-webdriver:element-finding-test-chrome
bazel test //javascript/selenium-webdriver:element-finding-test-firefox

# Additional Arguments
bazel test //javascript/selenium-webdriver:... --flaky_test_attempts=3
bazel test //javascript/selenium-webdriver:... --test_output=all
```

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
- Small tests (no browser) go in `test/lib/`.
- Large tests (browser required) go in `test/`.
