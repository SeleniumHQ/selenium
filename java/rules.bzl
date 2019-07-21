def _gen_build_info(name, maven_coords, multi_release_jar):
    if not (maven_coords):
        return []

    rev = native.read_config("selenium", "rev", "unknown")
    time = native.read_config("selenium", "timestamp", "unknown")
    multi_release = "false"
    if multi_release_jar:
        multi_release = "true"

    native.genrule(
        name = "%s-gen-manifest" % name,
        out = "manifest",
        cmd = 'python -c "print(\'Multi-Release: {}\\n\\nName: Build-Info\\nBuild-Revision: {}\\nBuild-Time: {}\\n\\n\')" >> $OUT'.format(multi_release_jar, rev, time),
    )

    native.java_library(
        name = "%s-lib-build-info" % name,
        manifest_file = ":%s-gen-manifest" % name,
    )
    return [":%s-lib-build-info" % name]

def java_library(name, maven_coords = None, module_info = None, deps = [], **kwargs):
    all_deps = []
    all_deps += deps
    if module_info:
        native.genrule(
            name = "%s-generate-module-info" % name,
            srcs = [module_info],
            out = "module-info.jar",
            cmd = "$(exe //java/client/src/org/openqa/selenium/tools:module-maker) $SRCS $OUT",
        )

        native.prebuilt_jar(
            name = "%s-module-info" % name,
            binary_jar = ":%s-generate-module-info" % name,
        )

        all_deps += [":%s-module-info" % name]

    all_deps += _gen_build_info(name, maven_coords, module_info != None)

    native.java_library(
        name = name,
        deps = all_deps,
        maven_coords = maven_coords,
        **kwargs
    )

def java_binary(name, maven_coords = None, deps = [], **kwargs):
    all_deps = []
    all_deps += deps
    all_deps += _gen_build_info(name, maven_coords)

    native.java_binary(
        name = name,
        deps = all_deps,
        **kwargs
    )
