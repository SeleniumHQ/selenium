CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v114",
    "v115",
    "v116",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
