CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v92",
    "v93",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
