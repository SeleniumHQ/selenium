"""Rule for running jsdoc using Bazel-managed Node.js.

This rule creates a wrapper script that:
1. Runs jsdoc from the bazel-managed npm package
2. Outputs to the workspace build directory
3. Ignores jsdoc exit code (it exits 1 on type warnings) but verifies output was generated
"""

def _jsdoc_impl(ctx):
    jsdoc_bin = ctx.attr.jsdoc_binary[DefaultInfo].files_to_run.executable
    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    if is_windows:
        script = ctx.actions.declare_file(ctx.label.name + ".bat")
        ctx.actions.write(script, _WINDOWS_TEMPLATE.format(
            config = ctx.file.config.basename,
            jsdoc_bin = jsdoc_bin.short_path.replace("/", "\\\\"),
        ), is_executable = True)
    else:
        script = ctx.actions.declare_file(ctx.label.name + ".sh")
        ctx.actions.write(script, _UNIX_TEMPLATE.format(
            config = ctx.file.config.basename,
            jsdoc_bin = jsdoc_bin.short_path,
        ), is_executable = True)

    runfiles = ctx.runfiles(files = ctx.files.data + [ctx.file.config])
    runfiles = runfiles.merge(ctx.attr.jsdoc_binary[DefaultInfo].default_runfiles)
    return [DefaultInfo(executable = script, runfiles = runfiles)]

_UNIX_TEMPLATE = """#!/usr/bin/env bash
set -euo pipefail
cd "$BUILD_WORKSPACE_DIRECTORY/javascript/selenium-webdriver"
DEST="$BUILD_WORKSPACE_DIRECTORY/build/docs/api/javascript"
TEMPLATE="$0.runfiles/_main/javascript/selenium-webdriver/node_modules/clean-jsdoc-theme"

# Set BAZEL_BINDIR to suppress rules_js error for non-build actions
export BAZEL_BINDIR="."

# Clean destination to prevent stale files
rm -rf "$DEST"
mkdir -p "$DEST"

# Run jsdoc - ignore exit code since it fails on type warnings
"$0.runfiles/_main/{jsdoc_bin}" --configure {config} --destination "$DEST" --template "$TEMPLATE" "$@" || true

# Verify docs were generated
if [[ -f "$DEST/index.html" ]]; then
    echo "Documentation generated successfully at $DEST"
else
    echo "ERROR: Documentation was not generated"
    exit 1
fi
"""

_WINDOWS_TEMPLATE = """@echo off
cd /d "%BUILD_WORKSPACE_DIRECTORY%\\javascript\\selenium-webdriver"
set DEST=%BUILD_WORKSPACE_DIRECTORY%\\build\\docs\\api\\javascript
set TEMPLATE=%~dp0.runfiles\\_main\\javascript\\selenium-webdriver\\node_modules\\clean-jsdoc-theme
set BAZEL_BINDIR=.

if exist "%DEST%" rmdir /s /q "%DEST%"
mkdir "%DEST%"

"%~dp0.runfiles\\_main\\{jsdoc_bin}" --configure {config} --destination "%DEST%" --template "%TEMPLATE%" %*
if %ERRORLEVEL% neq 0 (
    echo jsdoc exited with warnings, checking output...
)

if exist "%DEST%\\index.html" (
    echo Documentation generated successfully at %DEST%
) else (
    echo ERROR: Documentation was not generated
    exit /b 1
)
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
        "jsdoc_binary": attr.label(
            mandatory = True,
            executable = True,
            cfg = "target",
            doc = "The jsdoc binary target from npm",
        ),
        "_windows_constraint": attr.label(
            default = "@platforms//os:windows",
        ),
    },
)
