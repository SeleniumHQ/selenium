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

    return [ClosureJsSrcsInfo(files = depset(direct = direct, transitive = trans))]

closure_js_srcs_aspect = aspect(
    implementation = _closure_js_srcs_aspect_impl,
    attr_aspects = ["deps"],
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

def _closure_js_deps_wrapper_impl(ctx):
    """Wrapper rule that adds runfiles to the generated deps.js file."""
    deps_file = ctx.file.deps_file
    srcs_depset = ctx.attr.srcs_collector[ClosureJsSrcsInfo].files

    return [
        DefaultInfo(
            files = depset([deps_file]),
            runfiles = ctx.runfiles(
                files = [deps_file],
                transitive_files = srcs_depset,
            ),
        ),
    ]

_closure_js_deps_wrapper = rule(
    implementation = _closure_js_deps_wrapper_impl,
    attrs = {
        "deps_file": attr.label(allow_single_file = True, mandatory = True),
        "srcs_collector": attr.label(mandatory = True),
    },
)

def closure_js_deps(name, deps = [], testonly = None, **kwargs):
    """Generate a deps.js file from closure_js_library dependencies.

    This macro replaces the old closure_js_deps rule from rules_closure by using
    the closure-make-deps binary from the google-closure-deps npm package.

    Args:
        name: Name of the target. The output will be 'deps.js'.
        deps: List of closure_js_library targets to analyze for dependencies.
    """

    srcs_collector = name + "_closure_srcs"
    collect_closure_js_srcs(
        name = srcs_collector,
        deps = deps,
        testonly = testonly,
        visibility = ["//visibility:private"],
    )

    deps_genrule = name + "_genrule"
    native.genrule(
        name = deps_genrule,
        srcs = [":" + srcs_collector],
        outs = ["deps.js"],
        cmd = """
            export BAZEL_BINDIR=$(BINDIR) && \\
            FILES="" && \\
            for f in $(SRCS); do \\
                FILES="$$FILES --file $$(pwd)/$$f"; \\
            done && \\
            $(location //javascript/private:closure_make_deps) \\
                --closure-path $$(pwd)/external/com_google_javascript_closure_library/closure \\
                --no-validate \\
                $$FILES | \\
            sed 's|../../../javascript/|../../../_main/javascript/|g' \\
                > $@
        """,
        tools = ["//javascript/private:closure_make_deps"],
        testonly = testonly,
        visibility = ["//visibility:private"],
    )

    # Use the wrapper rule to add runfiles to the generated deps.js
    _closure_js_deps_wrapper(
        name = name,
        deps_file = deps_genrule,
        srcs_collector = ":" + srcs_collector,
        testonly = testonly,
        **kwargs
    )
