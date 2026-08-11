<!-- Guidance for AI agents working in Selenium Ruby Bindings -->

## Code location
- Library: `rb/lib/selenium/webdriver`
- Tests: `rb/spec/unit/` and `rb/spec/integration/`
- Type signatures: `rb/sig/`

## Common commands
- Build: `bazel build //rb/...`

## Testing
See `rb/TESTING.md`

## Code conventions

### Logging
```ruby
WebDriver.logger.warn("actionable: something needs attention", id: :warning_id)
WebDriver.logger.info("useful: driver started successfully")
WebDriver.logger.debug("diagnostic: request details for debugging")
```

### Deprecation
```ruby
WebDriver.logger.deprecate(
  'OldClass#old_method',
  'NewClass#new_method',
  id: :old_method
)
```

### Internal APIs
Mark internal APIs with `@api private` in YARD comments:
```ruby
# @api private
def internal_method
end
```

### Type signatures (steep/rbs)
When changing public API, update corresponding `.rbs` files in `rb/sig/`

### Documentation
Use YARD for public APIs:
```ruby
# Brief description.
#
# @param name [Type] description
# @return [Type] description
# @raise [ErrorClass] when condition
```

## Integration test guards

Integration specs are guarded by RSpec metadata on `describe`/`context`/`it` (all enclosing
guards combine). Use one of these five, and always include a `reason:`:

- `skip_if:` — skip when config matches
- `skip_unless:` — run only when config matches
- `pending_if:` — expect failure when config matches
- `pending_unless:` — expect failure unless config matches
- `flaky:` — `skip_if` reserved for unreliable/intermittent tests

Matching within one Hash = AND (every pair must match); an Array value within a key = OR (matches any
listed value). An Array of Hashes lists configs matched independently, and the combined effect depends
on the guard direction: for `skip_if`/`pending_if` the guard triggers if **any** Hash matches (OR); for
`skip_unless`/`pending_unless` the example is kept only where **all** Hashes match (i.e. it is
skipped/pended if any does not). The `reason:` is a String or an issue number. Conditions (`browser`,
`driver`, `platform`, `ci`, etc.) are registered in
[`spec_helper.rb`](spec/integration/selenium/webdriver/spec_helper.rb).

```ruby
skip_if: {browser: %i[chrome edge], headless: true, reason: '...'}                   # headless Chrome or Edge
pending_if: [{browser: :firefox, reason: 1234}, {platform: :macosx, reason: 5678}]   # Firefox OR macOS
skip_unless: [{bidi: false, reason: '...'}, {driver: :remote, reason: '...'}]        # only when non-bidi AND remote
```
