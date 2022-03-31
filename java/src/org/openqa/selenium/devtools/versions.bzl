CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v98",
    "v99",
    "v100"
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
