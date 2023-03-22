CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v109",
    "v110",
    "v111",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
