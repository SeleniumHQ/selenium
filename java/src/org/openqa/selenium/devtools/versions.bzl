CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v100",
    "v101",
    "v102"
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
