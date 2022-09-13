CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v103",
    "v104",
    "v105"
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
