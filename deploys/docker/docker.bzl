load("@rules_oci//oci:defs.bzl", "oci_image", "oci_push")

def docker_image(name, repo_tags = [], ports = [], visibility = None, **kwargs):
    if len(ports) != 0:
        print("Ignoring ports on generated image %s: https://github.com/bazel-contrib/rules_oci/issues/220" % name)

    oci_image(
        name = name,
        visibility = visibility,
        **kwargs
    )

    oci_push(
        name = "%s.push" % name,
        image = ":%s" % name,
        remote_tags = repo_tags,
        repository = "index.docker.io/shs/%s" % name,
        visibility = visibility,
    )
