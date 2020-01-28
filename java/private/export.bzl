load("//java/private:common.bzl", "MAVEN_PREFIX")
load("//java/private:module.bzl", "java_module")
load("//java/private:maven_artifacts.bzl", "maven_artifacts")
load("//java/private:pom.bzl", "pom_file")

def java_export(
        name,
        maven_coordinates,
        pom_template,
        hides = [],
        uses = [],
        exports = [],
        visibility = None,
        **kwargs):
    tags = getattr(kwargs, "tags", [])

    # Construct the java library, or something that looks like one
    native.java_library(
        name = "generated-%s-lib" % name,
        exports = exports,
        **kwargs
    )

    # Construct a java_module
    java_module(
        name = name,
        deps = [":generated-%s-lib" % name],
        exports = exports,
        hides = hides,
        uses = uses,
        tags = [
            "maven_coordinates=%s" % maven_coordinates,
        ],
        visibility = visibility,
    )

    # Now create the pom file
    pom_file(
        name = "%s-pom" % name,
        target = name,
        out = "%s-pom.xml" % name,
        template = pom_template,
    )

    # Build the maven artifacts.
    maven_artifacts(
        name = "%s-maven-artifacts" % name,
        maven_coordinates = maven_coordinates,
        target = name,
        pom = "%s-pom" % name,
        visibility = visibility,
    )
