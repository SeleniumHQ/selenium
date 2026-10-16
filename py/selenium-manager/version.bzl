# BUILD FILE SYNTAX: STARLARK

# Single source of truth for every standalone Selenium Manager Python package.
# Kept in lockstep with the `selenium` wheel so `selenium-manager==<x>` always
# names the manager that shipped alongside `selenium==<x>`; `rake py:version`
# bumps both together.
SM_VERSION = "4.50.0.202609091537"

# The meta package pins the exact build of its platform package, so the pins are
# derived from SM_VERSION here rather than restated in the BUILD file where they
# would silently drift on a bump.
#
# The architecture suffix names the binary a package carries, so it is absent
# only where there is no single architecture to name: the macOS binary is
# universal. The Windows i686 build runs on x64 and arm64 too, which is why one
# `-x86` package answers every Windows marker; a native build for either would
# arrive as its own package and narrow these markers rather than change what
# `-x86` contains.
PLATFORM_REQUIREMENTS = [
    "selenium-manager-linux-x86-64==%s; sys_platform=='linux' and platform_machine=='x86_64'" % SM_VERSION,
    "selenium-manager-linux-aarch64==%s; sys_platform=='linux' and platform_machine=='aarch64'" % SM_VERSION,
    "selenium-manager-macos==%s; sys_platform=='darwin'" % SM_VERSION,
    "selenium-manager-windows-x86==%s; sys_platform=='win32'" % SM_VERSION,
]
