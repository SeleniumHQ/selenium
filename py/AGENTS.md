<!-- Guidance for AI agents working in Selenium Python Bindings -->

## Code location

- Package: `py/selenium/`
- Remote/transport: `py/selenium/webdriver/remote/`

## Common commands

- Build: `bazel build //py/...`

## Testing

Run tests via `bazel test //py/...`. See `/AGENTS.md` for toolchain details.

## Testing

Run tests via `bazel test //py:test-{browser}` or `bazel test //py:test-{browser}-bidi`, where `{browser}` is the target browser (e.g., `chrome`, `firefox`, `edge`). See `/AGENTS.md` for toolchain details.

## Code conventions

### Logging

```python
logger = logging.getLogger(__name__)

logger.warning("actionable: something needs attention")
logger.info("useful: driver started successfully")
logger.debug("diagnostic: request payload for debugging")
```

### Deprecation

```python
warnings.warn(
    "old_method is deprecated, use new_method instead",
    DeprecationWarning,
    stacklevel=2
)
```

### Type hints

Type hints are used throughout; add type annotations to new code

Use union notation (`|`) instead of `Optional`:

```python
# Preferred
def method(param: str | None) -> int | None:
    pass

# Avoid
from typing import Optional
def method(param: Optional[str]) -> Optional[int]:
    pass
```

### Python version

Code must work with Python 3.10 or later. Use modern syntax features available in 3.10+.

See the **Type hints** section for guidance on preferred type annotation syntax (including unions).

For testing: use `bazel test //py/...` which employs a hermetic Python 3.10+ toolchain (see `/AGENTS.md`).

For ad-hoc scripts, check your Python version locally before running:

```bash
python --version
# Ensure you have 3.10+; on macOS/Linux use python3.10+ or on Windows py -3.10
```

### Documentation

Use Google-style docstrings:

```python
def method(param: str) -> bool:
    """Brief description.

    Args:
        param: Description of param.

    Returns:
        Description of return value.

    Raises:
        ValueError: When condition.
    """
```
