COMMON_TAGS = [
    "browser-test",
    # We have to use no-sandbox at the moment because Firefox crashes
    # when run under sandbox: https://bugzilla.mozilla.org/show_bug.cgi?id=1382498.
    # For Chromium-based browser, we can just pass `--no-sandbox` flag.
    "no-sandbox",
    "requires-network",
]

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
