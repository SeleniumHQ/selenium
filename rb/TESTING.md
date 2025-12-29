# Ruby Testing Guide

This guide helps contributors write tests, maintain code style, and generate documentation for the Selenium Ruby bindings.

## Local Development Setup

Before running tests, navigate to the `rb/` directory and install the required dependencies.

```shell
cd rb
bundle install

```

## Test Framework

* **Runner:** Tests use RSpec.
* **Test Pages:** HTML files live in `common/src/web/`.
* **Helpers:** `driver`, `wait`, `short_wait`, `long_wait`, `url_for`.

### Example Spec

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

There are two ways to run tests: **Bazel** (used in CI) and **RSpec** (preferred for local development).

### 1. Using Bazel (CI Workflow)

Bazel creates isolated test targets for each browser and remote variants.

```shell
bazel test //rb/spec/...                              # All tests
bazel test //rb/spec/unit/...                         # Unit tests
bazel test //rb/spec/integration/... --test_tag_filters=chrome  # Chrome tests
bazel test //rb/spec/integration/... --test_tag_filters=firefox # Firefox tests
bazel test //rb/spec/integration/... --test_tag_filters=chrome-remote # Chrome on Grid

# Viewing Output
bazel test //rb/... --test_output=all                 # See console output at the end
bazel test //rb/... --test_output=streamed            # See output in real-time (no parallel execution)

```

### 2. Using RSpec (Local Workflow)

For rapid "edit-run" cycles, use RSpec directly. This bypasses the Bazel sandbox and is faster for local debugging. **Selenium Manager** automatically handles driver setup (chromedriver, geckodriver), so no manual path configuration is required.

```shell
# Run a specific spec file
bundle exec rspec spec/integration/selenium/webdriver/chrome/driver_spec.rb

# Run all unit tests
bundle exec rspec spec/unit

# Run with specific environment variables
driver=firefox bundle exec rspec spec/integration/selenium/webdriver/firefox/driver_spec.rb

```

### 3. Using Rake

The `Rakefile` provides shortcuts for common tasks:

```shell
rake spec:unit          # Run unit tests
rake spec:integration   # Run integration tests (Chrome default)
rake docs               # Generate docs
rake clean              # Clean generated artifacts

```

## Guards (Test Skipping)

Guards control when tests run. Add them as metadata on `describe`, `context`, or `it` blocks.

| Guard | When to Use |
| --- | --- |
| `except` | Test is pending if conditions ARE met. |
| `only` | Test is pending if conditions are NOT met. |
| `exclusive` | Test is skipped entirely if conditions not met (not pending). |
| `exclude` | Test is skipped (use for broken/unreliable tests). |

### Guard Conditions

| Condition | Values |
| --- | --- |
| `browser` | `:chrome`, `:firefox`, `:edge`, `:safari`, `:safari_preview`, `:ie` |
| `driver` | `:remote` |
| `platform` | `:linux`, `:macos`, `:windows` |
| `headless` | `true`, `false` |
| `bidi` | `true`, `false` |
| `ci` | `true`, `false` |

### Guard Examples

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
  {browser: :firefox, reason: '[https://github.com/SeleniumHQ/selenium/issues/123](https://github.com/SeleniumHQ/selenium/issues/123)'}
] do
end

```

## Code Style & Linting

Selenium enforces strict code style using **Rubocop**. CI will fail if linting errors are present.

```shell
# Check code style
bundle exec rubocop

# Auto-correct simple offenses
bundle exec rubocop -A

```

## Documentation

We use **YARD** for inline documentation. Ensure your changes are documented and generate valid HTML.

```shell
# Generate documentation
bundle exec yard doc

# Run a local documentation server (view at http://localhost:8808)
bundle exec yard server --reload

```

## Helpers & Debugging

From `spec_support/helpers.rb`:

| Helper | Description |
| --- | --- |
| `driver` | Current WebDriver instance. |
| `reset_driver!(...)` | Reset driver with new options. |
| `url_for(filename)` | Get test page URL (from `common/src/web`). |
| `wait` / `short_wait` / `long_wait` | Wait instances (10s, 3s, 30s). |
| `wait_for_element(locator)` | Wait for element to appear. |
| `wait_for_alert` | Wait for alert presence. |

### Debugging

To debug tests locally (outside of Bazel), insert a breakpoint:

1. Add `require 'pry'; binding.pry` in your code.
2. Run the test using `bundle exec rspec`.

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

### Common Variables

| Variable | Purpose | Values | Example |
| --- | --- | --- | --- |
| `BIDI` | Enable BiDi protocol | `true`, `false` | `BIDI=true` |
| `WD_REMOTE_BROWSER` | Specify browser for remote tests | `chrome`, `firefox`, `edge`, `safari` | `WD_REMOTE_BROWSER=firefox` |
| `HEADLESS` | Run tests in headless mode | `true`, `false` | `HEADLESS=true` |
| `DEBUG` | Enable debug logging | `true`, `false` | `DEBUG=true` |

## Test Organization

```text
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

Test files must end in `_spec.rb` (e.g., `driver_spec.rb`).

## Build Files

* Adding tests shouldn't require Bazel changes—`rb_integration_test` uses glob patterns.
* Make sure `*_spec.rb` files are in a directory with a `BUILD.bazel` containing `rb_integration_test`.

```

```
