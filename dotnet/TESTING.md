# .NET Testing Guide

This guide helps contributors write tests in the Selenium .NET codebase.

## Test Framework

* Tests use NUnit.
* Browser-backed WebDriver tests inherit from `DriverTestFixture`; unit tests do not.
* Browser test pages are accessed through `Urls`, for example `Urls.SimpleTestPage` and `Urls.JavascriptPage`.
* `WaitFor<T>()` provides waiting with a 5-second default timeout.

```csharp
[TestFixture]
public class MyFeatureTests : DriverTestFixture
{
    [Test]
    public void ShouldFindElement()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement element = Driver.FindElement(By.Id("foo"));
        Assert.That(element.Text, Is.EqualTo("expected"));
    }

    [Test]
    [IgnoreBrowser(Browser.Safari, "Safari doesn't support this")]
    public void ShouldDoSomething()
    {
        // Skipped on Safari
    }
}
```

## Running Tests

### Unit Tests

In-process unit tests are organized under `dotnet/test/unit`; WebDriver unit tests live in `dotnet/test/unit/webdriver` in the `Selenium.WebDriver.UnitTests` project. Keep these tests isolated from browser launches, real filesystem and network access, and child processes; use in-process fakes for dependencies when needed, such as the BiDi `FakeTransport`. This project has no browser setup fixture, test web server, or browser configuration.

```shell
bazel test //dotnet/test/unit/...                       # All unit tests, no browser variants
bazel test //dotnet/test/unit/webdriver/...            # WebDriver unit tests
bazel test //dotnet/test/unit/webdriver:BiDi/SessionUnitTests # One fixture
bazel test //dotnet/test/unit/... --test_output=all --cache_test_results=no
```

Unit targets are tagged `unit` and sized `small`. CI runs them in a separate job with one test attempt. Preserve fixture-specific isolation attributes: telemetry tests that register process-wide activity listeners must remain nonparallel.

### Browser Tests

WebDriver browser tests live in `//dotnet/test/webdriver`. The suite compiles once into a single binary; Bazel then generates targets for test fixtures, with browser-specific variants for the generated browser targets. Name fixture files `*Tests.cs` to follow the project convention. The bare fixture target runs on the default browser (Firefox, the first entry in the `browsers` list in [`BUILD.bazel`](test/webdriver/BUILD.bazel)).

```shell
bazel test //dotnet/test/webdriver/...                        # All generated tests and browser variants
bazel test //dotnet/test/webdriver:ElementFindingTests        # One class, default browser
bazel test //dotnet/test/webdriver:ElementFindingTests-chrome # One class on Chrome
bazel test //dotnet/test/webdriver:ElementFindingTests-edge   # One class on Edge

# Additional Arguments
bazel test //dotnet/test/webdriver/... --flaky_test_attempts=3
bazel test //dotnet/test/webdriver/... --test_output=all
```

By default on Linux and macOS, Bazel uses pinned versions of the browser and driver, so tests do not depend on what the machine has installed. To have Selenium Manager handle browser and driver discovery instead, pass `--pin_browsers=false`. Selenium Manager uses an installed browser or a driver on `PATH` if present; to force a browser download and ignore drivers on `PATH`, pass `--test_env=SE_FORCE_BROWSER_DOWNLOAD=true --test_env=SE_SKIP_DRIVER_IN_PATH=true`.

Our CI runs the x64 Linux targets on Remote Build Execution (RBE), which only has network access for the Rust and Selenium Manager tests. We use GitHub Actions runners for checks that RBE cannot cover, such as OS-specific behavior and Selenium Manager on other platforms.

### Running Tests in an IDE

Bazel is the source of truth for CI and release verification, but for day-to-day development you can open `Selenium.slnx` in [Rider](https://www.jetbrains.com/rider/) or [Visual Studio](https://visualstudio.microsoft.com/) and run tests through the IDE's NUnit runner. IDE test runs can differ from Bazel in build configuration, browser selection, and environment, so use the Bazel commands above to verify changes against CI.

## Skipping Tests

Skips use NUnit attributes. Browser values are `Browser.Chrome`, `Browser.Firefox`, `Browser.Edge`, `Browser.Safari`, `Browser.IE`, `Browser.Remote`, and `Browser.All`.

| Attribute | When to Use |
|-----------|-------------|
| `[IgnoreBrowser(Browser.X, "reason")]` | Skip test for specific browser |
| `[IgnorePlatform("windows", "reason")]` | Skip test on specific OS |
| `[IgnoreTarget("net10", "reason")]` | Skip test on the .NET 10 target framework |
| `[Ignore("reason")]` | Skip test entirely (NUnit built-in) |

```csharp
[Test]
[IgnoreBrowser(Browser.Safari, "Safari doesn't support multiple instances")]
[IgnoreBrowser(Browser.IE, "IE is flaky")]
public void TestWithMultipleDrivers()
{
}

[Test]
[IgnorePlatform("windows", "Thread time not supported")]
public void TestNotOnWindows()
{
}
```

## Driver Lifecycle

| Attribute | When to Use |
|-----------|-------------|
| `[NeedsFreshDriver(IsCreatedBeforeTest = true)]` | Close and replace the fixture driver before the test |
| `[NeedsFreshDriver(IsCreatedAfterTest = true)]` | Close and replace the fixture driver after the test |

```csharp
[Test]
[NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
[IgnoreBrowser(Browser.Safari, "Safari doesn't support multiple instances")]
public void TestRequiringFreshDriver()
{
    IWebDriver driver2 = CreateDriverInstance();
    try
    {
        // Test with multiple drivers
    }
    finally
    {
        driver2.Quit();
    }
}
```

## Helpers

From `DriverTestFixture`:

| Member | Description |
|--------|-------------|
| `Driver` | Current WebDriver instance |
| `Urls` | Test page URLs, such as `Urls.SimpleTestPage` and `Urls.JavascriptPage` |
| `WaitFor<T>(condition, timeoutMessage)` | Wait for a condition (default timeout: 5 seconds) |
| `CreateDriverInstance(options)` | Create an additional driver instance |
| `CreateFreshDriver()` | Replace the fixture's current driver |

From `EnvironmentManager.Instance`:

| Member | Description |
|--------|-------------|
| `Browser` | Current browser enum value |

## Test Organization

```
dotnet/test/
├── unit/                           # In-process unit projects grouped by production library
│   └── webdriver/                  # WebDriver unit project; no browser/server infrastructure
│       └── BiDi/                   # BiDi unit tests and fake transport
├── testing.nunit/                  # Shared browser-test NUnit infrastructure
│   ├── DriverTestFixture.cs        # Base class
│   ├── AssemblyFixtureBase.cs      # Base for each project's [SetUpFixture]
│   ├── appconfig.json              # Driver configurations
│   ├── IgnoreBrowserAttribute.cs
│   ├── NeedsFreshDriverAttribute.cs
│   └── Environment/                # EnvironmentManager, DriverConfig, DriverFactory
├── testing.webserver/              # Web server hosting test pages
├── webdriver/                      # WebDriver tests
│   └── *Tests.cs                   # Test fixture files
├── remote/                         # Remote/Grid tests
└── support/                        # Support library tests
```

## Build Files

* Adding a test source to an existing suite usually does not require a Bazel change because each suite globs `**/*.cs` and generates per-fixture targets; name fixture files `*Tests.cs` to follow the project convention.
* Put WebDriver in-process unit tests in `dotnet/test/unit/webdriver` and browser-backed WebDriver tests in `dotnet/test/webdriver`. Both have a `dotnet_nunit_test_suite` declaration in `BUILD.bazel`. Add future unit projects under `dotnet/test/unit/<library>` with their own project and build files to keep source discovery and dependencies separate.
