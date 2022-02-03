CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v96",
    "v97",
    "v98"
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
