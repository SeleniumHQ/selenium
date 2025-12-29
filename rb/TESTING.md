# Ruby Testing Guide

This guide helps contributors write tests in the Selenium Ruby codebase.

## Test Framework

* Tests use RSpec.
* Test HTML pages live in `common/src/web/`.
* `url_for("page.html")` gets test page URLs.
* Helper methods: `driver`, `wait`, `short_wait`, `long_wait`.

```ruby
module Selenium
  module WebDriver
    describe Element do
      it 'returns element text' do
        driver.get(url_for('simpleTest.html'))
        expect(driver.find_element(id: 'foo').text).to eq('expected')
      end

      it 'clicks element', except: {browser: :safari, reason: 'Safari bug'} do
        # Skipped on Safari
      end
    end
  end
end
```

## Running Tests

Bazel creates test targets for each browser and remote variants.

```shell
bazel test //rb/spec/...  # All tests
bazel test //rb/spec/unit/...  # Unit tests
bazel test //rb/spec/integration/... --test_tag_filters=chrome  # Chrome tests
bazel test //rb/spec/integration/... --test_tag_filters=firefox  # Firefox tests
bazel test //rb/spec/integration/... --test_tag_filters=chrome-remote  # Chrome on Grid

# Additional Arguments
bazel test //rb/... --test_output=all # See console output at the end
bazel test //rb/... --test_output=streamed # See console output real-time (removes parallel execution)
```

## Guards (Test Skipping)

Guards control when tests run. Add them as metadata on `describe`, `context`, or `it` blocks.

| Guard | When to Use |
|-------|-------------|
| `except` | Test is pending if conditions ARE met |
| `only` | Test is pending if conditions are NOT met |
| `exclusive` | Test is skipped entirely if conditions not met |
| `exclude` | Test is skipped (use for broken/unreliable tests) |

```ruby
# Skip on Safari
it 'does something', except: {browser: :safari, reason: 'Safari bug'} do
end

# Only run on Chrome and Firefox
it 'does something', only: {browser: %i[chrome firefox]} do
end

# Skip entirely (not pending) when BiDi enabled
describe Driver, exclusive: {bidi: false, reason: 'Not implemented with BiDi'} do
end

# Multiple conditions
it 'something', exclude: [
  {browser: :safari},
  {browser: :firefox, reason: 'https://github.com/SeleniumHQ/selenium/issues/123'}
] do
end
```

### Guard Conditions

| Condition | Values |
|-----------|--------|
| `browser` | `:chrome`, `:firefox`, `:edge`, `:safari`, `:safari_preview`, `:ie` |
| `driver` | `:remote` |
| `platform` | `:linux`, `:macos`, `:windows` |
| `headless` | `true`, `false` |
| `bidi` | `true`, `false` |
| `ci` | `true`, `false` |

## Helpers

From `spec_support/helpers.rb`:

| Helper | Description |
|--------|-------------|
| `driver` | Current WebDriver instance |
| `reset_driver!(...)` | Reset driver with new options |
| `url_for(filename)` | Get test page URL |
| `wait` / `short_wait` / `long_wait` | Wait instances (10s, 3s, 30s) |
| `wait_for_element(locator)` | Wait for element to appear |
| `wait_for_alert` | Wait for alert presence |

## Test Organization

```
rb/spec/
├── unit/                      # Unit tests (no browser)
│   └── selenium/webdriver/
└── integration/               # Integration tests
    └── selenium/webdriver/
        ├── chrome/
        ├── firefox/
        ├── safari/
        ├── bidi/
        └── spec_support/      # Test helpers
```

Test files end in `_spec.rb` (e.g., `driver_spec.rb`).

## Build Files

* Adding tests shouldn't require Bazel changes—`rb_integration_test` uses glob patterns.
* Make sure `*_spec.rb` files are in a directory with a `BUILD.bazel` containing `rb_integration_test`.

## Environment Variables

Environment variables control test execution behavior and enable specific features.

### BiDi Testing

To run tests with BiDi (Bidirectional) protocol enabled:

```shell
# Enable BiDi for all tests
WD_REMOTE_BROWSER=chrome BIDI=true bazel test //rb/spec/integration/...

# Run BiDi-specific tests
bazel test //rb/spec/integration/selenium/webdriver/bidi/...
```

### Available Variables

| Variable | Purpose | Values | Example |
|----------|---------|--------|---------|
| `BIDI` | Enable BiDi protocol | `true`, `false` | `BIDI=true` |
| `WD_REMOTE_BROWSER` | Specify browser for remote tests | `chrome`, `firefox`, `edge`, `safari` | `WD_REMOTE_BROWSER=firefox` |
| `HEADLESS` | Run tests in headless mode | `true`, `false` | `HEADLESS=true` |
| `DEBUG` | Enable debug logging | `true`, `false` | `DEBUG=true` |

### Examples

```shell
# Run Chrome tests with BiDi enabled
BIDI=true bazel test //rb/spec/integration/... --test_tag_filters=chrome

# Run headless Firefox tests
HEADLESS=true bazel test //rb/spec/integration/... --test_tag_filters=firefox

# Run remote tests on Edge with BiDi
WD_REMOTE_BROWSER=edge BIDI=true bazel test //rb/spec/integration/... --test_tag_filters=remote

# Combine multiple variables
BIDI=true HEADLESS=true DEBUG=true bazel test //rb/spec/integration/selenium/webdriver/bidi/...
```

### Testing Guard Behavior

Environment variables interact with test guards. For example:

```ruby
# This test only runs when BiDi is enabled
it 'uses BiDi feature', only: {bidi: true} do
  # Test code
end

# This test is excluded when BiDi is enabled
it 'classic WebDriver only', exclusive: {bidi: false} do
  # Test code
end
```

Run with `BIDI=true` to see these guards in action.
