# BUILD FILE SYNTAX: STARLARK

# Single source of truth for every @selenium/manager npm package. Kept in
# lockstep with selenium-webdriver so `@selenium/manager@<x>` always names the
# manager that shipped alongside `selenium-webdriver@<x>`; `rake node:version`
# bumps both together.
SM_VERSION = "4.50.0-nightly202609091537"
