CDP_VERSIONS = [
    "v140",
    "v138",
    "v139",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
