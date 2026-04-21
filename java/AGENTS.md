<!-- Guidance for AI agents working in Selenium Java Bindings and Grid. -->

## Code location
- Java Bindings: `java/src/`, `java/test/`
- Grid Server: `java/src/org/openqa/selenium/grid/`

## Common commands
- Build: `bazel build //java/...`
- Build Grid: `bazel build grid`

## Testing
See `java/TESTING.md`

## Code conventions
### Interfaces
- New methods added to existing interfaces must provide a default implementation, if possible.
- Interfaces must not expose the native classes of their implementations.

### Logging
```java
import java.util.logging.Logger;
private static final Logger LOG = Logger.getLogger(MyClass.class.getName());

LOG.warning("actionable: something needs attention");
LOG.info("useful: server started on port 4444");
LOG.fine("diagnostic: request details for debugging");
```

### Deprecation
```java
@Deprecated(forRemoval = true)
public void legacyMethod() { }
```

### Documentation
Use Javadoc for public APIs:
```java
/**
 * Brief description.
 *
 * @param name description
 * @return description
 * @throws ExceptionType when condition
 */
```

## Formatting
Java files are formatted with **google-java-format** (Google Java Style Guide).
Run `./go format` after changes; it will auto-fix all style issues.

Key rules enforced:
- 2-space indentation (no tabs)
- Column limit: 100 characters
- Braces on the same line (K&R style), including single-statement bodies
- Imports: organized and sorted consistently
