load("//java/private:module.bzl", "JavaModuleInfo")

def _javadoc_impl(ctx):
    sources = []
    for dep in ctx.attr.deps:
        if JavaModuleInfo in dep:
            sources.extend(dep[JavaInfo].source_jars)
        else:
            sources.extend(dep[JavaInfo].source_jars)

    jar_file = ctx.actions.declare_file("%s.jar" % ctx.attr.name)

    args = ctx.actions.args()
    args.add_all(["--out", jar_file])
    args.add_all(sources, before_each = "--in")

    ctx.actions.run(
        executable = ctx.executable._javadoc,
        outputs = [jar_file],
        inputs = depset(sources),
        arguments = [args],
    )

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
