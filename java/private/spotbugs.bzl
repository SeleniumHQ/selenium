load(":spotbugs_config.bzl", "SpotBugsInfo")

def _spotbugs_impl(ctx):
    # Preferred options: 1/ config on rule, 2/ config via attributes
    if ctx.attr.config != None:
        info = ctx.attr.config[SpotBugsInfo]
        effort = info.effort
        fail_on_warning = info.fail_on_warning
        exclude_filter = info.exclude_filter
    else:
        effort = ctx.attr.effort
        fail_on_warning = ctx.attr.fail_on_warning
        exclude_filter = None

    if ctx.attr.only_output_jars:
        deps = []
        for target in ctx.attr.deps:
            if JavaInfo in target:
                # test targets do not include their own jars:
                # https://github.com/bazelbuild/bazel/issues/11705
                # work around that.
                deps.extend([jar.class_jar for jar in target[JavaInfo].outputs.jars])
        jars = depset(direct = deps).to_list()
    else:
        jars = depset(transitive = [target[JavaInfo].transitive_runtime_deps for target in ctx.attr.deps if JavaInfo in target]).to_list()

    flags = ["-textui", "-effort:%s" % effort]

    #    flags = ["-textui", "-xml", "-effort:%s" % effort]
    if exclude_filter:
        flags.extend(["-exclude", exclude_filter.short_path])

    test = [
        "#!/usr/bin/env bash",
        "RES=`{lib} {flags} {jars} 2>/dev/null`".format(
            lib = ctx.executable._spotbugs_cli.short_path,
            flags = " ".join(flags),
            jars = " ".join([jar.short_path for jar in jars]),
        ),
        "echo \"$RES\"",
    ]

    if fail_on_warning:
        test.extend([
            "if [ -n \"$RES\" ]; then",
            "   exit 1",
            "fi",
        ])

    out = ctx.actions.declare_file(ctx.label.name + "exec")

    ctx.actions.write(
        output = out,
        content = "\n".join(test),
    )

    runfiles = ctx.runfiles(
        files = jars + [ctx.executable._spotbugs_cli],
    )
    if (exclude_filter):
        runfiles = runfiles.merge(ctx.runfiles(files = [exclude_filter]))

    return [
        DefaultInfo(
            executable = out,
            runfiles = runfiles.merge(ctx.attr._spotbugs_cli[DefaultInfo].default_runfiles),
        ),
    ]

spotbugs_test = rule(
    implementation = _spotbugs_impl,
    attrs = {
        "deps": attr.label_list(
            mandatory = True,
            allow_files = False,
        ),
        "config": attr.label(
            providers = [
                SpotBugsInfo,
            ],
        ),
        "effort": attr.string(
            doc = "Effort can be min, less, default, more or max. Defaults to default",
            values = ["min", "less", "default", "more", "max"],
            default = "default",
        ),
        "only_output_jars": attr.bool(
            doc = "If set to true, only the output jar of the target will be analyzed. Otherwise all transitive runtime dependencies will be analyzed",
            default = True,
        ),
        "fail_on_warning": attr.bool(
            doc = "If set to true the test will fail on a warning, otherwise it will succeed but create a report. Defaults to True",
            default = True,
        ),
        "_spotbugs_cli": attr.label(
            cfg = "host",
            default = "//java/private:spotbugs_cli",
            executable = True,
        ),
    },
    executable = True,
    test = True,
)
