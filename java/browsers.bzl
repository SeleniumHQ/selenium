chrome_jvm_flags = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "-Dwebdriver.chrome.driver=$(location @linux_chromedriver//:chromedriver)",
        "-Dwebdriver.chrome.binary=$(location @linux_chrome//:chrome-linux)/chrome",
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

edge_jvm_flags = select({
    "@selenium//common:use_pinned_macos_edge": [
        "-Dwebdriver.edge.driver=$(location @mac_edgedriver//:msedgedriver)",
        "-Dwebdriver.edge.binary=\"$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge\"",
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
