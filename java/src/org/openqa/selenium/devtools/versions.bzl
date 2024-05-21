CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v125",
    "v123",
    "v124",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
