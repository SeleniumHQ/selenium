load("//java/private:artifact.bzl", "maven_artifacts")
load("//java/private:pom.bzl", "pom_file")
load("//java/private:common.bzl", "determine_name", "has_maven_deps", "MAVEN_PREFIX")

def java_export(
        name,
        maven_coordinates=None,
        pom_template=None,
        tags=[],
        srcs=None,
        deps=None,
        exports=None,
        resources=None,
        runtime_deps=None,
        neverlink=False,
        visibility=None):

    actual_tags = tags
    if maven_coordinates:
        actual_tags = tags + ["%s%s" % (MAVEN_PREFIX, maven_coordinates)]
        if not pom_template:
            fail("java_export requires pom_template to be set if coordinates given: %s" % maven_coordinates)

    native.java_library(
        name = name,
        srcs = srcs,
        resources = resources,
        deps = deps,
        exports = exports,
        runtime_deps = runtime_deps,
        tags = actual_tags,
        visibility = visibility)

    pom_file(
        name = "%s-maven-pom" % name,
        target = ":%s" % name,
        out = "%s-pom.xml" % name,
        template = pom_template,
        visibility = visibility,
    )

    maven_artifacts(
        name = "%s-maven" % name,
        target = ":%s" % name,
        pom = ":%s-pom" % name,
        visibility = visibility
    )
