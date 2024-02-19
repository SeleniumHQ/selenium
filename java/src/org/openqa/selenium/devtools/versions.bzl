CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v122",
    "v120",
    "v121",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
