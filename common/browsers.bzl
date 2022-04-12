COMMON_TAGS = [
    "browser-test",
    "no-sandbox",
    "requires-network",
]

chrome_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_chromedriver//:chromedriver",
        "@linux_chrome//:chrome-linux",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chromedriver//:chromedriver",
        "@mac_chrome//:Chromium.app",
    ],
    "@selenium//common:use_local_chromedriver": ["@selenium//common:chromedriver"],
    "//conditions:default": [],
})

edge_data = select({
    "@selenium//common:use_pinned_macos_edge": [
        "@mac_edgedriver//:msedgedriver",
        "@mac_edge//:Edge.app",
    ],
    "@selenium//common:use_local_msedgedriver": ["@selenium//common:msedgedriver"],
    "//conditions:default": [],
})

firefox_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_geckodriver//:geckodriver",
        "@linux_firefox//:firefox",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_geckodriver//:geckodriver",
        "@mac_firefox//:Firefox.app",
    ],
    "@selenium//common:use_local_geckodriver": ["@selenium//common:geckodriver"],
    "//conditions:default": [],
})
