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

## Formatting
Ruby files are formatted with **RuboCop** (target Ruby 3.2).
Run `./go format` after changes; it will auto-fix most violations (`-a` flag).

Key rules enforced (from `rb/.rubocop.yml`):
- No spaces inside hash literal braces: `{key: val}` not `{ key: val }`
- Line length limit applies (comments excluded); keep lines reasonably short
- RuboCop plugins active: `rubocop-performance`, `rubocop-rake`, `rubocop-rspec`
- Any violation at `Fatal` severity (`--fail-level F`) blocks CI
