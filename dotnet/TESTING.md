# .NET Testing Guide

This guide helps contributors write tests in the Selenium .NET codebase.

## Test Framework

* Tests use NUnit.
* All tests inherit from `DriverTestFixture`.
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

Tests live in `//dotnet/test/webdriver`. The suite compiles once into a single binary; Bazel then
generates a target per test class, plus a per-browser variant for each supported browser. The
bare class target runs on the default browser (Firefox, the first entry in the `browsers` list in
[`BUILD.bazel`](test/webdriver/BUILD.bazel)). Always use `--pin_browsers`.

```shell
bazel test //dotnet/test/webdriver/... --pin_browsers=true            # All tests, all browsers
bazel test //dotnet/test/webdriver:ElementFindingTests --pin_browsers=true        # One class, default browser
bazel test //dotnet/test/webdriver:ElementFindingTests-chrome --pin_browsers=true # One class on Chrome
bazel test //dotnet/test/webdriver:ElementFindingTests-edge --pin_browsers=true   # One class on Edge

# Additional Arguments
bazel test //dotnet/test/webdriver/... --flaky_test_attempts=3 --pin_browsers=true
bazel test //dotnet/test/webdriver/... --test_output=all --pin_browsers=true
```

To avoid passing `--pin_browsers=true` on every invocation, set it once in `.bazelrc.local`:

```
build --//common:pin_browsers
```

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
├── webdriver/                      # WebDriver tests
│   ├── DriverTestFixture.cs        # Base class
│   ├── *Tests.cs                   # Test files
│   └── Infrastructure/             # Custom attributes and test environment
│       ├── IgnoreBrowserAttribute.cs
│       ├── NeedsFreshDriverAttribute.cs
│       └── Environment/            # EnvironmentManager, DriverFactory
├── remote/                         # Remote/Grid tests
└── support/                        # Support library tests
```

## Build Files

* Adding tests shouldn't require Bazel changes—the suite globs `**/*.cs`.
* Make sure new `*Tests.cs` files are under `dotnet/test/webdriver`, which has the
  `dotnet_nunit_test_suite` declaration in `BUILD.bazel`.
