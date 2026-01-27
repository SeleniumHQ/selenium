"""Rule for running paket commands using the Bazel-managed dotnet toolchain."""

def _paket_deps_impl(ctx):
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
    mode = ctx.attr.mode

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

# Find the workspace root (where dotnet/.config/dotnet-tools.json lives)
WORKSPACE_ROOT="${{BUILD_WORKSPACE_DIRECTORY:-$RUNFILES_DIR/_main}}"
DOTNET_DIR="$WORKSPACE_ROOT/dotnet"

if [[ ! -f "$DOTNET_DIR/.config/dotnet-tools.json" ]]; then
    echo "ERROR: Could not find dotnet/.config/dotnet-tools.json" >&2
    echo "Make sure you're running from the workspace root" >&2
    exit 1
fi

cd "$DOTNET_DIR"

echo "Restoring dotnet tools..."
"$DOTNET" tool restore

echo "Running paket {mode}..."
"$DOTNET" tool run paket {mode}

echo "Done. Now run: bazel run @rules_dotnet//tools/paket2bazel:paket2bazel -- --dependencies-file $(pwd)/paket.dependencies --output-folder $(pwd)"
""".format(
        dotnet = dotnet_runfiles_path,
        mode = mode,
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
    mode = ctx.attr.mode

    script_content = """@echo off
setlocal

set RUNFILES_DIR=%~dp0%~n0.runfiles
set DOTNET=%RUNFILES_DIR%\\{dotnet_path}

if defined BUILD_WORKSPACE_DIRECTORY (
    set WORKSPACE_ROOT=%BUILD_WORKSPACE_DIRECTORY%
) else (
    set WORKSPACE_ROOT=%RUNFILES_DIR%\\_main
)
set DOTNET_DIR=%WORKSPACE_ROOT%\\dotnet

if not exist "%DOTNET_DIR%\\.config\\dotnet-tools.json" (
    echo ERROR: Could not find dotnet\\.config\\dotnet-tools.json >&2
    exit /b 1
)

cd /d "%DOTNET_DIR%"

echo Restoring dotnet tools...
"%DOTNET%" tool restore
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Running paket {mode}...
"%DOTNET%" tool run paket {mode}
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Done. Now run: bazel run @rules_dotnet//tools/paket2bazel:paket2bazel -- --dependencies-file %cd%\\paket.dependencies --output-folder %cd%
""".format(
        dotnet_path = dotnet_runfiles_path,
        mode = mode,
    )

    script = ctx.actions.declare_file(ctx.label.name + ".bat")
    ctx.actions.write(
        output = script,
        content = script_content,
        is_executable = True,
    )
    return script

paket_deps = rule(
    implementation = _paket_deps_impl,
    attrs = {
        "mode": attr.string(
            doc = "Paket command to run: 'update' for latest versions, 'install' to sync lockfile",
            mandatory = True,
            values = ["update", "install"],
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
    executable = True,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
