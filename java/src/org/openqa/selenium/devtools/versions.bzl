CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v112",
    "v113",
    "v114",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
