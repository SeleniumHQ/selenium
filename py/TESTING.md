# Python Testing Guide

This guide helps contributors write tests in the Selenium Python codebase.

## Test Framework

* Tests use [pytest](https://pytest.org).
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

# A single test file with Chrome:
bazel test //py:common-chrome-test/selenium/webdriver/common/alerts_tests.py

# With BiDi protocol
bazel test //py:common-chrome-bidi

# Test filters
bazel test //py/... --test_tag_filters=chrome

# Additional arguments
bazel test //py/... --flaky_test_attempts=3
bazel test //py/... --test_output=all
bazel test //py/... --test_output=streamed  # Live output for debugging
bazel test //py:test-chrome --headless

# Run a specific test in a test file
bazel test //py:common-chrome-bidi-test/selenium/webdriver/common/bidi_browsing_context_tests.py \
  --test_arg=-k \
  --test_arg=test_get_tree_with_child \

# View all targets
bazel query //py/...
```

## Running Tests Without Bazel (using pytest)

You can run tests directly with pytest after setting up the development environment.

### Setup

First, install the required dependencies:

```shell
pip install -r py/requirements_lock.txt
```

Then build the generated files and copy them into your local source tree:

```shell
./go py:local_dev
```

### Running with pytest

```shell
# Run all tests in a directory
pytest py/test/selenium/webdriver/chrome/ --driver chrome

# Run a specific test file
pytest py/test/selenium/webdriver/common/window_tests.py

# Run a specific test function
pytest py/test/selenium/webdriver/common/window_tests.py::test_should_get_the_size_of_the_current_window

# With pytest options
pytest py/test/selenium/webdriver/chrome/ --driver chrome --headless -v
```
> **Note:**
> For running BiDi tests, use the `--bidi` flag.

## Skipping Tests

Skips use pytest markers; each accepts optional `reason` and `run` parameters
(`run=False` skips the test entirely instead of expecting a failure).

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

## Driver Lifecycle

| Marker | When to Use |
|--------|-------------|
| `@pytest.mark.no_driver_after_test` | Teardown driver after test |
| `@pytest.mark.needs_fresh_driver` | Restart driver for test isolation |

## Fixtures

We make use of
[pytest fixtures](https://docs.pytest.org/en/stable/reference/fixtures.html)
to simplify test setup/teardown. There are several
[built-in pytest fixtures](https://docs.pytest.org/en/stable/reference/fixtures.html),
and many of our own internal fixtures. If a fixture is specific to a module, you will
find it defined within the test file that uses it. If it is shared among several
modules, you will find the main fixtures in `conftest.py`:

| Fixture | Description |
|---------|-------------|
| `driver` | WebDriver instance, auto-parametrized by browser |
| `pages` | Load test pages: `pages.load("page.html")` or `pages.url("page.html")` |
| `webserver` | Test HTTP server reference |
| `clean_driver` | Fresh driver without parametrization |
| `clean_options` | Fresh browser options instance |

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
