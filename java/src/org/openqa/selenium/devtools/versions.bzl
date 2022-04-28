CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v99",
    "v100",
    "v101",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
