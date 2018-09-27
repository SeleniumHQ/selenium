java_library(
    name = "server",
    srcs = glob(["*.java"]),
    provided_deps = [
        "//third_party/java/servlet:javax.servlet-api",
    ],
    exported_deps = [
        "//java/server/src/org/openqa/selenium/grid/component:component",
    ],
    deps = [
        "//java/client/src/org/openqa/selenium/remote:remote",
        "//java/server/src/org/openqa/selenium/injector:injector",
        "//java/server/src/org/openqa/selenium/grid/config:config",
        "//java/server/src/org/openqa/selenium/grid/web:web",
        "//third_party/java/beust:jcommander",
        "//third_party/java/guava:guava",
        "//third_party/java/jetty:jetty",
    ],
    visibility = [
        "//java/server/...",
    ]
)
