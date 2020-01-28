load("//java/private:common.bzl", "MavenInfo", "combine_jars", "explode_coordinates", "has_maven_deps")
load("//java/private:javadoc.bzl", "generate_javadoc")
load("//java/private:module.bzl", "JavaModuleInfo")
load("//java/private:pom.bzl", "PomInfo")

_TEMPLATE = """#!/usr/bin/env bash

echo "Uploading {coordinates} to {maven_repo}"
./uploader {maven_repo} {gpg_sign} {user} {password} {coordinates} pom.xml artifact.jar source.jar doc.jar
"""

def _maven_artifacts_impl(ctx):
    target = ctx.attr.target
    info = target[MavenInfo]

    coords = explode_coordinates(ctx.attr.maven_coordinates)
    artifactId = coords[1]

    # Merge together all the binary jars
    bin_jar = ctx.actions.declare_file("%s.jar" % artifactId)
    combine_jars(ctx, ctx.executable._singlejar, info.artifact_jars.to_list(), bin_jar)
    src_jar = ctx.actions.declare_file("%s-sources.jar" % artifactId)
    combine_jars(ctx, ctx.executable._singlejar, info.source_jars.to_list(), src_jar)
    doc_jar = ctx.actions.declare_file("%s-javadoc.jar" % artifactId)
    generate_javadoc(ctx, ctx.executable._javadoc, [src_jar], target[MavenInfo].transitive_runtime_jars, doc_jar)

    defaultInfo = target[DefaultInfo]

    executable = ctx.actions.declare_file("%s-publisher" % ctx.attr.name)

    maven_repo = ctx.var.get("maven_repo", "''")
    gpg_sign = ctx.var.get("gpg_sign", "'false'")
    user = ctx.var.get("maven_user", "''")
    password = ctx.var.get("maven_password", "''")

    ctx.actions.write(
        output = executable,
        is_executable = True,
        content = _TEMPLATE.format(
            coordinates = ctx.attr.maven_coordinates,
            gpg_sign = gpg_sign,
            maven_repo = maven_repo,
            password = password,
            user = user,
        ),
    )

    return [
        target[JavaInfo],
        OutputGroupInfo(
            binjar = depset([bin_jar]),
            srcjar = depset([src_jar]),
            docjar = depset([doc_jar]),
        ),
        DefaultInfo(
            files = depset([bin_jar, src_jar, doc_jar]),
            executable = executable,
            runfiles = ctx.runfiles(
                symlinks = {
                    "artifact.jar": bin_jar,
                    "doc.jar": doc_jar,
                    "pom.xml": ctx.file.pom,
                    "source.jar": src_jar,
                    "uploader": ctx.executable._uploader,
                },
                collect_data = True,
            ).merge(ctx.attr._uploader[DefaultInfo].data_runfiles),
        ),
    ]

maven_artifacts = rule(
    _maven_artifacts_impl,
    executable = True,
    attrs = {
        "maven_coordinates": attr.string(
            mandatory = True,
        ),
        "target": attr.label(
            mandatory = True,
            aspects = [has_maven_deps],
            providers = [
                [JavaInfo, JavaModuleInfo, MavenInfo], [JavaInfo, MavenInfo],
            ],
        ),
        "pom": attr.label(
            mandatory = True,
            allow_single_file = True,
            providers = [
                [PomInfo],
            ],
        ),
        "_javadoc": attr.label(
            default = "//java/client/src/org/openqa/selenium/tools/javadoc",
            cfg = "host",
            executable = True,
        ),
        "_singlejar": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools/jar:MergeJars",
            allow_files = True,
        ),
        "_uploader": attr.label(
            executable = True,
            cfg = "host",
            default = "//java/client/src/org/openqa/selenium/tools/maven:MavenPublisher",
            allow_files = True,
        ),
    },
)
