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

chrome_jvm_flags = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "-Dwebdriver.chrome.driver=$(location @linux_chromedriver//:chromedriver)",
        "-Dwebdriver.chrome.binary=$(location @linux_chrome//:chrome-linux)/linux-chrome/chrome",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "-Dwebdriver.chrome.driver=$(location @mac_chromedriver//:chromedriver)",
        "-Dwebdriver.chrome.binary=$(location @mac_chrome//:Chromium.app)/Contents/MacOS/Chromium",
    ],
    "@selenium//common:use_local_chromedriver": [
        "-Dwebdriver.chrome.driver=$(location @selenium//common:chromedriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
    "//conditions:default": [],
})

edge_data = select({
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_edgedriver//:msedgedriver",
        "@mac_edge//:Edge.app",
    ],
    "@selenium//common:use_local_msedgedriver": ["@selenium//common:msedgedriver"],
    "//conditions:default": [],
})

edge_jvm_flags = select({
    "@selenium//common:use_pinned_macos_edge": [
        "-Dwebdriver.edge.driver=$(location @mac_edgedriver//:msedgedriver)",
        "-Dwebdriver.edge.binary=\"$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge Beta\"",
    ],
    "@selenium//common:use_local_msedgedriver": [
        "-Dwebdriver.edge.driver=$(location @selenium//common:msedgedriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
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

firefox_jvm_flags = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "-Dwebdriver.gecko.driver=$(location @linux_geckodriver//:geckodriver)",
        "-Dwebdriver.firefox.bin=$(location @linux_firefox//:firefox)/firefox",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "-Dwebdriver.gecko.driver=$(location @mac_geckodriver//:geckodriver)",
        "-Dwebdriver.firefox.bin=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
    ],
    "@selenium//common:use_local_geckodriver": [
        "-Dwebdriver.gecko.driver=$(location @selenium//common:geckodriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
    "//conditions:default": [],
})
