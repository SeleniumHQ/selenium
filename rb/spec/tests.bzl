load("@rules_ruby//ruby:defs.bzl", "rb_library", "rb_test")
load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_data",
    "edge_data",
    "firefox_beta_data",
    "firefox_data",
)

BROWSERS = {
    "chrome": {
        "data": chrome_data,
        "deps": ["//rb/lib/selenium/webdriver:chrome"],
        "tags": [],
        "target_compatible_with": [],
        "env": {
            "WD_REMOTE_BROWSER": "chrome",
            "WD_SPEC_DRIVER": "chrome",
        } | select({
            "@selenium//common:use_pinned_linux_chrome": {
                "CHROME_BINARY": "$(location @linux_chrome//:chrome-linux64/chrome)",
                "CHROMEDRIVER_BINARY": "$(location @linux_chromedriver//:chromedriver)",
            },
            "@selenium//common:use_pinned_macos_chrome": {
                "CHROME_BINARY": "$(location @mac_chrome//:Chrome.app)/Contents/MacOS/Chrome",
                "CHROMEDRIVER_BINARY": "$(location @mac_chromedriver//:chromedriver)",
            },
            "//conditions:default": {},
        }) | select({
            "@selenium//common:use_headless_browser": {"HEADLESS": "true"},
            "//conditions:default": {},
        }),
    },
    "edge": {
        "data": edge_data,
        "deps": ["//rb/lib/selenium/webdriver:edge"],
        "tags": [],
        "target_compatible_with": [],
        "env": {
            "WD_REMOTE_BROWSER": "edge",
            "WD_SPEC_DRIVER": "edge",
        } | select({
            "@selenium//common:use_pinned_linux_edge": {
                "EDGE_BINARY": "$(location @linux_edge//:opt/microsoft/msedge/microsoft-edge)",
                "MSEDGEDRIVER_BINARY": "$(location @linux_edgedriver//:msedgedriver)",
            },
            "@selenium//common:use_pinned_macos_edge": {
                "EDGE_BINARY": "$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft\\ Edge",
                "MSEDGEDRIVER_BINARY": "$(location @mac_edgedriver//:msedgedriver)",
            },
            "//conditions:default": {},
        }) | select({
            "@selenium//common:use_headless_browser": {"HEADLESS": "true"},
            "//conditions:default": {},
        }),
    },
    "firefox": {
        "data": firefox_data,
        "deps": ["//rb/lib/selenium/webdriver:firefox"],
        "tags": [],
        "target_compatible_with": [],
        "env": {
            "WD_REMOTE_BROWSER": "firefox",
            "WD_SPEC_DRIVER": "firefox",
        } | select({
            "@selenium//common:use_pinned_linux_firefox": {
                "FIREFOX_BINARY": "$(location @linux_firefox//:firefox/firefox)",
                "GECKODRIVER_BINARY": "$(location @linux_geckodriver//:geckodriver)",
            },
            "@selenium//common:use_pinned_macos_firefox": {
                "FIREFOX_BINARY": "$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
                "GECKODRIVER_BINARY": "$(location @mac_geckodriver//:geckodriver)",
            },
            "//conditions:default": {},
        }) | select({
            "@selenium//common:use_headless_browser": {"HEADLESS": "true"},
            "//conditions:default": {},
        }),
    },
    "firefox-beta": {
        "data": firefox_beta_data,
        "deps": ["//rb/lib/selenium/webdriver:firefox"],
        "tags": [],
        "target_compatible_with": [],
        "env": {
            "WD_REMOTE_BROWSER": "firefox",
            "WD_SPEC_DRIVER": "firefox",
        } | select({
            "@selenium//common:use_pinned_linux_firefox": {
                "FIREFOX_BINARY": "$(location @linux_beta_firefox//:firefox/firefox)",
                "GECKODRIVER_BINARY": "$(location @linux_geckodriver//:geckodriver)",
            },
            "@selenium//common:use_pinned_macos_firefox": {
                "FIREFOX_BINARY": "$(location @mac_beta_firefox//:Firefox.app)/Contents/MacOS/firefox",
                "GECKODRIVER_BINARY": "$(location @mac_geckodriver//:geckodriver)",
            },
            "//conditions:default": {},
        }) | select({
            "@selenium//common:use_headless_browser": {"HEADLESS": "true"},
            "//conditions:default": {},
        }),
    },
    "ie": {
        "data": [],
        "deps": ["//rb/lib/selenium/webdriver:ie"],
        "tags": [
            "skip-remote",  # RBE is Linux-only.
        ],
        "target_compatible_with": ["@platforms//os:windows"],
        "env": {
            "WD_REMOTE_BROWSER": "ie",
            "WD_SPEC_DRIVER": "ie",
        },
    },
    "safari": {
        "data": [],
        "deps": ["//rb/lib/selenium/webdriver:safari"],
        "tags": [
            "exclusive-if-local",  # Safari cannot run in parallel.
            "skip-remote",  # RBE is Linux-only.
        ],
        "target_compatible_with": ["@platforms//os:macos"],
        "env": {
            "WD_REMOTE_BROWSER": "safari",
            "WD_SPEC_DRIVER": "safari",
        },
    },
    "safari-preview": {
        "data": [],
        "deps": ["//rb/lib/selenium/webdriver:safari"],
        "tags": [
            "exclusive-if-local",  # Safari cannot run in parallel.
            "skip-remote",  # RBE is Linux-only.
        ],
        "target_compatible_with": ["@platforms//os:macos"],
        "env": {
            "WD_REMOTE_BROWSER": "safari-preview",
            "WD_SPEC_DRIVER": "safari-preview",
        },
    },
}

def rb_integration_test(name, srcs, deps = [], data = [], browsers = BROWSERS.keys(), tags = []):
    # Generate a library target that is used by //rb/spec:spec to expose all tests to //rb:lint.
    rb_library(
        name = name,
        srcs = srcs,
        visibility = ["//rb:__subpackages__"],
    )

    for browser in browsers:
        # Generate a test target for local browser execution.
        rb_test(
            name = "{}-{}".format(name, browser),
            size = "large",
            srcs = srcs,
            args = ["rb/spec/"],
            data = BROWSERS[browser]["data"] + data + ["//common/src/web"],
            env = BROWSERS[browser]["env"],
            main = "@bundle//bin:rspec",
            tags = COMMON_TAGS + BROWSERS[browser]["tags"] + tags + [browser],
            deps = ["//rb/spec/integration/selenium/webdriver:spec_helper"] + BROWSERS[browser]["deps"] + deps,
            visibility = ["//rb:__subpackages__"],
            target_compatible_with = BROWSERS[browser]["target_compatible_with"],
        )

        # Generate a test target for remote browser execution (Grid).
        rb_test(
            name = "{}-{}-remote".format(name, browser),
            size = "large",
            srcs = srcs,
            args = ["rb/spec/"],
            data = BROWSERS[browser]["data"] + data + [
                "//common/src/web",
                "//java/src/org/openqa/selenium/grid:selenium_server_deploy.jar",
                "//rb/spec:java-location",
                "@bazel_tools//tools/jdk:current_java_runtime",
            ],
            env = BROWSERS[browser]["env"] | {
                "WD_BAZEL_JAVA_LOCATION": "$(rootpath //rb/spec:java-location)",
                "WD_SPEC_DRIVER": "remote",
            },
            main = "@bundle//bin:rspec",
            tags = COMMON_TAGS + BROWSERS[browser]["tags"] + tags + ["{}-remote".format(browser)],
            deps = ["//rb/spec/integration/selenium/webdriver:spec_helper"] + BROWSERS[browser]["deps"] + deps,
            visibility = ["//rb:__subpackages__"],
            target_compatible_with = BROWSERS[browser]["target_compatible_with"],
        )

        # Generate a test target for bidi browser execution.
        rb_test(
            name = "{}-{}-bidi".format(name, browser),
            size = "large",
            srcs = srcs,
            args = ["rb/spec/"],
            data = BROWSERS[browser]["data"] + data + ["//common/src/web"],
            env = BROWSERS[browser]["env"] | {"WEBDRIVER_BIDI": "true"},
            main = "@bundle//bin:rspec",
            tags = COMMON_TAGS + BROWSERS[browser]["tags"] + tags + ["{}-bidi".format(browser)],
            deps = depset(
                ["//rb/spec/integration/selenium/webdriver:spec_helper", "//rb/lib/selenium/webdriver:bidi"] +
                BROWSERS[browser]["deps"] +
                deps,
            ),
            visibility = ["//rb:__subpackages__"],
            target_compatible_with = BROWSERS[browser]["target_compatible_with"],
        )

def rb_unit_test(name, srcs, deps, data = []):
    rb_test(
        name = name,
        size = "small",
        srcs = srcs,
        args = ["rb/spec/"],
        main = "@bundle//bin:rspec",
        data = data,
        tags = ["no-sandbox"],  # TODO: Do we need this?
        deps = ["//rb/spec/unit/selenium/webdriver:spec_helper"] + deps,
        visibility = ["//rb:__subpackages__"],
    )
