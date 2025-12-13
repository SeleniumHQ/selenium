<!-- Guidance for AI agents working in Selenium Python Bindings -->

## Code location
- Package: `py/selenium/`
- Remote/transport: `py/selenium/webdriver/remote/`

## Common commands
- Build: `bazel build //py/...`

## Dependency management
- Dev dependencies must be updated in `py/requirements.txt` and then run `scripts/update_py_dependencies.sh`
- Package dependencies must be updated in `py/pyproject.toml` and `py/BUILD.bazel`

## Testing
See `py/TESTING.md`
