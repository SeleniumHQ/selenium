load(
    "@rules_jvm_external//:defs.bzl",
    "javadoc",
    "pom_file",
)
load("@rules_jvm_external//private/rules:maven_bom_fragment.bzl", "maven_bom_fragment")
load("@rules_jvm_external//private/rules:maven_project_jar.bzl", "maven_project_jar")
load("@rules_jvm_external//private/rules:maven_publish.bzl", "maven_publish")
load("//java/private:module.bzl", "java_module")

def java_export(
        name,
        maven_coordinates,
        pom_template = None,
        hides = [],
        uses = [],
        opens_to = [],
        exports = [],
        tags = [],
        testonly = None,
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
        target = ":%s-project" % name,
        deps = kwargs.get("deps", []) + kwargs.get("runtime_deps", []),
        exports = exports,
        hides = hides,
        opens_to = opens_to,
        tags = tags,
        uses = uses,
    )

    native.filegroup(
        name = "%s-maven-module" % name,
        srcs = [
            ":%s-module" % name,
        ],
        output_group = "module_jar",
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
        artifact_jar = ":%s-maven-module" % name,
        source_jar = ":%s-maven-source" % name,
        visibility = visibility,
    )

    # We may want to aggregate several `java_export` targets into a single Maven BOM POM
    # https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#bill-of-materials-bom-poms
    maven_bom_fragment(
        name = "%s.bom-fragment" % name,
        maven_coordinates = maven_coordinates,
        artifact = ":%s" % lib_name,
        src_artifact = ":%s-maven-source" % name,
        javadoc_artifact = None if "no-javadocs" in tags else ":%s-docs" % name,
        pom = ":%s-pom" % name,
        testonly = testonly,
        tags = tags,
        visibility = visibility,
    )

    # Finally, alias the primary output
    native.alias(
        name = name,
        actual = ":%s-module" % name,
        visibility = visibility,
    )
