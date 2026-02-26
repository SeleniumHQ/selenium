"""Rule for running docfx using the Bazel-managed dotnet toolchain."""

def _to_manifest_path(file):
    """Convert short_path to manifest path (external repos need 'external/' prefix)."""
    if file.short_path.startswith("../"):
        return "external/" + file.short_path[3:]
    return file.short_path

def _docfx_impl(ctx):
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]
    dotnet = toolchain.runtime.files_to_run.executable
    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    dotnet_path = _to_manifest_path(dotnet)
    docfx_path = _to_manifest_path(ctx.file.docfx_dll)
    config_path = ctx.file.docfx_json.short_path

    if is_windows:
        script = ctx.actions.declare_file(ctx.label.name + ".bat")
        ctx.actions.write(script, _WINDOWS_TEMPLATE.format(
            dotnet = dotnet_path.replace("/", "\\"),
            docfx = docfx_path.replace("/", "\\"),
            config = config_path.replace("/", "\\"),
        ), is_executable = True)
    else:
        script = ctx.actions.declare_file(ctx.label.name + ".sh")
        ctx.actions.write(script, _UNIX_TEMPLATE.format(
            dotnet = dotnet_path,
            docfx = docfx_path,
            config = config_path,
        ), is_executable = True)

    return [DefaultInfo(executable = script)]

_UNIX_TEMPLATE = """#!/usr/bin/env bash
set -euo pipefail
cd "$BUILD_WORKSPACE_DIRECTORY"
EXEC_ROOT=$(bazel info execution_root)
exec "$EXEC_ROOT/{dotnet}" exec \
     "$EXEC_ROOT/{docfx}" {config} "$@"
"""

_WINDOWS_TEMPLATE = """@echo off
setlocal
cd /d "%BUILD_WORKSPACE_DIRECTORY%"
for /f "tokens=*" %%i in ('bazel info execution_root') do set "EXEC_ROOT=%%i"
"%EXEC_ROOT%\\{dotnet}" exec ^
    "%EXEC_ROOT%\\{docfx}" {config} %*
endlocal
"""

docfx = rule(
    implementation = _docfx_impl,
    executable = True,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
    attrs = {
        "docfx_dll": attr.label(
            mandatory = True,
            allow_single_file = [".dll"],
        ),
        "docfx_json": attr.label(
            mandatory = True,
            allow_single_file = [".json"],
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
)
