_GatheredModuleInfo = provider(
    fields = {
        "name": "Name of the module, may be `None`.",
        "module_path": "depset of jars that make up the module path so far.",
        "jars": "Jars to include in the module.",
        "source_jars": "Source jars to include in the module.",
        "java_info": "A merged JavaInfo of all the entries in `jars`.",
    },
)

JavaModuleInfo = provider(
    fields = {
        "name": "Name of the module.",
        "module_path": "depset of jars to include on the module path",
    },
)

# In order to construct the module path, we do this:
#  * `JavaModuleInfo`: use the module path from that
#  * maven coordinates: add the runtime output jars to the module path
#  * otherwise: just accumulate jars

_ATTR_ASPECTS = [
    "deps",
    "exports",
    "runtime_deps",
]

def _infer_name(tags):
    names = [tag[len("maven_coordinates="):] for tag in tags if tag.startswith("maven_coordinates=")]
    if len(names) == 0:
        return None
    if len(names) > 1:
        fail("Only one set of maven coordinates may be specified")

    exploded = names[0].split(":")

    # We want the group id and artifact id. If the artifact id begins
    # with the last segment of the group id, then remove it.
    groups = exploded[0].split(".")
    final = groups[-1] + "-"
    if exploded[1].startswith(final):
        return (exploded[0] + "." + exploded[1][len(final):]).replace("-", "_")
    return (exploded[0] + "." + exploded[1]).replace("-", "_")

def _java_module_aspect_impl(target, ctx):
    name = _infer_name(ctx.rule.attr.tags)

    all_deps = []
    [all_deps.extend(getattr(ctx.rule.attr, attr, [])) for attr in _ATTR_ASPECTS]

    all_infos = [dep[_GatheredModuleInfo] for dep in all_deps]
    nameless_infos = [info for info in all_infos if not info.name]

    jars = depset(direct = target[JavaInfo].runtime_output_jars, transitive = [info.jars for info in nameless_infos])
    source_jars = depset(direct = target[JavaInfo].source_jars, transitive = [info.source_jars for info in nameless_infos])

    derived = "unknown"
    if JavaModuleInfo in target:
        module_path = target[JavaModuleInfo].module_path
        jars = depset(target[JavaInfo].runtime_output_jars)
        source_jars = target[JavaInfo].source_jars
        java_info = target[JavaInfo]
    elif name:
        module_path = depset(direct = target[JavaInfo].runtime_output_jars, transitive = [info.module_path for info in all_infos])
        java_info = java_common.merge([info.java_info for info in all_infos if info.name] + [target[JavaInfo]])
    else:
        module_path = depset(transitive = [info.module_path for info in all_infos])
        java_info = java_common.merge([info.java_info for info in all_infos if info.name])

    return [
        _GatheredModuleInfo(
            name = name,
            module_path = module_path,
            jars = jars,
            source_jars = source_jars,
            java_info = java_info,
        ),
    ]

_java_module_aspect = aspect(
    _java_module_aspect_impl,
    attr_aspects = _ATTR_ASPECTS,
    required_aspect_providers = [
        [JavaInfo],
    ],
    provides = [
        _GatheredModuleInfo,
    ],
    host_fragments = [
        "java",
    ],
)

def _java_module_impl(ctx):
    name = _infer_name(ctx.attr.tags)

    all_infos = [dep[_GatheredModuleInfo] for dep in ctx.attr.deps] + [dep[_GatheredModuleInfo] for dep in ctx.attr.exports]

    included_jars = depset(direct = [ctx.file.target], transitive = [info.jars for info in all_infos])

    # Now that we have a single jar, derive the module info.
    all_jars = depset(transitive = [info.module_path for info in all_infos]).to_list()
    module_path_jars = depset(transitive = [info.module_path for info in all_infos])

    module_info_jar = ctx.actions.declare_file("%s-module-info.jar" % ctx.attr.name)
    args = ctx.actions.args()
    args.add_all(["--module-name", name])
    args.add_all(["--in", ctx.file.target])
    args.add_all(["--output", module_info_jar])
    args.add_all(ctx.attr.hides, before_each = "--hides")
    args.add_all(ctx.attr.uses, before_each = "--uses")
    args.add_all(module_path_jars, before_each = "--module-path")
    args.add_all(ctx.attr.opens_to, before_each = "--open-to")

    ctx.actions.run(
        executable = ctx.executable._module_generator,
        outputs = [module_info_jar],
        inputs = depset([ctx.file.target], transitive = [info.module_path for info in all_infos]),
        arguments = [args],
    )

    # Now merge the input jars and the module info into a single unit.
    # Bazel's singlejar strips the manifest of all useful information,
    # which is suboptimal, so we don't use that.
    module_jar = ctx.actions.declare_file("lib%s.jar" % ctx.attr.name)
    args = ctx.actions.args()
    args.add_all(["--sources", ctx.file.target])
    args.add_all(["--sources", module_info_jar])
    args.add_all(["--output", module_jar])

    ctx.actions.run(
        executable = ctx.executable._merge_jars,
        outputs = [module_jar],
        inputs = [
            module_info_jar,
            ctx.file.target,
        ],
        arguments = [args],
    )

    # Generate the ijar
    compile_jar = java_common.run_ijar(
        actions = ctx.actions,
        jar = module_jar,
        target_label = ctx.label,
        java_toolchain = ctx.attr._java_toolchain[java_common.JavaToolchainInfo],
    )

    # Create the merged source jar
    src_jar = java_common.pack_sources(
        actions = ctx.actions,
        output_source_jar = ctx.actions.declare_file("lib%s-src.jar" % ctx.attr.name),
        source_jars = depset(
            direct = ctx.attr.target[JavaInfo].source_jars,
            transitive = [info.source_jars for info in all_infos if not info.name],
        ).to_list(),
        java_toolchain = ctx.attr._java_toolchain[java_common.JavaToolchainInfo],
    )

    # TODO: This JavaInfo needs to have the JavaInfos of all jars included in module stripped
    java_info = JavaInfo(
        output_jar = module_jar,
        source_jar = src_jar,
        compile_jar = compile_jar,
        deps = [info.java_info for info in all_infos],
        exports = [ex[JavaInfo] for ex in ctx.attr.exports],
        runtime_deps = [dep[JavaInfo] for dep in ctx.attr.deps],
    )

    return [
        DefaultInfo(files = depset([module_jar])),
        JavaModuleInfo(
            name = name,
            module_path = depset(direct = [module_jar], transitive = [info.module_path for info in all_infos]),
        ),
        OutputGroupInfo(
            module_jar = [module_jar],
            module_source = [src_jar],
            _source_jars = [src_jar],
        ),
        java_info,
    ]

java_module = rule(
    _java_module_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            allow_single_file = True,
            providers = [
                [_GatheredModuleInfo, JavaInfo],
            ],
            aspects = [
                _java_module_aspect,
            ],
        ),
        "deps": attr.label_list(
            providers = [
                [_GatheredModuleInfo],
            ],
            aspects = [
                _java_module_aspect,
            ],
        ),
        "exports": attr.label_list(
            providers = [
                [_GatheredModuleInfo, JavaInfo],
            ],
            aspects = [
                _java_module_aspect,
            ],
        ),
        "hides": attr.string_list(
            doc = "List of package names to hide",
            default = [],
        ),
        "opens_to": attr.string_list(
            doc = "List of modules this module is open to",
            default = [],
        ),
        "uses": attr.string_list(
            doc = "List of classnames that the module uses",
            default = [],
        ),
        "_javabase": attr.label(
            cfg = "exec",
            default = "@bazel_tools//tools/jdk:current_java_runtime",
            providers = [java_common.JavaRuntimeInfo],
        ),
        "_java_toolchain": attr.label(
            default = "@bazel_tools//tools/jdk:current_java_toolchain",
        ),
        "_merge_jars": attr.label(
            default = "@rules_jvm_external//private/tools/java/com/github/bazelbuild/rules_jvm_external/jar:MergeJars",
            executable = True,
            cfg = "exec",
        ),
        "_module_generator": attr.label(
            default = "//java/src/dev/selenium/tools/modules:ModuleGenerator",
            executable = True,
            cfg = "exec",
        ),
    },
)
