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

Use union notation (`|`) instead of `Optional`:
```python
# Preferred
def method(param: str | None) -> int | None:
    pass

# Avoid
def method(param: Optional[str]) -> Optional[int]:
    pass
```

### Python version
Code must work with Python 3.10 or later. Use modern syntax features available in 3.10+.

See the **Type hints** section for guidance on preferred type annotation syntax (including unions).
When running tests or code in the terminal, explicitly use `python3.10` or later:
```bash
# Use explicitly
python3.10 -c "..."
python3.11 -c "..."

# Avoid relying on `python3` as it may be 3.9 or earlier
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
