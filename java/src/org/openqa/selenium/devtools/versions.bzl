CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v125",
    "v126",
    "v124",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
