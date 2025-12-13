<!-- Guidance for AI agents working in Selenium Ruby Bindings -->

## Code location
- Library: `rb/lib/selenium/webdriver`
- Tests: `rb/spec/unit/selenium/webdriver` and `rb/spec/integration/selenium/webdriver` 
- Bazel will build and use the version of Ruby specified in `rb/.ruby-version`

## Common commands
- `bazel build //rb/... bazel run //:bundle -- update`

## Dependency management
- Dependencies must be updated in `rb/selenium-webdriver.gemspec`
- Then run `bazel build @bundle//:bundle`

## Testing
See `rb/TESTING.md`
