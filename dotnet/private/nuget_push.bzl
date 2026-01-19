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

    runfiles = ctx.runfiles(files = nupkg_files).merge(toolchain.runtime.default_runfiles)

    return [
        DefaultInfo(
            executable = script,
            runfiles = runfiles,
        ),
    ]

def _create_unix_script(ctx, dotnet, nupkg_files):
    """Create bash script for Unix/macOS/Linux."""
    push_commands = []
    for nupkg in nupkg_files:
        push_commands.append(
            '"$DOTNET" nuget push "%s" --api-key "$NUGET_API_KEY" --source "$NUGET_SOURCE"' % nupkg.short_path,
        )

    script_content = """#!/usr/bin/env bash
set -euo pipefail
DOTNET="$(cd "$(dirname "$0")" && pwd)/{dotnet}"
{push_commands}
""".format(
        dotnet = dotnet.short_path,
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
        nupkg_path = nupkg.short_path.replace("/", "\\")
        push_commands.append(
            '"%%DOTNET%%" nuget push "%s" --api-key "%%NUGET_API_KEY%%" --source "%%NUGET_SOURCE%%"' % nupkg_path,
        )
        push_commands.append("if %%ERRORLEVEL%% neq 0 exit /b %%ERRORLEVEL%%")

    dotnet_path = dotnet.short_path.replace("/", "\\")

    script_content = """@echo off
set DOTNET=%~dp0{dotnet_path}
{push_commands}
""".format(
        dotnet_path = dotnet_path,
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
            allow_files = [".nupkg"],
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
    executable = True,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
)
