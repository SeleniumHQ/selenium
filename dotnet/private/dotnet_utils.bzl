# The change to the PATH is recommended here:
# https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual?source=recommendations#set-environment-variables-system-wide
# We list our .Net installation first because we
# want it to be picked up first

# The `MSBuildEnableWorkloadResolver` is disabled to prevent warnings
# about a missing Microsoft.NET.SDK.WorkloadAutoImportPropsLocator

def dotnet_preamble(toolchain):
    return """
export DOTNET="$(pwd)/{dotnet}"
export DOTNET_CLI_HOME="$(dirname $DOTNET)"
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_NOLOGO=1
export DOTNET_ROOT="$(dirname $DOTNET)"
export PATH=$DOTNET_ROOT:$DOTNET_ROOT/tools:$PATH
export MSBuildEnableWorkloadResolver=false
export CWD=$(pwd)

# Required to make packing work on Windows
export APPDATA="$(pwd)"
export PROGRAMFILES="$(pwd)"

# Required to make NuGet tool work on non-writable home path like GitHub actions
export XDG_DATA_HOME=$(mktemp -d)

# Create `global.json` to trick .Net into using the hermetic toolchain
# https://learn.microsoft.com/en-us/dotnet/core/tools/global-json
echo '{{"sdk": {{"version": "{version}"}} }}' >$(pwd)/global.json

""".format(
        dotnet = toolchain.runtime.files_to_run.executable.path,
        version = toolchain.dotnetinfo.sdk_version,
    )
