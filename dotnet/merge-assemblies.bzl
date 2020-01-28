load(
    "@d2l_rules_csharp//csharp/private:common.bzl",
    "collect_transitive_info",
    "fill_in_missing_frameworks"
)
load(
    "@d2l_rules_csharp//csharp/private:providers.bzl",
    "CSharpAssemblyInfo"
)

def _merged_assembly_impl(ctx):
    providers = {}
    name = ctx.label.name

    deps = ctx.attr.deps
    result = ctx.outputs.out

    target_framework = ctx.attr.target_framework

    args = [
        "-ndebug",
        "-v4",
        "-xmldocs",
        "-internalize",
    ]

    if ctx.attr.keyfile != None:
        key_path = ctx.expand_location(ctx.attr.keyfile.files.to_list()[0].path)
        args.append("-keyfile:{}".format(key_path))

    args.append("-out={}".format(ctx.outputs.out.path))
    args.append(ctx.attr.src_assembly.files.to_list()[0].path)
    (refs, runfiles, native_dlls) = collect_transitive_info(deps, target_framework)
    for ref in refs.to_list():
        args.append(ref.path)

    ctx.actions.run(
        executable = ctx.executable.merge_tool,
        arguments = args,
        inputs = ctx.attr.src_assembly.files,
        outputs = [ctx.outputs.out],
    )

    runfiles = ctx.runfiles(
        files = [ctx.outputs.out],
    )

    for dep in ctx.files.deps:
        runfiles = runfiles.merge(dep[DefaultInfo].default_runfiles)

    providers[target_framework] = CSharpAssemblyInfo[target_framework](
        out = ctx.outputs.out,
        refout = None,
        pdb = None,
        native_dlls = native_dlls,
        deps = deps,
        transitive_refs = refs,
        transitive_runfiles = depset([]),
        actual_tfm = target_framework,
        runtimeconfig = None,
    )

    fill_in_missing_frameworks(providers)
    returned_info = providers.values()
    returned_info.append(
        DefaultInfo(
            runfiles = runfiles,
        ),
    )
    return returned_info

merged_assembly = rule(
    implementation = _merged_assembly_impl,
    attrs = {
        "src_assembly": attr.label(),
        "deps": attr.label_list(),
        "out": attr.output(mandatory = True),
        "keyfile": attr.label(allow_single_file = True),
        "target_framework": attr.string(mandatory = True),
        "merge_tool": attr.label(
            executable = True,
            cfg = "host",
            default = Label("//third_party/dotnet/ilmerge:ilmerge.exe"),
            allow_single_file = True,
        ),
    },
    toolchains = ["//third_party/dotnet/ilmerge:toolchain_type"],
)
