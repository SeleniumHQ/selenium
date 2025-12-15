# Python Testing Guide

This guide helps contributors write tests in the Selenium Python codebase.

## Test Framework

* Tests use pytest.
* Test HTML pages live in `common/src/web/`.
* `pages` fixture loads test pages via `pages.load("pageName.html")`.
* Assertions use standard pytest `assert` statements.

```python
def test_element_is_displayed(driver, pages):
    pages.load("javascriptPage.html")

    element = driver.find_element(By.ID, "displayed")
    assert element.is_displayed() is True

@pytest.mark.xfail_safari(reason="Safari doesn't support this")
def test_something_safari_fails(driver, pages):
    # Expected to fail on Safari
    pass
```

## Running Tests

Bazel creates test targets for each browser. Tests run in parallel by default.

```shell
bazel test //py/...  # All tests
bazel test //py:unit  # Unit tests (no browser)
bazel test //py:test-chrome  # Chrome browser tests
bazel test //py:test-firefox  # Firefox browser tests
bazel test //py:common-chrome  # Common tests with Chrome

# With BiDi protocol
bazel test //py:common-chrome-bidi

# Test Filters
bazel test //py:... --test_tag_filters=chrome

# Additional Arguments
bazel test //py:... --flaky_test_attempts=3
bazel test //py:... --test_output=all
bazel test //py:... --test_output=streamed
```

## Fixtures

The main fixtures from `conftest.py`:

| Fixture | Description |
|---------|-------------|
| `driver` | WebDriver instance, auto-parametrized by browser |
| `pages` | Load test pages: `pages.load("page.html")` or `pages.url("page.html")` |
| `webserver` | Test HTTP server reference |
| `clean_driver` | Fresh driver without parametrization |
| `clean_options` | Fresh browser options instance |

## Markers

Browser-specific expected failures. Each accepts optional `reason` and `run` parameters.

| Marker | When to Use |
|--------|-------------|
| `@pytest.mark.xfail_chrome` | Test expected to fail on Chrome |
| `@pytest.mark.xfail_firefox` | Test expected to fail on Firefox |
| `@pytest.mark.xfail_safari` | Test expected to fail on Safari |
| `@pytest.mark.xfail_edge` | Test expected to fail on Edge |
| `@pytest.mark.xfail_ie` | Test expected to fail on IE |
| `@pytest.mark.xfail_remote` | Test expected to fail with Remote WebDriver |

```python
@pytest.mark.xfail_chrome(reason="Not implemented yet")
@pytest.mark.xfail_firefox(reason="https://bugzilla.mozilla.org/123")
def test_something(driver, pages):
    pass

@pytest.mark.xfail_safari(run=False)  # Skip entirely instead of xfail
def test_skip_safari(driver, pages):
    pass
```

### Driver Lifecycle

| Marker | When to Use |
|--------|-------------|
| `@pytest.mark.no_driver_after_test` | Teardown driver after test |
| `@pytest.mark.needs_fresh_driver` | Restart driver for test isolation |

## Test Organization

```
py/test/
├── unit/                    # Unit tests (no browser)
│   └── selenium/webdriver/
└── selenium/webdriver/      # Integration tests
    ├── common/              # Cross-browser tests
    ├── chrome/
    ├── firefox/
    ├── safari/
    └── remote/
```

Test files end in `_tests.py` (e.g., `visibility_tests.py`).

## Build Files

* Adding tests shouldn't require Bazel changes—files matching `*_tests.py` are picked up automatically.
* Make sure the test file is in a directory covered by existing `py_test_suite` targets.
