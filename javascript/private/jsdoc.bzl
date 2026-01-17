"""Rule for running jsdoc using Bazel-managed Node.js."""

def _jsdoc_impl(ctx):
    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    if is_windows:
        script = ctx.actions.declare_file(ctx.label.name + ".bat")
        ctx.actions.write(script, _WINDOWS_TEMPLATE.format(
            config = ctx.file.config.basename,
        ), is_executable = True)
    else:
        script = ctx.actions.declare_file(ctx.label.name + ".sh")
        ctx.actions.write(script, _UNIX_TEMPLATE.format(
            config = ctx.file.config.basename,
        ), is_executable = True)

    runfiles = ctx.runfiles(files = ctx.files.data + [ctx.file.config])
    return [DefaultInfo(executable = script, runfiles = runfiles)]

_UNIX_TEMPLATE = """#!/usr/bin/env bash
set -euo pipefail
cd "$BUILD_WORKSPACE_DIRECTORY/javascript/selenium-webdriver"
exec "$BUILD_WORKSPACE_DIRECTORY/bazel-selenium/javascript/selenium-webdriver/node_modules/.bin/jsdoc" \\
    --configure {config} "$@"
"""

_WINDOWS_TEMPLATE = """@echo off
cd /d "%BUILD_WORKSPACE_DIRECTORY%\\javascript\\selenium-webdriver"
"%BUILD_WORKSPACE_DIRECTORY%\\bazel-selenium\\javascript\\selenium-webdriver\\node_modules\\.bin\\jsdoc" ^
    --configure {config} %*
"""

jsdoc = rule(
    implementation = _jsdoc_impl,
    executable = True,
    attrs = {
        "config": attr.label(
            mandatory = True,
            allow_single_file = [".json"],
        ),
        "data": attr.label_list(
            allow_files = True,
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
)
