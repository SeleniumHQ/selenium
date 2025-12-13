<!-- Guidance for AI agents working in Selenium Java Bindings and Grid. -->

## Code location
- Java Bindings: `java/src/`, `java/test/`
- Grid Server: `java/src/org/openqa/selenium/grid/`, `java/test/org/openqa/selenium/grid`

## Common commands
- Build: `bazel build //java/...`

## Dependency management
- Dependencies live in `MODULE.bazel`; after edits:
  - `RULES_JVM_EXTERNAL_REPIN=1 bazel run @maven//:pin`

## Testing
See `java/TESTING.md`.
