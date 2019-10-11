load("//java/private:common.bzl", "MavenInfo", "has_maven_deps", "read_coordinates")

GatheredJavaModuleInfo = provider(
    fields = {
        "binary_jars": "Binary jar for module",
        "module_jars": "Jars to include on the module path",
    },
)

JavaModuleInfo = provider(
    fields = {
        "binary_jars": "Binary jar for module",
        "module_jars": "Jars to include on the module path",
    },
)

def _has_java_module_deps(target, ctx):
    deps = getattr(ctx.rule.attr, "deps", [])
    exports = getattr(ctx.rule.attr, "exports", [])
    rt_deps = getattr(ctx.rule.attr, "runtime_deps", [])
    all_deps = deps + exports + rt_deps

    # Gather all transitive deps
    gathered = []
    for dep in all_deps:
      if GatheredJavaModuleInfo in dep:
        items = dep[GatheredJavaModuleInfo].module_jars.to_list()
        gathered.extend(items)
    transitive = depset(gathered)

    if JavaModuleInfo in target:
        return [
            GatheredJavaModuleInfo(
                binary_jars = depset(target[JavaModuleInfo].binary_jars.to_list()),
                module_jars = depset(target[JavaModuleInfo].module_jars.to_list(), transitive = [transitive]),
            ),
        ]
    elif JavaInfo in target:
        # Assume that only targets with maven coordinates participate
        # in offering java modules
        tags = getattr(ctx.rule.attr, "tags", [])
        coordinates = read_coordinates(tags)
        if not len(coordinates) or "jpms:compile_only" in tags:
            return [GatheredJavaModuleInfo(
                binary_jars = depset(target[JavaInfo].runtime_output_jars),
                module_jars = depset([], transitive = [transitive]),
            )]
        return GatheredJavaModuleInfo(
            binary_jars = depset(target[JavaInfo].runtime_output_jars),
            module_jars = depset(target[JavaInfo].runtime_output_jars, transitive = [transitive]),
        )
    else:
        return [GatheredJavaModuleInfo(
            binary_jars = depset([]),
            module_jars = depset([], transitive = [transitive])
        )]

has_java_module_deps = aspect(
    _has_java_module_deps,
    attr_aspects = [
        # java_library and java_import
        "deps",
        "exports",
        "runtime_deps",

        # maven_artifact
        "target",
    ],
    required_aspect_providers = [
        [JavaModuleInfo],
        [JavaInfo],
    ],
    provides = [
        GatheredJavaModuleInfo,
    ],
)
