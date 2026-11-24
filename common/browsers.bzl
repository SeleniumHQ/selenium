load(":browser_versions.bzl", "CHROME_BETA_MAJOR_VERSION", "CHROME_MAJOR_VERSION", "EDGE_MAJOR_VERSION", "FIREFOX_BETA_MAJOR_VERSION", "FIREFOX_MAJOR_VERSION")

COMMON_TAGS = [
    "browser-test",
    # Sandboxes don't nest on macOS, so browsers can't sandbox their own processes inside Bazel's.
    "no-sandbox",
    "resources:browser:1",
]

# Per-browser keys, unlike SE_BROWSER_VERSION, don't pin the other browsers a Grid node probes.
# Edge's key follows the MicrosoftEdge browser name the bindings pass to Selenium Manager.
_SE_VERSION_ENV = {
    "chrome": "SE_CHROME_VERSION",
    "edge": "SE_MICROSOFTEDGE_VERSION",
    "firefox": "SE_FIREFOX_VERSION",
}

def pinned_version_env(browser, major_version, pinned_os = ["linux", "macos"]):
    """Has Selenium Manager use the pinned major version where the test gets no pinned browser.

    Selenium Manager reuses an installed browser of that major and otherwise downloads one.
    The env, unlike a browser Selenium Manager resolves at runtime, is part of the test's cache key.
    """
    env = {_SE_VERSION_ENV[browser]: major_version}
    if browser == "chrome":
        # Chrome for Testing rather than an installed Chrome, which has different defaults
        env["SE_FORCE_BROWSER_DOWNLOAD"] = "true"
    return select({
        "@selenium//common:use_pinned_%s_%s" % (os, browser): {}
        for os in pinned_os
    } | {
        "@selenium//common:use_pinned_browser": env,
        "//conditions:default": {},
    })

chrome_version_env = pinned_version_env("chrome", CHROME_MAJOR_VERSION)
chrome_beta_version_env = pinned_version_env("chrome", CHROME_BETA_MAJOR_VERSION)
edge_version_env = pinned_version_env("edge", EDGE_MAJOR_VERSION)
firefox_version_env = pinned_version_env("firefox", FIREFOX_MAJOR_VERSION)
firefox_beta_version_env = pinned_version_env("firefox", FIREFOX_BETA_MAJOR_VERSION)

chromedriver_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_chromedriver//:chromedriver",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chromedriver//:chromedriver",
    ],
    "@selenium//common:use_local_chromedriver": ["@selenium//common:chromedriver"],
    "//conditions:default": [],
})

chrome_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_chrome//:files",
        "@linux_chrome//:chrome-linux64/chrome",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chrome//:Chrome.app",
    ],
    "//conditions:default": [],
}) + chromedriver_data

edgedriver_data = select({
    "@selenium//common:use_pinned_linux_edge": [
        "@linux_edgedriver//:msedgedriver",
    ],
    "@selenium//common:use_pinned_macos_edge": [
        "@mac_edgedriver//:msedgedriver",
    ],
    "@selenium//common:use_local_msedgedriver": ["@selenium//common:msedgedriver"],
    "//conditions:default": [],
})

edge_data = select({
    "@selenium//common:use_pinned_linux_edge": [
        "@linux_edge//:files",
        "@linux_edge//:opt/microsoft/msedge/microsoft-edge",
    ],
    "@selenium//common:use_pinned_macos_edge": [
        "@mac_edge//:Edge.app",
    ],
    "//conditions:default": [],
}) + edgedriver_data

geckodriver_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_geckodriver//:geckodriver",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_geckodriver//:geckodriver",
    ],
    "@selenium//common:use_local_geckodriver": ["@selenium//common:geckodriver"],
    "//conditions:default": [],
})

firefox_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_firefox//:files",
        "@linux_firefox//:firefox/firefox",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_firefox//:Firefox.app",
    ],
    "//conditions:default": [],
}) + geckodriver_data

firefox_beta_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_beta_firefox//:files",
        "@linux_beta_firefox//:firefox/firefox",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_beta_firefox//:Firefox.app",
    ],
    "//conditions:default": [],
}) + geckodriver_data

chromedriver_beta_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_beta_chromedriver//:chromedriver",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_beta_chromedriver//:chromedriver",
    ],
    "@selenium//common:use_local_chromedriver": ["@selenium//common:chromedriver"],
    "//conditions:default": [],
})

chrome_beta_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_beta_chrome//:files",
        "@linux_beta_chrome//:chrome-linux64/chrome",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_beta_chrome//:Chrome.app",
    ],
    "//conditions:default": [],
}) + chromedriver_beta_data
