<!-- Guidance for AI agents working in Selenium Python Bindings -->

## Code location
- Package: `py/selenium/`
- Remote/transport: `py/selenium/webdriver/remote/`

## Common commands
- Build: `bazel build //py/...`

## Testing
See `py/TESTING.md`

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
