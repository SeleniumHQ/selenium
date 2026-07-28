"""Bazel rules for generating WebDriver BiDi TypeScript modules from CDDL specification."""

load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
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
        dfns_files = [],
        spec_html = None,
        enhancements_manifest = None,
        generator = None,
        schema_generator = None,
        anchors_extractor = None,
        spec_version = "1.0",
        output_path = "bidi/generated"):
    """Macro that generates BiDi TypeScript modules from CDDL and compiles them to JS.

    Args:
        name: Base name for the targets.
        cddl_file: Primary CDDL spec label (webdriver-bidi-all.cddl).
        extra_cddl_files: Additional CDDL specs parsed alongside the primary one.
        dfns_files: webref definition-index files (one per merged spec). When given,
            the schema step joins them by type name to attach a `specHref` spec link
            to each type. Optional — omitting them yields a schema with no links.
        spec_html: the pinned rendered core spec HTML. When given, its prose section
            anchors are extracted and joined, upgrading type links to `#type-*` sections
            and adding `#command-*` / `#event-*` / `#module-*` links. Optional.
        enhancements_manifest: JSON manifest for per-domain customisations.
        generator: The generate_bidi.mjs js_binary label. Defaults to :generate_bidi_script.
        schema_generator: The project_bidi_schema.mjs js_binary label. Defaults to :project_bidi_schema_script.
        anchors_extractor: The extract_bidi_anchors.mjs js_binary label. Defaults to :extract_bidi_anchors_script.
        spec_version: Spec version string passed to the generator.
        output_path: Output path for generated files within the package (default: bidi/generated).
    """
    if generator == None:
        generator = ":generate_bidi_script"
    if schema_generator == None:
        schema_generator = ":project_bidi_schema_script"
    if anchors_extractor == None:
        anchors_extractor = ":extract_bidi_anchors_script"

    pkg = native.package_name()
    ts_src_path = output_path + "_src"

    # Step 1: parse the base specs into the reusable AST artifact. generate_bidi.mjs
    # parses each `--cddl` file and concatenates their definitions (no separate merge
    # tool). Internal input to the schema and the JS generator; not consumed by other
    # bindings. js_run_binary copies its srcs to bin and rejects external/cross-package
    # files, so stage each spec into the package first (as the dfns/spec_html steps do).
    staged_specs = []
    cddl_args = []
    for i, spec in enumerate([cddl_file] + extra_cddl_files):
        staged = name + "_cddl_%d.cddl" % i
        copy_file(name = name + "_cddl_copy_%d" % i, src = spec, out = staged)
        staged_specs.append(":" + staged)
        cddl_args += ["--cddl", "$(location :" + staged + ")"]
    ast_target = name + "_ast"
    ast_out = name + "_ast.json"
    js_run_binary(
        name = ast_target,
        srcs = staged_specs,
        outs = [ast_out],
        args = cddl_args + ["--dump-ast", pkg + "/" + ast_out],
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
    # Stage each dfns index (often an external @repo//file:dfns.json) into this
    # package: js_run_binary copies its srcs to bin, which rejects external files
    # directly, so copy_file brings them to a package-local path first.
    staged_dfns = []
    for i, dfns in enumerate(dfns_files):
        staged = name + "_dfns_%d.json" % i
        copy_file(
            name = name + "_dfns_copy_%d" % i,
            src = dfns,
            out = staged,
        )
        staged_dfns.append(":" + staged)

    # Extract the core spec's prose section anchors from the pinned rendered HTML into
    # a small index the schema step joins against. The HTML is an external http_file, so
    # stage it into the package first (js_run_binary rejects external srcs, like dfns).
    anchors_out = None
    if spec_html:
        staged_html = name + "_spec.html"
        copy_file(name = name + "_spec_html_copy", src = spec_html, out = staged_html)
        anchors_out = name + "_anchors.json"
        js_run_binary(
            name = name + "_anchors",
            srcs = [":" + staged_html],
            outs = [anchors_out],
            args = ["--spec", "$(location :" + staged_html + ")", "--out", pkg + "/" + anchors_out],
            tool = anchors_extractor,
        )

    schema_target = name + "_schema"
    schema_out = name + "_schema.json"
    schema_srcs = [":" + ast_target, ":" + json_target] + staged_dfns
    schema_args = [
        "--ast",
        "$(location :" + ast_target + ")",
        "--model",
        "$(location :" + json_target + ")",
        "--dump-schema",
        pkg + "/" + schema_out,
    ]
    for staged in staged_dfns:
        schema_args += ["--dfns", "$(location " + staged + ")"]
    if anchors_out:
        schema_srcs.append(":" + anchors_out)
        schema_args += ["--anchors", "$(location :" + anchors_out + ")"]
    js_run_binary(
        name = schema_target,
        srcs = schema_srcs,
        outs = [schema_out],
        args = schema_args,
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
