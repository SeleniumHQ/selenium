# Java Testing Guide

This guide helps contributors write tests in the Selenium Java codebase.

## Test Framework

* Browser tests use JUnit 5 (Jupiter) and extend `JupiterTestBase`.
* Test HTML pages live in `common/src/web/`.
* `pages` field gets URLs from `java/test/org/openqa/selenium/testing/Pages.java`.
* There are 2 pre-configured wait methods for 5 seconds and 10 seconds.
* Assertions use the AssertJ library.

```java
class MyFeatureTest extends JupiterTestBase {
    @Test
    void testBasicFunctionality() {
        driver.get(pages.xhtmlTestPage);

        wait.until(ExpectedConditions.titleIs("XHTML Test Page"));  // 10s timeout
        shortWait.until(ExpectedConditions.elementToBeClickable(element));  // 5s timeout

        assertThat(driver.getTitle()).isEqualTo("XHTML Test Page");
    }

    @Test
    void testWithLocalDriver() {
        localDriver = new WebDriverBuilder().get();  // uses the browser under test
        localDriver.get(pages.xhtmlTestPage);
        wait(localDriver).until(ExpectedConditions.titleIs("XHTML Test Page"));  // creates 10s wait
    }
}
```

## Running Tests

Bazel creates separate test targets for browsers and remote grid depending on 
what is supported in the `BUILD.bazel` file in that test's directory.
Tests run in parallel by default.

```shell
bazel test //java/...  # Run all Java tests
bazel test //java/test/org/openqa/selenium/bidi/... # Run all tests in bidi directory
bazel test //java/test/org/openqa/selenium/chrome:ChromeDriverFunctionalTest # Run a specific test

# Test Filters
bazel test //java/... --test_size_filters=small   # unit tests only (no browser)
bazel test //java/... --test_size_filters=large   # all browser tests
bazel test //java/... --test_tag_filters=chrome   # chrome tests only
bazel test //java/... --test_tag_filters=remote-browser  # all browser tests that run on grid
bazel test //java/... --test_tag_filters=-safari  # no safari tests (use `-` to exclude a tag)

# Additional Arguments
bazel test //java/... --pin_browsers  # Use pinned browser versions (recommended)
bazel test //java/... --flaky_test_attempts=3 # Rerun failed tests up to 3 times
bazel test //java/... --test_output=all # displays all test output at end of run
bazel test //java/... --test_output=streamed # displays test output in real time (disables parallel execution)
```

## Skipping Tests

Skips use JUnit annotations that accept `value` (browser) and `reason`, one browser per line.
Browser values: `CHROME`, `EDGE`, `FIREFOX`, `SAFARI`, `IE`, `ALL` (default `ALL`).

| Annotation | When to Use                                                                                                                                   |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `@Ignore` | Test doesn't work for a browser. Also accepts `issue` (GitHub issue, e.g. `"#1234"`) and `gitHubActions` (only skip on CI).                   |
| `@NotYetImplemented` | Feature isn't implemented yet. Test always runs and passes if it fails, and fails if it unexpectedly passes so the annotation can be removed. |

## Driver Lifecycle

The shared `driver` is reused across tests for efficiency. These annotations control that behavior. They accept `value` (browser) and `reason`.

| Annotation | When to Use                                                                                                                                              |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@NeedsFreshDriver` | Test needs clean browser state with default capabilities. Driver is restarted before the test.                                                           |
| `@NoDriverBeforeTest` | Test needs custom capabilities or tests driver creation itself. Driver is destroyed, must use `createNewDriver(capabilities)` in the test to create one. |
| `@NoDriverAfterTest` | Test leaves browser in a bad state. Driver is restarted after the test. Also accepts `failedOnly`.                                                       |

For tests needing two browsers simultaneously (e.g., multi-user scenarios), create a second instance with `localDriver = new WebDriverBuilder().get()`. Assigning it to the `localDriver` field means it is automatically quit after the test.

Use `WebDriverBuilder` (or `createNewDriver(capabilities)`) rather than instantiating a concrete driver like `new ChromeDriver()` directly: the builder honors the browser the test target is running against, whereas hard-coding a driver always starts that specific browser and conflicts with the current Bazel target.

If `createNewDriver(capabilities)` is called without an annotation, it closes the current driver and creates a new one.

## Other Annotations

| Annotation | When to Use |
|------------|-------------|
| `@SwitchToTopAfterTest` | Test navigates into frames. Automatically switches to default content after. |
| `@NeedsSecureServer` | Class-level. All tests in the class need HTTPS. |

## Build Files

* Adding tests shouldn't require changes in Bazel files since most are picked up automatically. 
* Make sure the `*Test.java` file is in a directory that has a `BUILD.bazel` file with a `java_selenium_test_suite` declaration.
