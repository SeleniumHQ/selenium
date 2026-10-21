# .NET Testing Guide

This guide helps contributors write tests in the Selenium .NET codebase.

## Test Framework

* Tests use NUnit.
* Browser-backed WebDriver tests inherit from `DriverTestFixture`; unit tests do not.
* Test HTML pages accessed via properties like `simpleTestPage`, `javascriptPage`.
* `WaitFor<T>()` provides waiting with 5-second default timeout.

```csharp
[TestFixture]
public class MyFeatureTest : DriverTestFixture
{
    [Test]
    public void ShouldFindElement()
    {
        driver.Url = simpleTestPage;
        IWebElement element = driver.FindElement(By.Id("foo"));
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

In-process unit tests are grouped by production library under `dotnet/test/unit`.
WebDriver unit tests live in `dotnet/test/unit/webdriver` in the `Selenium.WebDriver.UnitTests` project.
They must not start browsers, access the real filesystem or network, or launch child processes.
Use an in-process fake where a dependency is needed, such as the BiDi `FakeTransport`.
The project has no browser setup fixture, test web server, or browser configuration.
Existing browser-free tests outside this project have not all been migrated.

```shell
bazel test //dotnet/test/unit/...                       # All unit tests, no browser variants
bazel test //dotnet/test/unit/webdriver/...            # WebDriver unit tests
bazel test //dotnet/test/unit/webdriver:BiDi/SessionUnitTests # One fixture
bazel test //dotnet/test/unit/... --test_output=all --cache_test_results=no
```

Unit targets are tagged `unit` and sized `small`. CI runs them separately from browser tests,
without flaky-test retries. Preserve fixture-specific isolation attributes: telemetry tests
that register process-wide activity listeners must remain nonparallel.

### Browser Tests

WebDriver browser tests live in `//dotnet/test/webdriver`. The suite compiles once into a single binary; Bazel then
generates a target per test class, plus a per-browser variant for each supported browser. The
bare class target runs on the default browser (Firefox, the first entry in the `browsers` list in
[`BUILD.bazel`](test/webdriver/BUILD.bazel)).

```shell
bazel test //dotnet/test/webdriver/...                        # All tests, all browsers
bazel test //dotnet/test/webdriver:ElementFindingTests        # One class, default browser
bazel test //dotnet/test/webdriver:ElementFindingTests-chrome # One class on Chrome
bazel test //dotnet/test/webdriver:ElementFindingTests-edge   # One class on Edge

# Additional Arguments
bazel test //dotnet/test/webdriver/... --flaky_test_attempts=3
bazel test //dotnet/test/webdriver/... --test_output=all
```

By default on Linux and macOS, Bazel uses pinned versions of the browser and driver, so tests do not
depend on what the machine has installed. To have Selenium Manager handle this instead, pass
`--pin_browsers=false`. Selenium Manager uses an installed browser or a driver on `PATH` if present;
to ensure the latest stable version, pass
`--test_env=SE_FORCE_BROWSER_DOWNLOAD=true --test_env=SE_SKIP_DRIVER_IN_PATH=true`.

Our CI runs the x64 Linux targets on Remote Build Execution (RBE), which only has network access for
the Rust and Selenium Manager tests. We use GitHub Actions runners only for what the RBE results
cannot tell us, such as OS-specific behavior and Selenium Manager on other platforms.

### Running Tests in an IDE

Bazel is the source of truth for CI and release verification, but for day-to-day inner-loop
development you can open `dotnet/Selenium.slnx` in [Rider](https://www.jetbrains.com/rider/) or
[Visual Studio](https://visualstudio.microsoft.com/) and run tests through the built-in NUnit
runner. This gives the same results as Bazel, modulo any build differences between `bazel build`
and `dotnet build`, so it is worth confirming a change with `bazel test` before pushing.

## Skipping Tests

Skips use NUnit attributes. Browser values: `Browser.Chrome`, `Browser.Firefox`, `Browser.Edge`, `Browser.Safari`, `Browser.IE`, `Browser.Remote`, `Browser.All`.

| Attribute | When to Use |
|-----------|-------------|
| `[IgnoreBrowser(Browser.X, "reason")]` | Skip test for specific browser |
| `[IgnorePlatform("windows", "reason")]` | Skip test on specific OS |
| `[IgnoreTarget("net48", "reason")]` | Skip test on a specific .NET target framework |
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
public void TestLinuxOnly()
{
}
```

## Driver Lifecycle

| Attribute | When to Use |
|-----------|-------------|
| `[NeedsFreshDriver(IsCreatedBeforeTest = true)]` | Fresh driver before test |
| `[NeedsFreshDriver(IsCreatedAfterTest = true)]` | Fresh driver after test |

```csharp
[Test]
[NeedsFreshDriver(IsCreatedBeforeTest = true, IsCreatedAfterTest = true)]
[IgnoreBrowser(Browser.Safari, "Safari doesn't support multiple instances")]
public void TestRequiringFreshDriver()
{
    IWebDriver driver2 = EnvironmentManager.Instance.CreateDriverInstance();
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
| `driver` | Current WebDriver instance |
| `simpleTestPage`, `javascriptPage`, etc. | Test page URLs |
| `WaitFor<T>(condition, timeout)` | Wait for condition (default 5s) |
| `CreateFreshDriver()` | Create new driver instance |

From `EnvironmentManager.Instance`:

| Member | Description |
|--------|-------------|
| `CreateDriverInstance()` | Create additional driver |
| `CreateDriverInstance(options)` | Create driver with custom options |
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
│   ├── DriverConfigs/              # Browser-specific driver types
│   └── Environment/                # EnvironmentManager, DriverFactory
├── testing.webserver/              # Web server hosting test pages
├── webdriver/                      # WebDriver tests
│   └── *Tests.cs                   # Test files
├── remote/                         # Remote/Grid tests
└── support/                        # Support library tests
```

## Build Files

* Adding tests shouldn't require Bazel changes—the suite globs `**/*.cs`.
* Put WebDriver in-process unit tests in `dotnet/test/unit/webdriver` and browser-backed
  WebDriver tests in `dotnet/test/webdriver`. Both have a `dotnet_nunit_test_suite`
  declaration in `BUILD.bazel`. Add future unit projects under `dotnet/test/unit/<library>`
  with their own project and build files to keep source discovery and dependencies separate.
* Name fixture files `*Tests.cs` so Bazel generates per-fixture targets. Each migrated fixture
  must be compiled by only one test project; move sources rather than linking duplicate copies.
