load("//third_party/java:rules.bzl", "maven_java_import")

def repack_jars(version, jars):
    for i in jars:
        native.genrule(
            name = "%s-do-repack" % i,
            srcs = [
                ":%s" % i,
                ":jarjar-rules",
            ],
            outs = ["%s-repacked.jar" % i],
            tools = [
                "//third_party/java/pantsbuild:jarjar-links",
            ],
            cmd = "$(location //third_party/java/pantsbuild:jarjar-links) process $(location :jarjar-rules) $(location :%s) $@" % i,
            visibility = ["//visibility:private"],
        )

        maven_java_import(
            name = "%s-repacked" % i,
            coords = "org.seleniumhq.selenium:%s:%s" % ("%s-repacked" % i, version),
            jar = ":%s-do-repack" % i,
            visibility = ["//visibility:private"],
        )
