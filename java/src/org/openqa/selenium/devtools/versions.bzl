CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v105",
    "v106",
    "v107",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
