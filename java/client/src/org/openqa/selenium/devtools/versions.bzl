CDP_VERSIONS = [
    "v86",
    "v87",
    "v88",
    "v89",
]

CDP_DEPS = ["//java/client/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS]
