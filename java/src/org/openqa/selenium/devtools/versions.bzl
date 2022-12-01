CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v106",
    "v107",
    "v108",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
