java_library(
    name = "node",
    srcs = glob(["*.java"]),
    deps = [
        "//java/client/src/org/openqa/selenium/chrome:chrome",
        "//java/client/src/org/openqa/selenium/firefox:firefox",
    ],
    visibility = [
        "//java/server/src/org/openqa/selenium/remote/server:standalone-server-lib",
        "//java/server/test/org/openqa/grid/selenium/node:",
        "//java/server/test/org/openqa/selenium/remote/server:tests",
    ],
)
