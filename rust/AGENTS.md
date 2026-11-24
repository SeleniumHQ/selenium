<!-- Guidance for AI agents working in Selenium Manager code -->

## Code location
- Source: `rust/src/`
- Tests: `rust/tests/`

## Common commands
- Build: `bazel build //rust/...`

## Testing
See `rust/TESTING.md`

## Code conventions

### Logging
```rust
use log::{warn, info, debug};

warn!("actionable: something needs attention");
info!("useful: browser resolved successfully");
debug!("diagnostic: request details for debugging");
```

### Deprecation
Selenium Manager ships as a binary and its crate is not published, so Rust `pub` items are internal and can change without a deprecation.
Its public interface is the CLI arguments, configuration, and JSON output; keep those compatible and log a warning that points to the replacement before removing one.

### Documentation
Use doc comments for public APIs:
```rust
/// Brief description.
///
/// # Arguments
/// * `name` - description
///
/// # Returns
/// Description of return value.
///
/// # Errors
/// Returns `ErrorType` when condition.
```
