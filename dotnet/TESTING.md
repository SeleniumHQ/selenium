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

Bazel creates test targets for each browser. Always use `--pin_browsers`.

```shell
bazel test //dotnet/test/common:AllTests --pin_browsers=true  # Default browser (Firefox)
bazel test //dotnet/test/common:AllTests-chrome --pin_browsers=true
bazel test //dotnet/test/common:AllTests-firefox --pin_browsers=true
bazel test //dotnet/test/common:AllTests-edge --pin_browsers=true

# Additional Arguments
bazel test //dotnet/... --flaky_test_attempts=3 --pin_browsers=true
bazel test //dotnet/... --test_output=all --pin_browsers=true
```

## Attributes

### Skipping Tests

| Attribute | When to Use |
|-----------|-------------|
| `[IgnoreBrowser(Browser.X, "reason")]` | Skip test for specific browser |
| `[IgnorePlatform("windows", "reason")]` | Skip test on specific OS |
| `[IgnoreTarget("net8", "reason")]` | Skip test on specific .NET version |
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

Browser values: `Browser.Chrome`, `Browser.Firefox`, `Browser.Edge`, `Browser.Safari`, `Browser.IE`, `Browser.Remote`, `Browser.All`

### Driver Lifecycle

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
├── common/                    # Cross-browser tests
│   ├── DriverTestFixture.cs   # Base class
│   ├── CustomTestAttributes/  # Custom NUnit attributes
│   └── *Test.cs              # Test files
└── support/                   # Support library tests
```

## Build Files

* Adding tests shouldn't require Bazel changes—tests are picked up via glob.
* Make sure `*Test.cs` files are in a directory with `dotnet_nunit_test_suite` in BUILD.bazel.
