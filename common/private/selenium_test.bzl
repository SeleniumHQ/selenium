load(
  "//java:browsers.bzl",
  "chrome_data",
  "chrome_jvm_flags",
  "edge_data",
  "edge_jvm_flags",
  "firefox_data",
  "firefox_jvm_flags")

DEFAULT_BROWSER = "firefox"

_COMMON_TAGS = [
    "browser-test",
    "no-sandbox",
    "requires-network",
]

BROWSERS = {
    "chrome": {
        "deps": ["//java/client/src/org/openqa/selenium/chrome"],
        "jvm_flags": ["-Dselenium.browser=chrome"] + chrome_jvm_flags,
        "data": chrome_data,
        "tags": _COMMON_TAGS + ["chrome"],
    },
    "edge": {
        "deps": ["//java/client/src/org/openqa/selenium/edge"],
        "jvm_flags": ["-Dselenium.browser=edge"] + edge_jvm_flags,
        "data": edge_data,
        "tags": _COMMON_TAGS + ["edge"],
    },
    "edgehtml": {
        "deps": ["//java/client/src/org/openqa/selenium/edgehtml"],
        "jvm_flags": ["-Dselenium.browser=edgehtml"] +
                     select({
                         "//common:windows": ["-Dselenium.skiptest=false"],
                         "//conditions:default": ["-Dselenium.skiptest=true"],
                     }),
        "data": [],
        "tags": _COMMON_TAGS + ["exclusive", "edgehtml"],
    },
    "firefox": {
        "deps": ["//java/client/src/org/openqa/selenium/firefox"],
        "jvm_flags": ["-Dselenium.browser=ff"] + firefox_jvm_flags,
        "data": firefox_data,
        "tags": _COMMON_TAGS + ["firefox"],
    },
    "ie": {
        "deps": ["//java/client/src/org/openqa/selenium/ie"],
        "jvm_flags": ["-Dselenium.browser=ie"] +
                     select({
                         "//common:windows": ["-Dselenium.skiptest=false"],
                         "//conditions:default": ["-Dselenium.skiptest=true"],
                     }),
        "data": [],
        "tags": _COMMON_TAGS + ["exclusive", "ie"],
    },
    "safari": {
        "deps": ["//java/client/src/org/openqa/selenium/safari"],
        "jvm_flags": ["-Dselenium.browser=safari"] +
                     select({
                         "//common:macos": ["-Dselenium.skiptest=false"],
                         "//conditions:default": ["-Dselenium.skiptest=true"],
                     }),
        "data": [],
        "tags": _COMMON_TAGS + ["exclusive", "safari"],
    },
}

def selenium_test(name, test_class, size = "medium", browsers = None, **kwargs):
    if browsers == None:
        browsers = BROWSERS.keys()

    if len(browsers) == 0:
        fail("At least one browser must be specified.")

    default_browser = DEFAULT_BROWSER if DEFAULT_BROWSER in browsers else browsers[0]

    test_name = test_class.rpartition(".")[2]

    data = kwargs["data"] if "data" in kwargs else []
    jvm_flags = kwargs["jvm_flags"] if "jvm_flags" in kwargs else []
    tags = kwargs["tags"] if "tags" in kwargs else []

    stripped_args = dict(**kwargs)
    stripped_args.pop("data", None)
    stripped_args.pop("jvm_flags", None)
    stripped_args.pop("tags", None)

    for browser in browsers:
        if not browser in BROWSERS:
            fail("Unrecognized browser: " + browser)

        test = "%s-%s" % (name, browser)

        native.java_test(
            name = test,
            test_class = test_class,
            size = size,
            jvm_flags = BROWSERS[browser]["jvm_flags"] + jvm_flags,
            tags = BROWSERS[browser]["tags"] + tags,
            data = BROWSERS[browser]["data"] + data,
            **stripped_args
        )

        if not "no-remote" in tags:
            native.java_test(
                name = "%s-remote" % test,
                test_class = test_class,
                size = size,
                jvm_flags = BROWSERS[browser]["jvm_flags"] + jvm_flags + [
                    "-Dselenium.browser.remote=true",
                    "-Dselenium.browser.remote.path=$(location //java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar)",
                ],
                tags = BROWSERS[browser]["tags"] + tags + ["remote"],
                data = BROWSERS[browser]["data"] + data + [
                    "//java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar",
                ],
                **stripped_args
            )

    # Handy way to run everything
    native.test_suite(name = name, tests = [":%s-%s" % (name, default_browser)], tags = tags + ["manual"])
