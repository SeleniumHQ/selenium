load("@rules_oci//oci:defs.bzl", "oci_image", "oci_tarball")

def docker_image(name, repo_tags = [], ports = [], visibility = None, **kwargs):
    if len(ports) != 0:
        print("Ignoring ports on generated image %s: https://github.com/bazel-contrib/rules_oci/issues/220" % name)

    oci_image(
        name = name,
        visibility = visibility,
        **kwargs
    )

    oci_tarball(
        name = "%s.tar" % name,
        image = ":%s" % name,
        repo_tags = repo_tags,
        visibility = visibility,
    )
