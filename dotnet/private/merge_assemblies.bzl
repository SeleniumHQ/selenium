load(
    "@d2l_rules_csharp//csharp/private:common.bzl",
    "collect_transitive_info",
    "fill_in_missing_frameworks",
)
load(
    "@d2l_rules_csharp//csharp/private:providers.bzl",
    "CSharpAssemblyInfo",
)

def _merged_assembly_impl(ctx):
    providers = {}
    name = ctx.label.name
    deps = ctx.attr.deps
    target_framework = ctx.attr.target_framework
    input_assembly = ctx.attr.src_assembly.files.to_list()[0]

    output_file_name = ctx.attr.out
    if (output_file_name == ""):
        output_file_name = input_assembly.basename

    output_assembly = ctx.actions.declare_file("merged/{}/{}/{}".format(name, target_framework, output_file_name))
    output_pdb = ctx.actions.declare_file("merged/{}/{}/{}".format(name, target_framework, input_assembly.basename.replace(input_assembly.extension, "pdb")))

    args = [
        "-v4",
        "-xmldocs",
        "-internalize",
    ]

    if ctx.attr.keyfile != None:
        key_path = ctx.expand_location(ctx.attr.keyfile.files.to_list()[0].path)
        args.append("-keyfile:{}".format(key_path))

    args.append("-out={}".format(output_assembly.path))
    args.append(input_assembly.path)
    (refs, runfiles, native_dlls) = collect_transitive_info(name, deps, target_framework)
    for ref in refs.to_list():
        args.append(ref.path)

    ctx.actions.run(
        executable = ctx.executable.merge_tool,
        mnemonic = "MergeAssembly",
        progress_message = "Merging assemblies into {}".format(output_assembly.path),
        arguments = args,
        inputs = ctx.attr.src_assembly.files,
        outputs = [output_assembly, output_pdb],
    )

    runfiles = ctx.runfiles(
        files = [output_pdb],
    )

    for dep in ctx.files.deps:
        runfiles = runfiles.merge(dep[DefaultInfo].default_runfiles)

    providers[target_framework] = CSharpAssemblyInfo[target_framework](
        out = output_assembly,
        prefout = None,
        irefout = None,
        internals_visible_to = [],
        pdb = output_pdb,
        native_dlls = native_dlls,
        deps = deps,
        transitive_refs = refs,
        transitive_runfiles = depset([]),
        actual_tfm = target_framework,
        runtimeconfig = None,
    )

    fill_in_missing_frameworks(name, providers)
    returned_info = providers.values()
    returned_info.append(
        DefaultInfo(
            files = depset([output_assembly]),
            runfiles = runfiles,
        ),
    )
    return returned_info

merged_assembly = rule(
    implementation = _merged_assembly_impl,
    attrs = {
        "src_assembly": attr.label(),
        "deps": attr.label_list(),
        "out": attr.string(default = ""),
        "keyfile": attr.label(allow_single_file = True),
        "target_framework": attr.string(mandatory = True),
        "merge_tool": attr.label(
            executable = True,
            cfg = "exec",
            default = Label("//third_party/dotnet/ilmerge:ilmerge.exe"),
            allow_single_file = True,
        ),
    },
    toolchains = ["//third_party/dotnet/ilmerge:toolchain_type"],
)
