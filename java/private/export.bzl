load(
  "@rules_jvm_external//:defs.bzl",
  "javadoc",
  _java_export = "java_export",
  "pom_file")
load("@rules_jvm_external//private/rules:maven_project_jar.bzl", "maven_project_jar")
load("@rules_jvm_external//private/rules:maven_publish.bzl", "maven_publish")
load("//java/private:module.bzl", "java_module")

def java_export(
        name,
        maven_coordinates,
        pom_template = None,
        hides = [],
        uses = [],
        exports = [],
        tags = [],
        visibility = None,
        **kwargs):
    tags = tags + ["maven_coordinates=%s" % maven_coordinates]
    lib_name = "%s-lib" % name

    # Construct the java_library we'll export from here.
    native.java_library(
        name = lib_name,
        tags = tags,
        exports = exports,
        **kwargs
    )

    # Merge the jars to create the maven project jar
    maven_project_jar(
        name = "%s-project" % name,
        target = ":%s" % lib_name,
        tags = tags,
    )

    native.filegroup(
        name = "%s-maven-artifact" % name,
        srcs = [
            ":%s-project" % name,
        ],
        output_group = "maven_artifact",
    )

    native.filegroup(
        name = "%s-maven-source" % name,
        srcs = [
            ":%s-project" % name,
        ],
        output_group = "maven_source",
    )

    java_module(
       name = "%s-module" % name,
       target = "%s-project" % name,
       deps = kwargs.get("deps", []) + kwargs.get("runtime_deps", []),
       exports = exports,
       tags = tags,
    )

    javadoc(
        name = "%s-docs" % name,
        deps = [
            ":%s-project" % name,
        ],
    )

    pom_file(
        name = "%s-pom" % name,
        target = ":%s" % lib_name,
        pom_template = pom_template,
    )

    maven_publish(
        name = "%s.publish" % name,
        coordinates = maven_coordinates,
        pom = "%s-pom" % name,
        javadocs = "%s-docs" % name,
        artifact_jar = ":%s-maven-artifact" % name,
        source_jar = ":%s-maven-source" % name,
        visibility = visibility,
    )

    # Finally, alias the primary output
    native.alias(
        name = name,
        actual = ":%s-module" % name,
        visibility = visibility,
    )
