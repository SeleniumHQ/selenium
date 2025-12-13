<!-- Guidance for AI agents working in Selenium Manager code -->

## Code location
- `rust/src` and `rust/tests`

## Common commands

## Dependency management
Keep `Cargo.Bazel.lock` synchronized with `Cargo.lock`:
- `CARGO_BAZEL_REPIN=true bazel sync --only=crates`

## Testing
See `rust/TESTING.md`
