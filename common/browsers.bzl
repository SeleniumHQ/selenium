COMMON_TAGS = [
    "browser-test",
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
        "@linux_chrome//:chrome-linux/chrome",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chrome//:Chromium.app",
    ],
    "//conditions:default": [],
}) + chromedriver_data

edgedriver_data = select({
    "@selenium//common:use_pinned_macos_edge": [
        "@mac_edgedriver//:msedgedriver",
    ],
    "@selenium//common:use_local_msedgedriver": ["@selenium//common:msedgedriver"],
    "//conditions:default": [],
})

edge_data = select({
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
