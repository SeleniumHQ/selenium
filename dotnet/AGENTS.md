<!-- Guidance for AI agents working in Selenium .NET Bindings -->

## Code location
- Core: `dotnet/src/webdriver/`
- Support: `dotnet/src/support/`
- Tests: `dotnet/test/common/`

## Common commands
- Build: `bazel build //dotnet/...`

## Testing
See `dotnet/TESTING.md`

## Code conventions

### Logging
```csharp
using OpenQA.Selenium.Internal.Logging;
private static readonly ILogger _logger = Log.GetLogger<MyClass>();

_logger.Warn("actionable: something needs attention");
_logger.Info("useful: driver started successfully");
_logger.Debug("diagnostic: request details for debugging");
```

### Deprecation
```csharp
[Obsolete("Use NewMethod instead")]
public void OldMethod() { }
```
When code inside the assembly must still reference an obsolete member (e.g. a field
or method the obsolete API is built on), wrap just that usage to keep the build
warning-clean (see `UserPromptHandler.cs`):
```csharp
#pragma warning disable CS0618 // Type or member is obsolete
this.legacyThing.DoWork();
#pragma warning restore CS0618 // Type or member is obsolete
```

### Async patterns
The codebase is migrating to async

### Documentation
Use XML documentation comments for public APIs:
```csharp
/// <summary>
/// Brief description.
/// </summary>
/// <param name="name">Description.</param>
/// <returns>Description.</returns>
/// <exception cref="ExceptionType">When condition.</exception>
```
