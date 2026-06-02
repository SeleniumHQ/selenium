load("@rules_ruby//ruby:defs.bzl", "rb_library", "rb_test")
load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_beta_data",
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
    "chrome-beta": {
        "data": chrome_beta_data,
        "deps": ["//rb/lib/selenium/webdriver:chrome"],
        "tags": [],
        "target_compatible_with": [],
        "bidi": True,
        "env": {
            "WD_REMOTE_BROWSER": "chrome",
            "WD_SPEC_DRIVER": "chrome",
            "WD_BROWSER_VERSION": "beta",
        } | select({
            "@selenium//common:use_pinned_linux_chrome": {
                "CHROME_BINARY": "$(location @linux_beta_chrome//:chrome-linux64/chrome)",
                "CHROMEDRIVER_BINARY": "$(location @linux_beta_chromedriver//:chromedriver)",
            },
            "@selenium//common:use_pinned_macos_chrome": {
                "CHROME_BINARY": "$(location @mac_beta_chrome//:Chrome.app)/Contents/MacOS/Chrome",
                "CHROMEDRIVER_BINARY": "$(location @mac_beta_chromedriver//:chromedriver)",
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
        "bidi": True,
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
        "bidi": True,
        "env": {
            "WD_REMOTE_BROWSER": "firefox",
            "WD_SPEC_DRIVER": "firefox",
            "WD_BROWSER_VERSION": "beta",
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
        "tags": [],
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
        ],
        "target_compatible_with": ["@platforms//os:macos"],
        "env": {
            "WD_REMOTE_BROWSER": "safari-preview",
            "WD_SPEC_DRIVER": "safari-preview",
        },
    },
}

DEFAULT_BROWSERS = [b for b in BROWSERS.keys() if b not in ("ie", "safari-preview")]

# Tags listed here apply only to the local target of the listed browsers.
_BROWSER_TAG_FILTERS = {
    "os-sensitive": ["chrome", "edge", "firefox", "safari"],
    "se-manager": ["chrome", "edge", "firefox", "safari"],
}

# Input tags that act as control signals (e.g. "bidi" requests a bidi variant). Stripped
# from universal_tags so they don't leak onto local/remote targets — the bidi variant
# emits "bidi" explicitly where it belongs.
_CONTROL_TAGS = ["bidi"]

def _split_filtered_tags(tags, browser):
    universal_tags = [t for t in tags if t not in _BROWSER_TAG_FILTERS and t not in _CONTROL_TAGS]
    local_tags = [t for t in tags if browser in _BROWSER_TAG_FILTERS.get(t, [])]
    return universal_tags, local_tags

def rb_integration_test(
        name,
        srcs,
        deps = [],
        data = [],
        browsers = DEFAULT_BROWSERS,
        tags = [],
        bidi_only = False,
        no_grid = False):
    # Generate a library target that is used by //rb/spec:spec to expose all tests to //rb:rubocop.
    rb_library(
        name = name,
        srcs = srcs,
        visibility = ["//rb:__subpackages__"],
    )

    for browser in browsers:
        universal_tags, local_tags = _split_filtered_tags(tags, browser)

        # Family groups beta/preview variants with their stable counterpart so
        # e.g. `--test_tag_filters=chrome` matches chrome and chrome-beta targets.
        family = browser.split("-")[0]
        family_tags = [browser, family] if family != browser else [browser]
        if not bidi_only:
            # Generate a test target for local browser execution.
            rb_test(
                name = "{}-{}".format(name, browser),
                size = "large",
                srcs = srcs,
                args = ["rb/spec/"],
                data = BROWSERS[browser]["data"] + data + ["//common/src/web"],
                env = BROWSERS[browser]["env"],
                main = "@bundle//bin:rspec",
                tags = COMMON_TAGS + BROWSERS[browser]["tags"] + universal_tags + local_tags + ["{}-local".format(browser)] + family_tags,
                deps = ["//rb/spec/integration/selenium/webdriver:spec_helper"] + BROWSERS[browser]["deps"] + deps,
                visibility = ["//rb:__subpackages__"],
                target_compatible_with = BROWSERS[browser]["target_compatible_with"],
            )

            # Generate a test target for remote browser execution (Grid).
            if not no_grid:
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
                    tags = COMMON_TAGS + BROWSERS[browser]["tags"] + universal_tags + ["{}-remote".format(browser)] + family_tags,
                    deps = ["//rb/spec/integration/selenium/webdriver:spec_helper"] + BROWSERS[browser]["deps"] + deps,
                    visibility = ["//rb:__subpackages__"],
                    target_compatible_with = BROWSERS[browser]["target_compatible_with"],
                )

        # Generate a test target for bidi browser execution on browsers that opt in.
        if ("bidi" in tags or bidi_only) and BROWSERS[browser].get("bidi", False):
            rb_test(
                name = "{}-{}-bidi".format(name, browser),
                size = "large",
                srcs = srcs,
                args = ["rb/spec/"],
                data = BROWSERS[browser]["data"] + data + ["//common/src/web"],
                env = BROWSERS[browser]["env"] | {"WEBDRIVER_BIDI": "true"},
                main = "@bundle//bin:rspec",
                tags = COMMON_TAGS + BROWSERS[browser]["tags"] + universal_tags + ["bidi", "{}-bidi".format(browser)] + family_tags,
                deps = {d: True for d in (
                    ["//rb/spec/integration/selenium/webdriver:spec_helper", "//rb/lib/selenium/webdriver:bidi"] +
                    BROWSERS[browser]["deps"] +
                    deps
                )}.keys(),
                visibility = ["//rb:__subpackages__"],
                target_compatible_with = BROWSERS[browser]["target_compatible_with"],
            )
