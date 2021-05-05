def _rb_gem_impl(ctx):
    gem_builder = ctx.actions.declare_file("gem_builder.rb")

    inputs = []
    for dep in ctx.attr.deps:
        inputs.extend(dep.files.to_list())
        inputs.extend(dep[DefaultInfo].data_runfiles.files.to_list())

    ctx.actions.expand_template(
        template = ctx.file._gem_builder_template,
        output = gem_builder,
        substitutions = {
            "{bazel_out_dir}": ctx.outputs.gem.dirname,
            "{gem_filename}": ctx.label.name + ".gem",
            "{gemspec}": ctx.file.gemspec.path,
        },
    )

    ctx.actions.run(
        inputs = inputs,
        executable = gem_builder,
        outputs = [ctx.outputs.gem],
        execution_requirements = {
            "no-sandbox": "1", # allow to traverse directory symlinks
        },
    )

rb_gem = rule(
    _rb_gem_impl,
    attrs = {
        "srcs": attr.label_list(
            allow_files = True,
        ),
        "gemspec": attr.label(
            allow_single_file = True,
            mandatory = True,
        ),
        "deps": attr.label_list(
            allow_files = True,
        ),
        "data": attr.label_list(
            allow_empty = True,
            allow_files = True,
        ),
        "_gem_builder_template": attr.label(
            allow_single_file = True,
            default = Label("//rb/private:gem_builder.tpl"),
        ),
    },
    outputs = {
        "gem": "%{name}.gem",
    },
)
