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
```rust
#[deprecated(since = "0.1.0", note = "Use new_function instead")]
pub fn old_function() { }
```

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
