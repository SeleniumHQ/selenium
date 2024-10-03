CDP_VERSIONS = [
    "v85",  # Required by Firefox
    "v128",
    "v129",
    "v127",
]

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
