load("//java/private:common.bzl", "MAVEN_PREFIX")
load("//java/private:module.bzl", "java_module")
#load("//java/private:maven_artifacts.bzl", "maven_artifacts")
#load("//java/private:pom.bzl", "pom_file")
#load("//java/private:publish.bzl", "maven_publish")

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

#    # Build the maven artifacts. The output of this has the same JavaInfo as
#    # the lib, but also has maven coordinates added.
#    actual_tags = [] + tags + ["%s%s" % (MAVEN_PREFIX, maven_coordinates)]
#    maven_artifacts(
#        name = name,
#        tags = actual_tags,
#        maven_coordinates = maven_coordinates,
#        module_uses_services = module_uses_services,
#        module_exclude_patterns = module_exclude_patterns,
#        target = "%s-base-lib" % name,
#        binjar = "%s-binary.jar" % name,
#        srcjar = "%s-sources.jar" % name,
#        visibility = visibility,
#    )
#
#    # Now create the pom file
#    pom_file(
#        name = "%s-pom" % name,
#        target = name,
#        out = "%s-pom.xml" % name,
#        template = pom_template,
#    )
#
#    # And set up the publishing task
#    maven_publish(
#        name = "%s-publish" % name,
#        maven_coordinates = maven_coordinates,
#        artifacts = name,
#        pom = "%s-pom.xml" % name,
#    )
