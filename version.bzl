# Binding versions, spelled the way each ecosystem publishes them.
# Edit with `./go <lang>:version <X.Y.Z|nightly>` or `./go all:version ...`.
# Nothing under test reads this file, so a version bump leaves cached test results valid.
VERSIONS = {
    "dotnet": "4.52.0-nightly",
    "java": "4.52.0-SNAPSHOT",
}
