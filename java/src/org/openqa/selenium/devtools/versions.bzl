CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v90",
    "v91",
    "v92",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
