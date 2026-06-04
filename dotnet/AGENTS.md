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
