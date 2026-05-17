CDP_VERSIONS = [
    "v146",
    "v147",
    "v148",
]

# Highest-numbered entry of CDP_VERSIONS. The "latest" alias artifact
# (//java/src/org/openqa/selenium/devtools/latest) republishes its classes under
# the org.openqa.selenium.devtools.latest package so downstream users can depend
# on a stable coordinate that always follows the newest supported CDP version.
# We compute the max numerically (rather than CDP_VERSIONS[-1]) because the
# scripts/update_cdp.py rewriter does an in-place substring replacement that
# does not preserve list ordering.
LATEST_CDP_VERSION = max(CDP_VERSIONS, key = lambda v: int(v[1:]))

CDP_DEPS = ["//java/src/org/openqa/selenium/devtools/%s" % v for v in CDP_VERSIONS] + [
    "//java/src/org/openqa/selenium/devtools/latest",
]
