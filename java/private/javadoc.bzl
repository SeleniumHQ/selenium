load("//java/private:module.bzl", "JavaModuleInfo")

def generate_javadoc(ctx, javadoc, source_jars, classpath, output):
    args = ctx.actions.args()
    args.add_all(["--out", output])
    args.add_all(source_jars, before_each = "--in")
    args.add_all(classpath.to_list(), before_each = "--cp")

    ctx.actions.run(
        executable = javadoc,
        outputs = [output],
        inputs = depset(source_jars, transitive = [classpath]),
        arguments = [args],
    )

def _javadoc_impl(ctx):
    sources = []
    for dep in ctx.attr.deps:
        if JavaModuleInfo in dep:
            sources.extend(dep[JavaInfo].source_jars)
        else:
            sources.extend(dep[JavaInfo].source_jars)

    jar_file = ctx.actions.declare_file("%s.jar" % ctx.attr.name)

    classpath = depset(transitive = [dep[JavaInfo].transitive_runtime_jars for dep in ctx.attr.deps])

    generate_javadoc(ctx, ctx.executable._javadoc, sources, classpath, jar_file)

    return [
        DefaultInfo(files = depset([jar_file])),
    ]

javadoc = rule(
    _javadoc_impl,
    attrs = {
      "deps": attr.label_list(
          mandatory = True,
          providers = [
              [JavaInfo],
          ],
      ),
      "hide": attr.string_list(),
      "_javadoc": attr.label(
          default = "//java/client/src/org/openqa/selenium/tools/javadoc",
          cfg = "host",
          executable = True,
      ),
    },
)
