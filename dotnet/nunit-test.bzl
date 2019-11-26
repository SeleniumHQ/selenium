load(
    "@io_bazel_rules_dotnet//dotnet/private:context.bzl",
    "dotnet_context",
)
load(
    "@io_bazel_rules_dotnet//dotnet/private:providers.bzl",
    "DotnetLibrary",
    "DotnetResource",
)

TEST_RUNNER_SCRIPT_CONTENT = """{script_prefix}
{runner} {test} --result={result_location};transform={xslt} {additional_args}
"""

def _is_windows():
    return select({
        "@bazel_tools//src/conditions:windows": True,
        "//conditions:default": False,
    })

def _convert_path(input_path, is_windows = False):
    if (is_windows):
        return input_path.replace("/", "\\")
    return input_path

def _nunit_test_impl(ctx):
    dotnet = dotnet_context(ctx)
    name = ctx.label.name

    test_assembly = dotnet.assembly(
        dotnet,
        name = ctx.label.name,
        srcs = ctx.attr.srcs,
        deps = ctx.attr.deps,
        resources = ctx.attr.resources,
        out = ctx.attr.out,
        defines = ctx.attr.defines,
        unsafe = ctx.attr.unsafe,
        data = ctx.attr.data,
        executable = False,
        keyfile = ctx.attr.keyfile,
    )

    args = [test_assembly.result.path] + ctx.attr.args

    file_inputs = [test_assembly.result]
    for dep in ctx.attr.deps:
        src_file = dep.files.to_list()[0]
        dest_file = ctx.actions.declare_file(src_file.basename)
        file_inputs.append(dest_file)
        ctx.actions.run(
            outputs = [dest_file],
            inputs = [src_file],
            executable = ctx.attr._copy.files.to_list()[0],
            arguments = [dest_file.path, src_file.path],
            mnemonic = "CopyDependencyAssembly",
        )

    runner_executable = None
    for runner_file in ctx.attr.test_runner.files.to_list():
        dest_runner_file = ctx.actions.declare_file("runner/" + runner_file.basename)
        file_inputs.append(dest_runner_file)
        if runner_file.basename == "nunit3-console.exe":
            runner_executable = dest_runner_file

        ctx.actions.run(
            outputs = [dest_runner_file],
            inputs = [runner_file],
            executable = ctx.attr._copy.files.to_list()[0],
            arguments = [dest_runner_file.path, runner_file.path],
            mnemonic = "CopyTestRunner",
        )

    # Determining platform isn't available during the analysis phase,
    # so there's no opportunity to give the script file a proper extention.
    # Luckily, as long as the file is marked with the executable attribute
    # in the OS, there's nothing preventing a file named '.bat' being a
    # valid executable shell script on non-Windows OSes. If this changes,
    # this comment can be removed, and the below line changed to give the
    # generated script file a proper extension of '.sh'.
    script_file_extension = "bat"
    additional_args = "$@"
    result_location = "$XML_OUTPUT_FILE"
    script_prefix = "#!/bin/bash"
    is_windows = _is_windows()
    if (is_windows):
        script_file_extension = "bat"
        additional_args = "%*"
        result_location = "%XML_OUTPUT_FILE%"
        script_prefix = "@echo off"

    script_file_name = "{}.{}".format(name, script_file_extension)
    script_file = ctx.actions.declare_file(script_file_name)
    script_content = TEST_RUNNER_SCRIPT_CONTENT.format(
        script_prefix = script_prefix,
        runner = _convert_path(runner_executable.path, is_windows),
        test = _convert_path(test_assembly.result.path, is_windows),
        result_location = result_location,
        xslt = _convert_path(ctx.attr._xslt.files.to_list()[0].path, is_windows),
        additional_args = additional_args,
    )

    ctx.actions.write(script_file, script_content, True)

    extra = [] if ctx.attr.data == None else [d.files for d in ctx.attr.data]
    runfiles = ctx.runfiles(
        files = file_inputs,
        transitive_files = depset(transitive = [d[DotnetLibrary].runfiles for d in ctx.attr.deps] + extra),
    )

    info = DefaultInfo(
        files = depset([test_assembly.result, runner_executable, script_file]),
        runfiles = runfiles,
        executable = script_file,
    )

    return [
        info,
        test_assembly,
    ]

nunit_test = rule(
    implementation = _nunit_test_impl,
    attrs = {
        "deps": attr.label_list(providers = [DotnetLibrary]),
        "resources": attr.label_list(providers = [DotnetResource]),
        "srcs": attr.label_list(allow_files = [".cs"]),
        "out": attr.string(),
        "defines": attr.string_list(),
        "unsafe": attr.bool(default = False),
        "keyfile": attr.label(allow_files = True),
        "data": attr.label_list(allow_files = True),
        "dotnet_context_data": attr.label(default = Label("@io_bazel_rules_dotnet//:dotnet_context_data")),
        "test_runner": attr.label(
            default = Label("//third_party/dotnet/nunit.console-3.10.0/bin/net35:nunitconsole"),
            allow_files = True,
        ),
        "_copy": attr.label(default = Label("@io_bazel_rules_dotnet//dotnet/tools/copy")),
        "_xslt": attr.label(default = Label("@io_bazel_rules_dotnet//tools/converttests:n3.xslt"), allow_files = True),
    },
    toolchains = ["@io_bazel_rules_dotnet//dotnet:toolchain_net"],
    test = True,
)
