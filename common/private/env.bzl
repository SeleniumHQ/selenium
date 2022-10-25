def _env_impl(rctx):
    rctx.file("BUILD.bazel")  # So we can refer to the defs.bzl file we're about to create
    defs = ["%s = %s" % (k, repr(rctx.os.environ.get(k, "3.8"))) for k in rctx.attr.env_var]
    rctx.file("defs.bzl", "\n".join(defs))

env = repository_rule(
    implementation = _env_impl,
    attrs = {
        "env_var": attr.string_list(),
    },
)
