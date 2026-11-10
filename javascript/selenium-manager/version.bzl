# BUILD FILE SYNTAX: STARLARK

load("//:version.bzl", "VERSIONS")

# Every @selenium/manager npm package takes selenium-webdriver's version, so
# `@selenium/manager@<x>` always names the manager that shipped alongside
# `selenium-webdriver@<x>`.
SM_VERSION = VERSIONS["javascript"]
