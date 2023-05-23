CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v111",
    "v112",
    "v113",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
