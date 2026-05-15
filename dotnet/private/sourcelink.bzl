"""C# library rule with SourceLink metadata embedded in PDB files."""

load("@bazel_skylib//rules:common_settings.bzl", "BuildSettingInfo")
load("@rules_dotnet//dotnet/private:common.bzl", "is_debug")
load("@rules_dotnet//dotnet/private/rules/common:attrs.bzl", "CSHARP_LIBRARY_COMMON_ATTRS")
load("@rules_dotnet//dotnet/private/rules/common:library.bzl", "build_library")
load("@rules_dotnet//dotnet/private/rules/csharp/actions:csharp_assembly.bzl", "AssemblyAction")
load("@rules_dotnet//dotnet/private/transitions:tfm_transition.bzl", "tfm_transition")

def _generate_sourcelink_json(ctx):
    output = ctx.actions.declare_file(ctx.label.name + "_sourcelink.json")
    ctx.actions.run_shell(
        inputs = [ctx.version_file],
        outputs = [output],
        command = """
COMMIT=$(grep "^STABLE_GIT_REVISION " "{status}" | cut -d' ' -f2 | tr -d '*')
[ -z "$COMMIT" ] && COMMIT=HEAD
printf '{{"documents":{{"*":"{repo}/raw/%s/*"}}}}\\n' "$COMMIT" > "{output}"
""".format(
            status = ctx.version_file.path,
            repo = ctx.attr.repo_url.rstrip("/"),
            output = output.path,
        ),
        mnemonic = "GenSourcelinkJson",
        progress_message = "Generating sourcelink.json for " + str(ctx.label),
    )
    return output

def _compile_action(ctx, tfm):
    toolchain = ctx.toolchains["@rules_dotnet//dotnet:toolchain_type"]
    is_windows = ctx.target_platform_has_constraint(
        ctx.attr._windows_constraint[platform_common.ConstraintValueInfo],
    )
    sourcelink_json = _generate_sourcelink_json(ctx)
    return AssemblyAction(
        ctx.actions,
        ctx.executable._compiler_wrapper_bat if is_windows else ctx.executable._compiler_wrapper_sh,
        label = ctx.label,
        additionalfiles = ctx.files.additionalfiles,
        debug = is_debug(ctx),
        defines = ctx.attr.defines,
        deps = ctx.attr.deps,
        exports = ctx.attr.exports,
        targeting_pack = ctx.attr._targeting_pack[0],
        internals_visible_to = ctx.attr.internals_visible_to,
        keyfile = ctx.file.keyfile,
        langversion = ctx.attr.langversion,
        resources = ctx.files.resources,
        srcs = ctx.files.srcs,
        data = ctx.files.data,
        appsetting_files = [],
        compile_data = ctx.files.compile_data + [sourcelink_json],
        out = ctx.attr.out,
        target = "library",
        target_name = ctx.attr.name,
        target_framework = tfm,
        toolchain = toolchain,
        strict_deps = toolchain.strict_deps[BuildSettingInfo].value,
        generate_documentation_file = ctx.attr.generate_documentation_file,
        include_host_model_dll = False,
        treat_warnings_as_errors = ctx.attr.treat_warnings_as_errors,
        warnings_as_errors = ctx.attr.warnings_as_errors,
        warnings_not_as_errors = ctx.attr.warnings_not_as_errors,
        warning_level = ctx.attr.warning_level,
        nowarn = ctx.attr.nowarn,
        project_sdk = ctx.attr.project_sdk,
        allow_unsafe_blocks = ctx.attr.allow_unsafe_blocks,
        nullable = ctx.attr.nullable,
        run_analyzers = ctx.attr.run_analyzers,
        is_analyzer = ctx.attr.is_analyzer,
        is_language_specific_analyzer = ctx.attr.is_language_specific_analyzer,
        analyzer_configs = ctx.files.analyzer_configs,
        compiler_options = ctx.attr.compiler_options + ["/sourcelink:" + sourcelink_json.path],
        is_windows = is_windows,
    )

def _csharp_sourcelink_library_impl(ctx):
    return build_library(ctx, _compile_action)

_SOURCELINK_ATTRS = dict(CSHARP_LIBRARY_COMMON_ATTRS)
_SOURCELINK_ATTRS["repo_url"] = attr.string(
    doc = "Source repository URL for SourceLink metadata (e.g. https://github.com/owner/repo).",
    default = "https://github.com/SeleniumHQ/selenium",
)

csharp_sourcelink_library = rule(
    _csharp_sourcelink_library_impl,
    doc = "Compile a C# DLL with SourceLink metadata embedded in the PDB.",
    attrs = _SOURCELINK_ATTRS,
    executable = False,
    toolchains = ["@rules_dotnet//dotnet:toolchain_type"],
    cfg = tfm_transition,
)
