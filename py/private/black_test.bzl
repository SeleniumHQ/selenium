load(":black_config.bzl", "BlackConfigInfo")

def black_test_impl(ctx):
    config = ctx.attr.config[BlackConfigInfo]

    all_inputs = []
    black = config.black[DefaultInfo].files_to_run.executable
    all_inputs.append(black)

    args = ctx.actions.args()

    for version in config.python_version:
        args.add_all(["-t", version])

    args.add_all(["--line-length", config.line_length])

    args.add("--check")

    args.add_all(ctx.files.srcs)
    all_inputs.extend(ctx.files.srcs)

    # Run on a single core
    args.add_all(["--workers", "1"])

    if config.python_version:
        args.add_all(["--target-version", config.python_version])

    args.use_param_file("@%s", use_always = True)
    args_file = ctx.actions.declare_file("%s-black-params" % ctx.label.name)
    ctx.actions.write(args_file, args)
    all_inputs.append(args_file)

    output = ctx.actions.declare_file("%s-black-test" % ctx.label.name)
    ctx.actions.write(
        output = output,
        content = """#!/usr/bin/env bash
%s $(< %s) """ % (black.short_path, args_file.short_path),
        is_executable = True,
    )

    return [DefaultInfo(
        executable = output,
        files = depset(),
        runfiles = ctx.runfiles(files = all_inputs).merge(
            config.black[DefaultInfo].default_runfiles,
        ),
    )]

black_test = rule(
    black_test_impl,
    attrs = {
        "srcs": attr.label_list(
            allow_files = [".py"],
        ),
        "config": attr.label(
            mandatory = True,
            providers = [
                [BlackConfigInfo],
            ],
        ),
    },
    test = True,
)
