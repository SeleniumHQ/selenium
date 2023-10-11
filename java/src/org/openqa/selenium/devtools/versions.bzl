CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v116",
    "v117",
    "v118",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
