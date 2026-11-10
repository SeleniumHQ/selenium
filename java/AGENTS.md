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
