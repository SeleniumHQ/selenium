load("//java/private:dist_info.bzl", "DistZipInfo", "dist_aspect", "separate_first_and_third_party")
load("//java/private:module.bzl", "JavaModuleInfo")

def generate_javadoc(ctx, javadoc, source_jars, classpath, output):
    args = ctx.actions.args()
    args.add_all(["--out", output])
    args.add_all(source_jars, before_each = "--in")
    args.add_all(classpath.to_list(), before_each = "--cp")

    if type(source_jars) != "depset":
        fail("Wrong type")

    ctx.actions.run(
        executable = javadoc,
        outputs = [output],
        inputs = depset(transitive = [classpath] + [source_jars]),
        arguments = [args],
    )

def _javadoc_impl(ctx):
    (first, ignored) = separate_first_and_third_party(
        ctx.attr.third_party_prefixes, [dep[DistZipInfo] for dep in ctx.attr.deps])

    sources = depset(transitive = [dep.source_jars for dep in first])

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
              [DistZipInfo],
          ],
          aspects = [
              dist_aspect,
          ],
      ),
      "transitive": attr.bool(),
      "third_party_prefixes": attr.string_list(),
      "_javadoc": attr.label(
          default = "//java/client/src/org/openqa/selenium/tools/javadoc",
          cfg = "host",
          executable = True,
      ),
    },
)
