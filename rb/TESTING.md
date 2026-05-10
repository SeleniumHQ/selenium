# Ruby Testing Guide

This guide helps contributors write tests, maintain code style, and generate documentation for the Selenium Ruby bindings.

## Local Development Setup

Before running tests, navigate to the `rb/` directory and install the required dependencies. A recent Bundler (2.4 or newer) is recommended.

```shell
cd rb
gem install bundler -v '~> 2.4'
bundle install
```

**Note:** Local development still requires running Bazel to generate the atoms and devtools code. You can generate these artifacts by running:

```shell
bundle exec rake update
```

Or from the parent `selenium` directory:

```shell
./go rb:update
```

### RubyMine IDE Setup

If you want to use [RubyMine](https://www.jetbrains.com/ruby/) for development, you can configure it to use Bazel artifacts:

1. Open `rb/` as a main project directory.
2. Run `bundle exec rake update` as necessary to create up-to-date artifacts. If this does not work, run `./go rb:update` from the `selenium` (parent) directory.
3. In <kbd>Settings / Languages & Frameworks / Ruby SDK and Gems</kbd> add new <kbd>Interpreter</kbd> pointing to `../bazel-selenium/external/rules_ruby_dist/dist/bin/ruby`.
4. You should now be able to run and debug any spec. It uses Chrome by default, but you can alter it using environment variables specified in the [Environment Variables](#environment-variables) section.

## Test Framework

* Tests use RSpec.
* Test HTML files live in `common/src/web/`.
* **Helper methods:** `driver`, `wait`, `short_wait`, `long_wait`, `url_for`.

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

Bazel creates test targets for each browser and remote variants.

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

### 2. Using Rake

The `rb/Rakefile` provides shortcuts for common tasks:

```shell
rake update             # Setup everything to run tests in RubyMine
rake unit               # Run unit tests
rake spec               # Run all integration tests in Chrome

```

## Guards (Test Skipping)

Guards control when tests run. Add them as metadata on `describe`, `context`, or `it` blocks.

| Guard | When to Use |
| --- | --- |
| `except` | Test is pending if conditions ARE met. |
| `only` | Test is pending if conditions are NOT met. |
| `exclusive` | Test is skipped entirely if conditions not met. |
| `exclude` | Test is skipped (use for broken/unreliable tests). |

### Guard Conditions

Conditions are defined in [`spec/integration/selenium/webdriver/spec_helper.rb`](spec/integration/selenium/webdriver/spec_helper.rb).

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

Configuration is defined in [`.rubocop.yml`](.rubocop.yml). **Prefer updating the configuration file over using in-file rubocop guards** (like `# rubocop:disable`) to maintain consistency across the codebase.

```shell
# Check code style
bundle exec rubocop

# Auto-correct simple offenses
bundle exec rubocop -A

```

## Type Signatures with Steep

Selenium Ruby uses **Steep** for gradual type checking with RBS (Ruby Signature) files. When you create a new class or modify existing classes, you should add or update the corresponding type signatures.

### Adding Type Signatures for New Classes

When creating a new class in `lib/selenium/webdriver/`:

1. Create a corresponding `.rbs` file in `sig/` with the same directory structure.
2. Define the class signature with method signatures, parameter types, and return types.

**Example:** For `lib/selenium/webdriver/my_class.rb`:

```ruby
# lib/selenium/webdriver/my_class.rb
module Selenium
  module WebDriver
    class MyClass
      def initialize(value)
        @value = value
      end

      def process
        @value.to_s.upcase
      end
    end
  end
end
```

Create `sig/selenium/webdriver/my_class.rbs`:

```rbs
module Selenium
  module WebDriver
    class MyClass
      @value: untyped

      def initialize: (untyped value) -> void
      def process: () -> String
    end
  end
end
```

### Updating Type Signatures

When modifying method signatures, parameters, or return types:

1. Update the corresponding `.rbs` file to match the implementation.
2. Run Steep to check for type errors.

### Running Steep

```shell
# Type check all files
bundle exec steep check

# Type check specific files
bundle exec steep check lib/selenium/webdriver/my_class.rb

# Show Steep statistics
bundle exec steep stats

```

### Type Signature Best Practices

* **Start simple:** Use `untyped` for complex types initially, then refine.
* **Be specific:** Prefer concrete types (`String`, `Integer`) over `untyped` when possible.
* **Document generics:** Use generic types for collections (e.g., `Array[String]`, `Hash[Symbol, String]`).
* **Match reality:** Ensure signatures accurately reflect the actual implementation.

### Common RBS Types

| Type | Description | Example |
| --- | --- | --- |
| `String` | String values | `def name: () -> String` |
| `Integer` | Integer numbers | `def count: () -> Integer` |
| `bool` | Boolean (true/false) | `def valid?: () -> bool` |
| `void` | No return value | `def initialize: () -> void` |
| `untyped` | Any type (use sparingly) | `def raw: () -> untyped` |
| `Array[T]` | Array of type T | `def tags: () -> Array[String]` |
| `Hash[K, V]` | Hash with key/value types | `def opts: () -> Hash[Symbol, String]` |
| `T \| nil` | Nullable type | `def find: () -> (Element \| nil)` |

**Note:** CI runs Steep checks. Ensure your type signatures are correct before submitting a PR.

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

### Interactive REPL

Instead of using `irb`, you can create an interactive REPL with all gems loaded using:

```shell
bazel run //rb:console
```

### Debugging with the `debug` gem

Use the [`debug`](https://github.com/ruby/debug) gem to set breakpoints inside specs or library code:

1. Add `binding.break` where you want the debugger to stop.
2. Run the test with the `ruby_debug` configuration:

   ```shell
   bazel test --config ruby_debug <test>
   ```

3. In a separate terminal, attach to the running debugger:

   ```shell
   bazel-selenium/external/bundle/bin/rdbg -A
   ```

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
        ├── bidi`
        └── spec_support/      # Test helpers

```

Test files must end in `_spec.rb` (e.g., `driver_spec.rb`).

## Build Files

* Adding tests shouldn't require Bazel changes—`rb_integration_test` uses glob patterns.
* Make sure `*_spec.rb` files are in a directory with a `BUILD.bazel` containing `rb_integration_test`.
