CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v119",
    "v120",
    "v118",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
