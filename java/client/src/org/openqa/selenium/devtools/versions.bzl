CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v88",
    "v89",
    "v90",
    "v91",
]

CDP_DEPS = ["//java/client/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
