
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
    }
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

def debug(target, type, msg):
    print("%s %s: %s" % (target.label, type, msg))

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
        derived = "from java module info"
        module_path = target[JavaModuleInfo].module_path
        jars = target[JavaInfo].runtime_output_jars
        source_jars = target[JavaInfo].source_jars
        java_info = target[JavaInfo]
    elif name:
        derived = "by name"
        module_path = depset(direct = target[JavaInfo].runtime_output_jars, transitive = [info.module_path for info in all_infos])
        java_info = java_common.merge([info.java_info for info in all_infos if info.name] + [target[JavaInfo]])
    else:
        derived = "by default"
        module_path = depset(transitive = [info.module_path for info in all_infos])
        java_info = java_common.merge([info.java_info for info in all_infos if info.name])

#    debug(target, "module_path derived %s" % derived, module_path)
#    debug(target, "jars", jars)

    return [
        _GatheredModuleInfo(
            name = name,
            module_path = module_path,
            jars = jars,
            source_jars = source_jars,
            java_info = java_info,
        )
    ]

_java_module_aspect = aspect(
    _java_module_aspect_impl,
    attr_aspects = _ATTR_ASPECTS,
    required_aspect_providers = [
        [JavaInfo],
    ],
    provides = [
        _GatheredModuleInfo
    ],
    host_fragments = [
        "java",
    ]
)


def _java_module_impl(ctx):
    name = _infer_name(ctx.attr.tags)

    all_infos = [dep[_GatheredModuleInfo] for dep in ctx.attr.deps]
    included_jars = depset(transitive = [info.jars for info in all_infos])

    raw_merged_jar = ctx.actions.declare_file("%s-pre-module.jar" % ctx.attr.name)
    args = ctx.actions.args()
    args.add_all(["--output", raw_merged_jar])
    args.add_all(["--normalize", "--exclude_build_data"])
    args.add_all(included_jars, before_each = "--sources")
    ctx.actions.run(
        executable = ctx.executable._singlejar,
        outputs = [raw_merged_jar],
        inputs = included_jars,
        arguments = [args]
    )

    # Generate the ijar
    compile_jar = java_common.run_ijar(
        actions = ctx.actions,
        jar = raw_merged_jar,
        target_label = ctx.label,
        java_toolchain = ctx.attr._java_toolchain[java_common.JavaToolchainInfo],
    )

    # Create the merged source jar
    src_jar = java_common.pack_sources(
        actions = ctx.actions,
        output_jar = raw_merged_jar,
        source_jars = depset(transitive = [info.source_jars for info in all_infos if not info.name]).to_list(),
        java_toolchain = ctx.attr._java_toolchain[java_common.JavaToolchainInfo],
        host_javabase = ctx.attr._javabase[java_common.JavaRuntimeInfo],
    )

    java_info = JavaInfo(
        output_jar = raw_merged_jar,
        source_jar = src_jar,
        compile_jar = compile_jar,
        deps = [info.java_info for info in all_infos],
    )

    debug(ctx, "generated java_info", java_info)

    return [
        DefaultInfo(files = depset([raw_merged_jar, src_jar])),
        JavaModuleInfo(
            name = name,
            module_path = depset(direct = [raw_merged_jar], transitive = [info.module_path for info in all_infos])
        ),
        java_info,
    ]

java_module = rule(
    _java_module_impl,
    attrs = {
        "deps": attr.label_list(
            allow_empty = False,
            providers = [
                [_GatheredModuleInfo],
            ],
            aspects = [
                _java_module_aspect,
            ],
        ),
        "_javabase": attr.label(
            cfg = "host",
            default = "@bazel_tools//tools/jdk:current_java_runtime",
            providers = [java_common.JavaRuntimeInfo],
        ),
        "_java_toolchain": attr.label(
            default = "@bazel_tools//tools/jdk:current_java_toolchain",
        ),
        "_singlejar": attr.label(
            default = "@bazel_tools//tools/jdk:singlejar",
            allow_files = True,
            executable = True,
            cfg = "host",
        )
    },
)
