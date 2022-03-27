CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v97",
    "v98",
    "v99",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
