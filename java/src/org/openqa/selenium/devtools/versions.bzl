CDP_VERSIONS = [
    "v146",
    "v147",
    "v145",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
