"""Rule for pushing NuGet packages using the Bazel-managed dotnet toolchain."""

def _nuget_push_impl(ctx):
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]
    dotnet = toolchain.runtime.files_to_run.executable

    nupkg_files = ctx.files.packages

    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    if is_windows:
        script = _create_windows_script(ctx, dotnet, nupkg_files)
    else:
        script = _create_unix_script(ctx, dotnet, nupkg_files)

    runfiles = ctx.runfiles(files = nupkg_files + [dotnet])
    runfiles = runfiles.merge(toolchain.runtime.default_runfiles)

    return [
        DefaultInfo(
            executable = script,
            runfiles = runfiles,
        ),
    ]

def _to_runfiles_path(short_path):
    """Convert a short_path to a runfiles path.

    External repos in bzlmod have paths like ../repo_name/path,
    which in runfiles becomes repo_name/path.
    Main repo paths need _main/ prefix.
    """
    if short_path.startswith("../"):
        return short_path[3:]
    return "_main/" + short_path

def _create_unix_script(ctx, dotnet, nupkg_files):
    """Create bash script for Unix/macOS/Linux."""
    push_commands = []
    for nupkg in nupkg_files:
        if nupkg.basename.endswith(".snupkg"):
            continue
        nupkg_runfiles_path = _to_runfiles_path(nupkg.short_path)
        push_commands.append(
            '"$DOTNET" nuget push "$RUNFILES_DIR/{nupkg}" --api-key "$NUGET_API_KEY" --source "$NUGET_SOURCE" --skip-duplicate'.format(nupkg = nupkg_runfiles_path),
        )

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
{push_commands}
""".format(
        dotnet = dotnet_runfiles_path,
        push_commands = "\n".join(push_commands),
    )

    script = ctx.actions.declare_file(ctx.label.name + ".sh")
    ctx.actions.write(
        output = script,
        content = script_content,
        is_executable = True,
    )
    return script

def _create_windows_script(ctx, dotnet, nupkg_files):
    """Create batch script for Windows."""
    push_commands = []
    for nupkg in nupkg_files:
        if nupkg.basename.endswith(".snupkg"):
            continue
        nupkg_runfiles_path = _to_runfiles_path(nupkg.short_path).replace("/", "\\")
        push_commands.append(
            '"%%DOTNET%%" nuget push "%%~dp0%s" --api-key "%%NUGET_API_KEY%%" --source "%%NUGET_SOURCE%%" --skip-duplicate' % nupkg_runfiles_path,
        )
        push_commands.append("if %%ERRORLEVEL%% neq 0 exit /b %%ERRORLEVEL%%")

    dotnet_runfiles_path = _to_runfiles_path(dotnet.short_path).replace("/", "\\")

    script_content = """@echo off
set DOTNET=%~dp0{dotnet_path}
{push_commands}
""".format(
        dotnet_path = dotnet_runfiles_path,
        push_commands = "\n".join(push_commands),
    )

    script = ctx.actions.declare_file(ctx.label.name + ".bat")
    ctx.actions.write(
        output = script,
        content = script_content,
        is_executable = True,
    )
    return script

nuget_push = rule(
    implementation = _nuget_push_impl,
    attrs = {
        "packages": attr.label_list(
            doc = "The nupkg files to push",
            mandatory = True,
            allow_files = [".nupkg", ".snupkg"],
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
    executable = True,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
