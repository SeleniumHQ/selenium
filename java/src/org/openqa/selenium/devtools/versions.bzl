CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v115",
    "v116",
    "v117",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
