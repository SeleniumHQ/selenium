CDP_VERSIONS = [
    "v152",
    "v150",
    "v151",
]

LATEST_CDP_VERSION = "v" + str(max([int(v[1:]) for v in CDP_VERSIONS]))

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS] + [
    "//java/src/org/openqa/selenium/devtools/latest",
]
