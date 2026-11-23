load("//:version.bzl", "VERSIONS")

SE_VERSION = VERSIONS["ruby"]

# Unstamped builds and tests see this instead, so a version bump does not invalidate them.
# selenium-devtools requires selenium-webdriver ~> 4.2, so it has to stay within that range.
UNSTAMPED_VERSION = "4.999.0.dev"
