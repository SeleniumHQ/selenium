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
def method(param: Optional[str]) -> Optional[int]:
    pass
```

### Python version

Code must work with Python 3.10 or later. Use modern syntax features available in 3.10+:

- Use `|` for union types instead of `Union[]`
- Use `X | None` instead of `Optional[X]`

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

## Formatting

Python files are formatted with **ruff format** and checked with **ruff check**.
Run `./go format` after changes; it will auto-fix formatting. Then check `git diff` to see what changed.
Run `./go lint` to also run linting (stricter).

Key rules enforced (from `py/pyproject.toml`):
- Line length: **120 characters**
- Target version: Python 3.10+
- Ruff lint rules active: `D, E, F, I, PT, UP, RUF, TID252`
  - `I` = import ordering (imports must be sorted; `isort`-compatible)
  - `UP` = use modern Python idioms (e.g. `X | None` instead of `Optional[X]`)
  - `E/F` = pycodestyle / pyflakes errors (unused imports, undefined names, etc.)
