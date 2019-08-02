def _first_output(attr, name):
    return attr[OutputGroupInfo][name].to_list()[0]

def _maven_publish_impl(ctx):
    binjar = _first_output(ctx.attr.artifacts, "binjar")
    srcjar = _first_output(ctx.attr.artifacts, "srcjar")
    pom = _first_output(ctx.attr.pom, "pom")

    executable = ctx.actions.declare_file("%s-publisher" % ctx.attr.name)

    maven_repo = ctx.var.get("maven_repo", "''")
    gpg_password = ctx.var.get("gpg_password", "''")
    user = ctx.var.get("maven_user", "''")
    password = ctx.var.get("maven_password", "''")

    ctx.actions.expand_template(
        template = ctx.file._template,
        output = executable,
        is_executable = True,
        substitutions = {
            "{coordinates}": ctx.attr.coordinates,
            "{gpg_password}": gpg_password,
            "{maven_repo}": maven_repo,
            "{password}": password,
            "{user}": user,
        },
    )

    return [
        DefaultInfo(
            files = depset([executable]),
            executable = executable,
            runfiles = ctx.runfiles(
               symlinks = {
                   "artifact.jar": binjar,
                   "artifact-source.jar": srcjar,
                   "pom.xml": pom,
                   "uploader": ctx.executable._uploader,
               },
               collect_data = True).merge(ctx.attr._uploader[DefaultInfo].data_runfiles),
        )
    ]

maven_publish = rule(
    _maven_publish_impl,
    executable = True,
    attrs = {
        "coordinates": attr.string(
            mandatory = True,
        ),
        "artifacts": attr.label(
            mandatory = True,
        ),
        "pom": attr.label(
            mandatory = True,
        ),
        "_template": attr.label(
            default = "//java/private:maven_upload.txt",
            allow_single_file = True,
        ),
        "_uploader": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools:MavenPublisher",
            allow_files = True,
        ),
    },
)
