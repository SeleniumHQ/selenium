CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v113",
    "v114",
    "v115",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
