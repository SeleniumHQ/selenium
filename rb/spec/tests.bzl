load("@rules_ruby//ruby:defs.bzl", "rb_test")
load("//common:browsers.bzl", "chrome_data")

ENV = select({
    "//rb/spec/integration:chrome": {
        "WD_REMOTE_BROWSER": "chrome",
        "WD_SPEC_DRIVER": "chrome",
    },
    "//rb/spec/integration:edge": {
        "WD_REMOTE_BROWSER": "edge",
        "WD_SPEC_DRIVER": "edge",
    },
    "//rb/spec/integration:firefox": {
        "WD_REMOTE_BROWSER": "firefox",
        "WD_SPEC_DRIVER": "firefox",
    },
    "//rb/spec/integration:ie": {
        "WD_REMOTE_BROWSER": "ie",
        "WD_SPEC_DRIVER": "ie",
    },
    "//rb/spec/integration:safari": {
        "WD_REMOTE_BROWSER": "safari",
        "WD_SPEC_DRIVER": "safari",
    },
    "//rb/spec/integration:safari-preview": {
        "WD_REMOTE_BROWSER": "safari-preview",
        "WD_SPEC_DRIVER": "safari-preview",
    },
    "//conditions:default": {},
}) | select({
    "//rb/spec/integration:remote": {
        "WD_SPEC_DRIVER": "remote",
    },
    "//conditions:default": {},
}) | select({
    "//rb/spec/integration:headless": {
        "HEADLESS": "true",
    },
    "//conditions:default": {},
}) | select({
    "@selenium//common:use_pinned_linux_chrome": {
        "CHROME_BINARY": "$(location @linux_chrome//:chrome-linux64/chrome)",
        "CHROMEDRIVER_BINARY": "$(location @linux_chromedriver//:chromedriver)",
    },
    "@selenium//common:use_pinned_macos_chrome": {
        "CHROME_BINARY": "$(location @mac_chrome//:Chrome.app)/Contents/MacOS/Chrome",
        "CHROMEDRIVER_BINARY": "$(location @mac_chromedriver//:chromedriver)",
    },
    "//conditions:default": {},
})

# We have to use no-sandbox at the moment because Firefox crashes
# when run under sandbox: https://bugzilla.mozilla.org/show_bug.cgi?id=1382498.
# For Chromium-based browser, we can just pass `--no-sandbox` flag.
TAGS = ["no-sandbox"]

def rb_integration_test(name, srcs, deps, tags = []):
    rb_test(
        name = name,
        size = "large",
        srcs = srcs,
        args = ["rb/spec/"],
        data = chrome_data + ["//common/src/web"],
        env = ENV,
        main = "@bundle//bin:rspec",
        tags = TAGS + tags,
        deps = deps + ["//rb/spec/integration/selenium/webdriver:spec_helper"],
        visibility = ["//rb:__subpackages__"],
    )

def rb_unit_test(name, srcs, deps, data = []):
    rb_test(
        name = name,
        size = "small",
        srcs = srcs,
        args = ["rb/spec/"],
        main = "@bundle//bin:rspec",
        data = data,
        tags = TAGS,
        deps = deps + [
            "//rb/spec/unit/selenium/webdriver:spec_helper",
            "@bundle",
        ],
        visibility = ["//rb:__subpackages__"],
    )
