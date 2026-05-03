<!-- Guidance for AI agents working in Selenium JavaScript Bindings -->

## Code location

- Library: `javascript/selenium-webdriver/lib/`
- Tests: `javascript/selenium-webdriver/test/`

## Common commands

- Build: `bazel build //javascript/selenium-webdriver/...`

## Testing

See `javascript/selenium-webdriver/TESTING.md`

## Code conventions

### Logging

```javascript
const logging = require('./logging')
const log_ = logging.getLogger('selenium.webdriver.mymodule')

log_.warning('actionable: something needs attention')
log_.info('useful: driver started successfully')
log_.finer('diagnostic: request details for debugging')
```

### Deprecation

Log a warning directing users to the alternative:

```javascript
log_.warning('oldMethod is deprecated, use newMethod instead')
```

### Documentation

Use JSDoc for public APIs:

```javascript
/**
 * Brief description.
 *
 * @param {Type} name description
 * @return {Type} description
 * @throws {ErrorType} when condition
 */
```

## Formatting

JavaScript files are formatted with **Prettier**.
Run `./go format` after changes; it will auto-fix all style issues.

Active Prettier config (`.prettierrc`):

- `printWidth`: **120** characters
- `singleQuote`: **true** (use `'` not `"`)
- `semi`: **false** (no semicolons)
- `trailingComma`: **"all"** (trailing commas everywhere ES5+ allows)
- `endOfLine`: **"lf"** (Unix line endings only)
