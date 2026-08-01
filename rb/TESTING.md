# Ruby Testing Guide

This guide helps contributors write tests, maintain code style, and generate documentation for the Selenium Ruby bindings.

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

      it 'clicks element', pending_if: {browser: :safari, reason: 'Safari bug'} do
        # Pending on Safari
      end
    end
  end
end
```

## Running Tests

Bazel generates a target per spec file for each supported browser and variant.

```shell
bazel test //rb/spec/...                                  # All tests
bazel test //rb/spec/unit:unit                            # All unit specs (single target)
bazel test //rb/spec/integration/... --test_tag_filters=chrome         # Every Chrome variant
bazel test //rb/spec/integration/... --test_tag_filters=firefox-local  # Local Firefox only
bazel test //rb/spec/integration/... --test_tag_filters=firefox-remote # Remote (Grid) Firefox only
bazel test //rb/spec/integration/... --test_tag_filters=bidi           # BiDi-mode across supporting browsers

# Viewing Output
bazel test //rb/... --test_output=all                     # See console output at the end
bazel test //rb/... --test_output=streamed                # See output in real-time (no parallel execution)
```

A browser tag (e.g. `firefox`) matches every variant of that browser (local, remote, beta, bidi); add a
`-local`, `-remote`, or `-bidi` suffix to narrow it. Integration targets are named after the spec file with
`_spec.rb` removed plus a browser-variant suffix (e.g. `driver-chrome`, `driver-chrome-remote`,
`driver-chrome-beta-bidi`), so you can run a single spec directly:

```shell
bazel test //rb/spec/integration/selenium/webdriver:driver-chrome
```

### Using Rake

The `rb/Rakefile` provides shortcuts for common tasks:

```shell
rake update             # Setup everything to run tests in RubyMine
rake unit               # Run unit tests
rake spec               # Run all integration tests in Chrome
```

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

To test against a specific Ruby version, set it in `rb/.ruby-version` (Bazel's hermetic Ruby
toolchain reads this file). It is checked in and bumped repo-wide, so treat a local edit as a
temporary override and don't commit it:

```shell
echo '<X.Y.Z>' > rb/.ruby-version
```

### RubyMine IDE Setup

If you want to use [RubyMine](https://www.jetbrains.com/ruby/) for development, you can configure it to use Bazel artifacts:

1. Open `rb/` as a main project directory.
2. Run `bundle exec rake update` as necessary to create up-to-date artifacts. If this does not work, run `./go rb:update` from the `selenium` (parent) directory.
3. In <kbd>Settings / Languages & Frameworks / Ruby SDK and Gems</kbd> add new <kbd>Interpreter</kbd> pointing to `../bazel-selenium/external/rules_ruby_dist/dist/bin/ruby`.
4. You should now be able to run and debug any spec. It uses Chrome by default, but you can alter it using environment variables specified in the [Environment Variables](#environment-variables) section.

## Skipping Tests

Guards are RSpec metadata on `describe`, `context`, or `it` blocks (all enclosing guards
combine). Use one of the five keywords, and always include a `reason:` (a String, or an issue
number):

| Guard | Effect |
| --- | --- |
| `skip_if` | Skip when the config matches. |
| `skip_unless` | Skip unless the config matches (run only when it matches). |
| `pending_if` | Expect failure (pending) when the config matches. |
| `pending_unless` | Expect failure (pending) unless the config matches. |
| `flaky` | Like `skip_if`, reserved for unreliable/intermittent tests. |

`except`, `only`, `exclude`, and `exclusive` are older aliases of `pending_if`, `pending_unless`,
`skip_if`, and `skip_unless` respectively.

**Matching:** within one Hash every pair must match (AND); an Array value for a key matches any
listed value (OR). For an Array of Hashes, `skip_if`/`pending_if` trigger if **any** Hash matches,
while `skip_unless`/`pending_unless` apply unless **every** Hash matches.

### Guard Conditions

Conditions are registered in [`spec/integration/selenium/webdriver/spec_helper.rb`](spec/integration/selenium/webdriver/spec_helper.rb).

| Condition | Values |
| --- | --- |
| `browser` | `:chrome`, `:firefox`, `:edge`, `:safari`, `:safari_preview`, `:ie` |
| `browser_family` | `:chromium` (Chrome/Edge), `:safari` (Safari/Safari Preview), otherwise the `browser` value (e.g. `:firefox`) |
| `driver` | `:remote` |
| `platform` | `:linux`, `:macosx`, `:windows` |
| `headless` | `true`, `false` |
| `bidi` | `true`, `false` |
| `version` | Browser version string, e.g. `'stable'` (from `WD_BROWSER_VERSION`) |
| `rbe` | `true`, `false` (running on Remote Build Execution) |
| `ci` | `:github`, `:jenkins`, `:appveyor` |

Prefer `browser_family` over listing every member browser when a guard applies to a whole engine
(e.g. `browser_family: :chromium` instead of `browser: %i[chrome edge]`). Use the exact `browser`
condition when a guard is specific to one channel, such as `browser: :safari_preview` or
`browser: :chrome, version: 'beta'`.

### Guard Examples

```ruby
# Pending on Safari
it 'does something', pending_if: {browser: :safari, reason: 'Safari bug'} do
end

# Pending everywhere except Chrome and Firefox
it 'does something', pending_unless: {browser: %i[chrome firefox], reason: 'Only implemented in Chrome/Firefox'} do
end

# Pending on any Chromium-based browser (Chrome and Edge)
it 'does something', pending_if: {browser_family: :chromium, reason: 'Chromium bug'} do
end

# Skip on the stable Firefox channel
it 'does something', skip_if: {browser: :firefox, version: 'stable', reason: 'https://bugzil.la/123'} do
end

# Skip when running remotely on RBE
it 'does something', skip_if: {driver: :remote, rbe: true, reason: 'Cannot start 2+ drivers at once.'} do
end

# Known-flaky on GitHub Actions
it 'does something', flaky: {browser: :safari, ci: :github, reason: 'unreliable with downloads'} do
end

# Array of Hashes — skip if Firefox OR macOS (reason may be an issue number)
it 'something', skip_if: [
  {browser: :firefox, reason: 1234},
  {platform: :macosx, reason: 5678}
] do
end
```

## Helpers

From `spec_support/helpers.rb`:

| Helper | Description |
| --- | --- |
| `driver` | Current WebDriver instance. |
| `reset_driver!(...)` | Reset driver with new options. |
| `url_for(filename)` | Get test page URL (from `common/src/web`). |
| `wait` / `short_wait` / `long_wait` | Wait instances (10s, 3s, 30s). |
| `wait_for_element(locator)` | Wait for element to appear. |
| `wait_for_alert` | Wait for alert presence. |

## Asserting Log Output

Every `WebDriver.logger` call should include an `id:` symbol (e.g. `logger.warn(msg, id: :safari_bidi)`).
To assert on logging content (and hide it from test logs), do not stub the logger, instead use one of
the [custom matchers](spec/rspec_matchers.rb): `have_error`, `have_warning`, `have_info`, and
`have_deprecated`.

```ruby
expect { SeleniumManager.binary }.to have_info(:selenium_manager)      # id was logged, at info level
expect { save_screenshot(png_path) }.not_to have_warning(:screenshot)  # id was not logged
```

The match is the exact set of ids at that severity — an unexpected entry fails rather than slipping by
— so assert several entries by passing the full set, e.g. `have_warning(%i[general specific])`.

The id is provided so you don't have to assert on specific text, but if the message comes from an
external source, you can assert on the contents as well:

```ruby
expect { navigate }.to have_error(:ws, /This is fine!/)
```

Deprecations (`logger.deprecate`) are asserted with `have_deprecated`:

```ruby
WebDriver.logger.deprecate('Old thing', 'New thing', id: :old_thing)   # lib
expect { call_old_thing }.to have_deprecated(:old_thing)               # spec
```

## Debugging

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

### BiDi Testing

BiDi-enabled targets are generated with a `-bidi` suffix for the browsers that support it
(they set `WEBDRIVER_BIDI=true` internally). Run them directly or filter by the `bidi` tag:

```shell
# Run a spec's BiDi variant
bazel test //rb/spec/integration/selenium/webdriver:driver-chrome-bidi

# Run every BiDi variant across browsers that support it
bazel test //rb/spec/integration/... --test_tag_filters=bidi
```

To enable BiDi on a target that is not a `-bidi` variant, pass the variable through `--test_env`:

```shell
bazel test //rb/spec/integration/... --test_tag_filters=chrome --test_env=WEBDRIVER_BIDI=true
```

### Common Variables

Bazel sets the variables below automatically for each generated target. To override one (or set it
on a target that does not), pass it with `--test_env`, e.g.
`bazel test //rb/spec/integration/... --test_tag_filters=chrome --test_env=HEADLESS=true`.

| Variable | Purpose |
| --- | --- |
| `WEBDRIVER_BIDI` | Enable the BiDi protocol (set by the `-bidi` targets). |
| `HEADLESS` | Run Chrome, Edge, and Firefox in headless mode. |
| `WD_SPEC_DRIVER` | Driver to test; a browser name or `remote` (set by Bazel). |
| `WD_REMOTE_BROWSER` | When `WD_SPEC_DRIVER` is `remote`, the browser to test (set by Bazel). |
| `WD_REMOTE_URL` | URL of an already-running server to use for remote tests. |
| `DOWNLOAD_SERVER` | When `WD_REMOTE_URL` is unset, download and use the most recently released server for remote tests. |
| `DISABLE_BUILD_CHECK` | For Chrome and Edge, ignore driver/browser version mismatches (allows testing Canary builds). |
| `CHROME_BINARY` / `CHROMEDRIVER_BINARY` | Paths to a specific Chrome browser / ChromeDriver. |
| `EDGE_BINARY` / `MSEDGEDRIVER_BINARY` | Paths to a specific Edge browser / msedgedriver. |
| `FIREFOX_BINARY` / `GECKODRIVER_BINARY` | Paths to a specific Firefox browser / GeckoDriver. |

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

Selenium Ruby uses **Steep** for gradual type checking with RBS (Ruby Signature) files. When you create a new class or modify existing classes, add or update the corresponding `.rbs` file in `sig/`, mirroring the directory structure of `lib/`.

```shell
# Type check all files
bundle exec steep check

# Type check specific files
bundle exec steep check lib/selenium/webdriver/my_class.rb
```

**Tips:** start with `untyped` for complex types and refine over time; prefer concrete types
(`String`, `Integer`) where possible; use generics for collections (`Array[String]`,
`Hash[Symbol, String]`). CI runs Steep, so ensure signatures are correct before submitting a PR.

## Documentation

We use **YARD** for inline documentation. Ensure your changes are documented and generate valid HTML.

```shell
# Generate documentation
bundle exec yard doc

# Run a local documentation server (view at http://localhost:8808)
bundle exec yard server --reload
```

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
