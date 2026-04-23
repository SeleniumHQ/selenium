ClosureJsSrcsInfo = provider(fields = ["files"])

def _closure_js_srcs_aspect_impl(target, ctx):
    """Aspect to collect transitive .js source files from closure_js_library targets."""
    direct = []
    if ctx.rule.kind == "closure_js_library" and hasattr(ctx.rule.attr, "srcs"):
        for s in ctx.rule.attr.srcs:
            for f in s.files.to_list():
                # Only include .js files from the main workspace, not external repos
                if f.extension == "js" and not f.owner.workspace_name:
                    direct.append(f)

    trans = []
    for d in getattr(ctx.rule.attr, "deps", []):
        if ClosureJsSrcsInfo in d:
            trans.append(d[ClosureJsSrcsInfo].files)
    for d in getattr(ctx.rule.attr, "exports", []):
        if ClosureJsSrcsInfo in d:
            trans.append(d[ClosureJsSrcsInfo].files)

    return [ClosureJsSrcsInfo(files = depset(direct = direct, transitive = trans))]

closure_js_srcs_aspect = aspect(
    implementation = _closure_js_srcs_aspect_impl,
    attr_aspects = ["deps", "exports"],
)

def _collect_srcs_impl(ctx):
    """Rule to collect all transitive JS sources from closure_js_library deps."""
    trans = []
    for d in ctx.attr.deps:
        if ClosureJsSrcsInfo in d:
            trans.append(d[ClosureJsSrcsInfo].files)
    all_files = depset(transitive = trans)
    return [
        DefaultInfo(files = all_files),
        ClosureJsSrcsInfo(files = all_files),
    ]

collect_closure_js_srcs = rule(
    implementation = _collect_srcs_impl,
    attrs = {
        "deps": attr.label_list(aspects = [closure_js_srcs_aspect]),
    },
    provides = [ClosureJsSrcsInfo],
)

def _closure_js_deps_gen_impl(ctx):
    """Rule that generates deps.js by scanning JS sources for goog.provide/require/module.

    Uses a Python script that reads file paths from a response file to avoid
    Windows command line length limits.
    """
    srcs_depset = ctx.attr.srcs_collector[ClosureJsSrcsInfo].files
    srcs_list = srcs_depset.to_list()
    output = ctx.outputs.out

    # Get the closure library path
    closure_path = ctx.file._closure_library.dirname

    # Write file list to a response file to avoid Windows command line length limits
    files_list = ctx.actions.declare_file(ctx.label.name + "_files.txt")
    ctx.actions.write(
        output = files_list,
        content = "\n".join([f.path for f in srcs_list]),
    )

    ctx.actions.run(
        outputs = [output],
        inputs = srcs_list + [ctx.file._closure_library, files_list],
        executable = ctx.executable._wrapper,
        arguments = [
            files_list.path,
            output.path,
            closure_path,
        ],
        mnemonic = "ClosureJsDeps",
        progress_message = "Generating deps.js for %s" % ctx.label,
    )

    return [
        DefaultInfo(
            files = depset([output]),
            runfiles = ctx.runfiles(
                files = [output],
                transitive_files = srcs_depset,
            ),
        ),
    ]

_closure_js_deps_gen = rule(
    implementation = _closure_js_deps_gen_impl,
    attrs = {
        "srcs_collector": attr.label(mandatory = True, providers = [ClosureJsSrcsInfo]),
        "_wrapper": attr.label(
            default = "//javascript/private:closure_make_deps",
            executable = True,
            cfg = "exec",
        ),
        "_closure_library": attr.label(
            default = "//third_party/closure/goog:base.js",
            allow_single_file = True,
        ),
    },
    outputs = {"out": "deps.js"},
)

def closure_js_deps(name, deps = [], testonly = None, **kwargs):
    """Generate a deps.js file from closure_js_library dependencies.

    Scans JS sources for goog.provide/goog.require/goog.module calls and
    generates goog.addDependency entries. Uses a response file to avoid
    Windows command line length limits.

    Args:
        name: Name of the target. The output will be 'deps.js'.
        deps: List of closure_js_library targets to analyze for dependencies.
        testonly: If True, only testonly targets can depend on this target.
        **kwargs: Additional arguments passed to the rule (e.g., visibility).
    """

    srcs_collector = name + "_closure_srcs"
    collect_closure_js_srcs(
        name = srcs_collector,
        deps = deps,
        testonly = testonly,
        visibility = ["//visibility:private"],
    )

    _closure_js_deps_gen(
        name = name,
        srcs_collector = ":" + srcs_collector,
        testonly = testonly,
        **kwargs
    )
