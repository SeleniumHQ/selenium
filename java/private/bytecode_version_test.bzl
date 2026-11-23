load("@rules_java//java:java_test.bzl", "java_test")
load("@rules_java//java/common:java_info.bzl", "JavaInfo")

def _short_path(file):
    return file.short_path

def _bytecode_manifest_impl(ctx):
    artifacts = [(dep.label, dep[JavaInfo].transitive_runtime_jars) for dep in ctx.attr.deps]
    artifacts += [(jar.label, jar.files) for jar in ctx.attr.jars]

    lines = ctx.actions.args()
    lines.set_param_file_format("multiline")
    for label, jars in artifacts:
        lines.add_all(jars, map_each = _short_path, format_each = "%s\t%%s" % label)

    manifest = ctx.actions.declare_file("%s.txt" % ctx.label.name)
    ctx.actions.write(manifest, lines)

    return [
        DefaultInfo(
            files = depset([manifest]),
            runfiles = ctx.runfiles(
                files = [manifest],
                transitive_files = depset(transitive = [jars for _, jars in artifacts]),
            ),
        ),
    ]

_bytecode_manifest = rule(
    _bytecode_manifest_impl,
    attrs = {
        "deps": attr.label_list(providers = [JavaInfo]),
        "jars": attr.label_list(allow_files = [".jar"]),
    },
)

def bytecode_version_test(name, max_java_version, deps = [], jars = [], **kwargs):
    manifest = "%s-manifest" % name
    _bytecode_manifest(
        name = manifest,
        testonly = True,
        deps = deps,
        jars = jars,
    )

    java_test(
        name = name,
        main_class = "dev.selenium.tools.bytecode.BytecodeVersionCheck",
        use_testrunner = False,
        args = [
            "$(rootpath :%s)" % manifest,
            str(max_java_version),
        ],
        data = [":%s" % manifest],
        runtime_deps = ["//java/src/dev/selenium/tools/bytecode"],
        **kwargs
    )
