"""Bazel rules for generating WebDriver BiDi TypeScript modules from CDDL specification."""

load("@aspect_rules_js//js:defs.bzl", "js_run_binary")

# Language bindings consume the generated schema artifact; the ast/model are
# internal inputs to it (and to the JS generator) and stay package-private.
_ARTIFACT_VISIBILITY = [
    "//java:__subpackages__",
    "//py:__subpackages__",
    "//rb:__subpackages__",
]

# Output TypeScript file names produced by generate_bidi.mjs, one per domain.
_DOMAIN_TS_FILES = [
    "bluetooth.ts",
    "browser.ts",
    "browsing_context.ts",
    "common.ts",
    "emulation.ts",
    "input.ts",
    "log.ts",
    "network.ts",
    "permissions.ts",
    "script.ts",
    "session.ts",
    "speculation.ts",
    "storage.ts",
    "user_agent_client_hints.ts",
    "webextension.ts",
]

def _merge_cddl_impl(ctx):
    """Merges one or more CDDL files into a single output file."""
    out = ctx.outputs.out
    args = ctx.actions.args()
    args.add(out)
    args.add_all(ctx.files.srcs)
    ctx.actions.run(
        inputs = ctx.files.srcs,
        outputs = [out],
        executable = ctx.executable.tool,
        arguments = [args],
        mnemonic = "MergeCddl",
        progress_message = "Merging CDDL files into %s" % out.short_path,
    )
    return [DefaultInfo(files = depset([out]))]

_merge_cddl = rule(
    implementation = _merge_cddl_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True, mandatory = True),
        "out": attr.output(mandatory = True),
        "tool": attr.label(
            executable = True,
            cfg = "exec",
            mandatory = True,
        ),
    },
    doc = "Merges CDDL specification files into a single file using an external merge tool.",
)

def _compile_bidi_ts_impl(ctx):
    ts_files = ctx.files.srcs
    output_subdir = ctx.attr.output_subdir
    tsc = ctx.executable.tsc

    js_outputs = [
        ctx.actions.declare_file(output_subdir + "/" + f.basename.replace(".ts", ".js"))
        for f in ts_files
    ]
    dts_outputs = [
        ctx.actions.declare_file(output_subdir + "/" + f.basename.replace(".ts", ".d.ts"))
        for f in ts_files
    ]
    all_outputs = js_outputs + dts_outputs

    args = ctx.actions.args()
    args.add("--target", "ES2020")
    args.add("--module", "NodeNext")
    args.add("--moduleResolution", "NodeNext")
    args.add("--declaration")
    args.add("--outDir", js_outputs[0].dirname)
    for f in ts_files:
        args.add(f.path)

    ctx.actions.run(
        inputs = ts_files,
        outputs = all_outputs,
        executable = tsc,
        arguments = [args],
        env = {
            "BAZEL_BINDIR": ctx.bin_dir.path,
            # Prevent the js_binary wrapper from cd-ing to BAZEL_BINDIR.
            # Without this, all file paths passed to tsc (which start with
            # bazel-out/..., i.e. relative to the execroot) would be resolved
            # relative to BAZEL_BINDIR and end up double-prefixed.
            "JS_BINARY__NO_CD_BINDIR": "1",
        },
        mnemonic = "TscCompileBiDi",
        progress_message = "Compiling WebDriver BiDi TypeScript to JavaScript",
    )

    return [DefaultInfo(files = depset(all_outputs))]

_compile_bidi_ts = rule(
    implementation = _compile_bidi_ts_impl,
    attrs = {
        "output_subdir": attr.string(mandatory = True),
        "srcs": attr.label_list(allow_files = True, mandatory = True),
        "tsc": attr.label(
            executable = True,
            cfg = "exec",
            default = "@npm_typescript//:tsc",
        ),
    },
    doc = "Compiles generated BiDi TypeScript files to JavaScript + declaration files",
)

def generate_bidi_library(
        name,
        cddl_file,
        extra_cddl_files = [],
        enhancements_manifest = None,
        generator = None,
        schema_generator = None,
        merge_tool = "//py/private:merge_cddl",
        spec_version = "1.0",
        output_path = "bidi/generated"):
    """Macro that merges CDDL, generates BiDi TypeScript modules, and compiles them to JS.

    Args:
        name: Base name for the targets.
        cddl_file: Primary CDDL spec label (webdriver-bidi-all.cddl).
        extra_cddl_files: Additional CDDL files merged before generation.
        enhancements_manifest: JSON manifest for per-domain customisations.
        generator: The generate_bidi.mjs js_binary label. Defaults to :generate_bidi_script.
        schema_generator: The project_bidi_schema.mjs js_binary label. Defaults to :project_bidi_schema_script.
        merge_tool: Python binary that concatenates CDDL files (output first, then inputs).
        spec_version: Spec version string passed to the generator.
        output_path: Output path for generated files within the package (default: bidi/generated).
    """
    if generator == None:
        generator = ":generate_bidi_script"
    if schema_generator == None:
        schema_generator = ":project_bidi_schema_script"

    pkg = native.package_name()
    ts_src_path = output_path + "_src"

    # Step 1: merge CDDL files into one.
    # merge_cddl signature: <output> <input1> [<input2> ...]
    # Uses ctx.actions.run so arguments are passed as an argv list rather than
    # a shell command string, avoiding quoting/escaping issues with special chars.
    merged_name = name + "_merged_cddl"
    _merge_cddl(
        name = merged_name,
        srcs = [cddl_file] + extra_cddl_files,
        out = name + "_merged.cddl",
        tool = merge_tool,
    )

    # Step 2: parse the merged CDDL once into the reusable AST artifact. Internal
    # input to the schema and the JS generator; not consumed by other bindings.
    ast_target = name + "_ast"
    ast_out = name + "_ast.json"
    js_run_binary(
        name = ast_target,
        srcs = [":" + merged_name],
        outs = [ast_out],
        args = [
            "--cddl",
            "$(location :" + merged_name + ")",
            "--dump-ast",
            pkg + "/" + ast_out,
        ],
        tool = generator,
    )

    # Step 3: extract the binding-neutral command/event model from the AST. Folded
    # into the schema below; still consumed directly by the JS generator in-package.
    json_target = name + "_json"
    model_out = name + "_model.json"
    js_run_binary(
        name = json_target,
        srcs = [":" + ast_target],
        outs = [model_out],
        args = [
            "--ast",
            "$(location :" + ast_target + ")",
            "--dump-model",
            pkg + "/" + model_out,
        ],
        tool = generator,
    )

    # Step 3b: project the normalized, flat schema (commands + events + types) that
    # the generated Ruby / Java / Python clients consume. The step validates the
    # schema (referential integrity + input/output completeness) and fails the
    # build on any error, so a dropped or dangling type cannot ship silently.
    schema_target = name + "_schema"
    schema_out = name + "_schema.json"
    js_run_binary(
        name = schema_target,
        srcs = [":" + ast_target, ":" + json_target],
        outs = [schema_out],
        args = [
            "--ast",
            "$(location :" + ast_target + ")",
            "--model",
            "$(location :" + json_target + ")",
            "--dump-schema",
            pkg + "/" + schema_out,
        ],
        tool = schema_generator,
        visibility = _ARTIFACT_VISIBILITY,
    )

    # Step 4: generate one .ts module per BiDi domain from the AST + model.
    ts_outs = [ts_src_path + "/" + f for f in _DOMAIN_TS_FILES]
    gen_srcs = [":" + ast_target, ":" + json_target]
    gen_args = [
        "--ast",
        "$(location :" + ast_target + ")",
        "--model",
        "$(location :" + json_target + ")",
        "--output-dir",
        pkg + "/" + ts_src_path,
        "--spec-version",
        spec_version,
    ]
    if enhancements_manifest:
        gen_srcs.append(enhancements_manifest)
        gen_args += ["--enhancements", "$(location " + enhancements_manifest + ")"]

    ts_target = name + "_ts"
    js_run_binary(
        name = ts_target,
        srcs = gen_srcs,
        outs = ts_outs,
        args = gen_args,
        tool = generator,
    )

    # Step 5: compile .ts → .js + .d.ts via tsc (custom rule for ctx.bin_dir.path).
    _compile_bidi_ts(
        name = name,
        srcs = [":" + ts_target],
        output_subdir = output_path,
    )
