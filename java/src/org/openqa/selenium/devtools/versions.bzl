CDP_VERSIONS = [
    "v143",
    "v144",
    "v142",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
