CDP_VERSIONS = [
    "v137",
    "v138",
    "v139",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
