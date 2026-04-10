CDP_VERSIONS = [
    "v146",
    "v144",
    "v145",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
