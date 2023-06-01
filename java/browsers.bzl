chromedriver_jvm_flags = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "-Dwebdriver.chrome.driver=$(location @linux_chromedriver//:chromedriver)",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "-Dwebdriver.chrome.driver=$(location @mac_chromedriver//:chromedriver)",
    ],
    "//conditions:default": [],
})

chrome_jvm_flags = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "-Dwebdriver.chrome.binary=$(location @linux_chrome//:chrome-linux/chrome)",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "-Dwebdriver.chrome.binary=$(location @mac_chrome//:Chromium.app)/Contents/MacOS/Chromium",
    ],
    "@selenium//common:use_local_chromedriver": [],
    "//conditions:default": [
        "-Dselenium.skiptest=false",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
    "//conditions:default": [],
}) + chromedriver_jvm_flags

edgedriver_jvm_flags = select({
    "@selenium//common:use_pinned_macos_edge": [
        "-Dwebdriver.edge.driver=$(location @mac_edgedriver//:msedgedriver)",
    ],
    "//conditions:default": [],
})

edge_jvm_flags = select({
    "@selenium//common:use_pinned_macos_edge": [
        "-Dwebdriver.edge.binary=\"$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge\"",
    ],
    "@selenium//common:use_local_msedgedriver": [],
    "//conditions:default": [
        "-Dselenium.skiptest=false",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
    "//conditions:default": [],
}) + edgedriver_jvm_flags

geckodriver_jvm_flags = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "-Dwebdriver.gecko.driver=$(location @linux_geckodriver//:geckodriver)",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "-Dwebdriver.gecko.driver=$(location @mac_geckodriver//:geckodriver)",
    ],
    "//conditions:default": [],
})

firefox_jvm_flags = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "-Dwebdriver.firefox.bin=$(location @linux_firefox//:firefox/firefox)",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "-Dwebdriver.firefox.bin=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
    ],
    "@selenium//common:use_local_geckodriver": [],
    "//conditions:default": [
        "-Dselenium.skiptest=false",
    ],
}) + select({
    "@selenium//common:use_headless_browser": [
        "-Dwebdriver.headless=true",
    ],
    "//conditions:default": [],
}) + geckodriver_jvm_flags
