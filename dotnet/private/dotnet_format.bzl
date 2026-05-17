"""Rule for running dotnet format using the Bazel-managed dotnet toolchain."""

def _dotnet_format_impl(ctx):
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]
    dotnet = toolchain.runtime.files_to_run.executable

    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    if is_windows:
        script = _create_windows_script(ctx, dotnet)
    else:
        script = _create_unix_script(ctx, dotnet)

    runfiles = ctx.runfiles(files = [dotnet])
    runfiles = runfiles.merge(toolchain.runtime.default_runfiles)

    return [
        DefaultInfo(
            executable = script,
            runfiles = runfiles,
        ),
    ]

def _to_runfiles_path(short_path):
    """Convert a short_path to a runfiles path."""
    if short_path.startswith("../"):
        return short_path[3:]
    return "_main/" + short_path

def _create_unix_script(ctx, dotnet):
    """Create bash script for Unix/macOS/Linux."""
    dotnet_runfiles_path = _to_runfiles_path(dotnet.short_path)

    script_content = """#!/usr/bin/env bash
set -euo pipefail

# Locate runfiles directory
if [[ -d "$0.runfiles/_main" ]]; then
    RUNFILES_DIR="$0.runfiles"
elif [[ -n "${{RUNFILES_DIR:-}}" ]]; then
    RUNFILES_DIR="$RUNFILES_DIR"
else
    echo "ERROR: Could not locate runfiles directory" >&2
    exit 1
fi

DOTNET="$RUNFILES_DIR/{dotnet}"

# Find the workspace root
WORKSPACE_ROOT="${{BUILD_WORKSPACE_DIRECTORY:-$RUNFILES_DIR/_main}}"
DOTNET_DIR="$WORKSPACE_ROOT/dotnet"
SOLUTION="$DOTNET_DIR/Selenium.slnx"

cd "$DOTNET_DIR"

# Bazel-bundled SDK ref packs lack prune metadata; opt out of NETSDK1226.
export AllowMissingPrunePackageData=true

if [[ ! -f "$SOLUTION" ]]; then
    echo "ERROR: Could not find $SOLUTION" >&2
    exit 1
fi

echo "Running dotnet format $@ on Selenium.slnx..."
"$DOTNET" format "$@" "$SOLUTION" || exit 1

echo "Done."
""".format(
        dotnet = dotnet_runfiles_path,
    )

    script = ctx.actions.declare_file(ctx.label.name + ".sh")
    ctx.actions.write(
        output = script,
        content = script_content,
        is_executable = True,
    )
    return script

def _create_windows_script(ctx, dotnet):
    """Create batch script for Windows."""
    dotnet_runfiles_path = _to_runfiles_path(dotnet.short_path).replace("/", "\\")

    script_content = """@echo off
setlocal

set RUNFILES_DIR=%~dp0%~nx0.runfiles
set DOTNET=%RUNFILES_DIR%\\{dotnet_path}

if defined BUILD_WORKSPACE_DIRECTORY (
    set WORKSPACE_ROOT=%BUILD_WORKSPACE_DIRECTORY%
) else (
    set WORKSPACE_ROOT=%RUNFILES_DIR%\\_main
)
set DOTNET_DIR=%WORKSPACE_ROOT%\\dotnet
set SOLUTION=%DOTNET_DIR%\\Selenium.slnx

cd /d "%DOTNET_DIR%"

rem Bazel-bundled SDK ref packs lack prune metadata; opt out of NETSDK1226.
set AllowMissingPrunePackageData=true

if not exist "%SOLUTION%" (
    echo ERROR: Could not find %SOLUTION% 1>&2
    exit /b 1
)

echo Running dotnet format %* on Selenium.slnx...
"%DOTNET%" format %* "%SOLUTION%" || exit /b 1

echo Done.
""".format(
        dotnet_path = dotnet_runfiles_path,
    )

    script = ctx.actions.declare_file(ctx.label.name + ".bat")
    ctx.actions.write(
        output = script,
        content = script_content,
        is_executable = True,
    )
    return script

dotnet_format = rule(
    implementation = _dotnet_format_impl,
    attrs = {
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
    executable = True,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
