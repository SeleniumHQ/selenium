# Binding versions, spelled the way each ecosystem publishes them.
# Edit with `./go <lang>:version <X.Y.Z|nightly>` or `./go all:version ...`.
# Nothing under test reads this file, so a version bump leaves cached test results valid.
VERSIONS = {
    "dotnet": "4.53.0-nightly",
    "java": "4.53.0-SNAPSHOT",
    "javascript": "4.53.0-nightly",
    "python": "4.53.0.dev0",
    "ruby": "4.53.0.nightly",
}
