def _merge_toolchain_impl(ctx):
    toolchain_info = platform_common.ToolchainInfo(
        merge_tool = ctx.files.merge_tool[0].path,
    )
    return [toolchain_info]

merge_toolchain = rule(
    implementation = _merge_toolchain_impl,
    attrs = {
        "merge_tool": attr.label(
            executable = True,
            allow_single_file = True,
            mandatory = True,
            cfg = "host",
        ),
    },
)

def configure_toolchain():
    merge_toolchain(
        name = "ilmerger",
        merge_tool = "ilmerge.exe",
    )

    native.toolchain(
        name = "ilmerge_toolchain",
        exec_compatible_with = [
            "@platforms//os:windows",
            "@platforms//cpu:x86_64",
        ],
        toolchain = ":ilmerger",
        toolchain_type = ":toolchain_type",
    )
