chrome_data = select({
    "//common:use_pinned_linux_chrome": [
        "@linux_chromedriver//:chromedriver",
        "@linux_chrome//:chrome-linux",
    ],
    "//common:use_pinned_macos_chrome": [
        "@mac_chromedriver//:chromedriver",
        "@mac_chrome//:Chromium.app",
    ],
    "//common:use_local_chromedriver": ["//common:chromedriver"],
    "//conditions:default": [],
})

chrome_jvm_flags = select({
    "//common:use_pinned_linux_chrome": [
        "-Dwebdriver.chrome.driver=$(location @linux_chromedriver//:chromedriver)",
        "-Dwebdriver.chrome.binary=$(location @linux_chrome//:chrome-linux)/linux-chrome/chrome",
    ],
    "//common:use_pinned_macos_chrome": [
        "-Dwebdriver.chrome.driver=$(location @mac_chromedriver//:chromedriver)",
        "-Dwebdriver.chrome.binary=$(location @mac_chrome//:Chromium.app)/Contents/MacOS/Chromium",
    ],
    "//common:use_local_chromedriver": [
        "-Dwebdriver.chrome.driver=$(location //common:chromedriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
})

edge_data = select({
    "//common:use_pinned_macos_chrome": [
        "@mac_edgedriver//:msedgedriver",
        "@mac_edge//:Edge.app",
    ],
    "//common:use_local_msedgedriver": ["//common:msedgedriver"],
    "//conditions:default": [],
})

edge_jvm_flags = select({
    "//common:use_pinned_macos_edge": [
        "-Dwebdriver.edge.driver=$(location @mac_edgedriver//:msedgedriver)",
        "-Dwebdriver.edge.binary=\"$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge Canary\"",
    ],
    "//common:use_local_msedgedriver": [
        "-Dwebdriver.edge.driver=$(location //common:msedgedriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
})

firefox_data = select({
    "//common:use_pinned_linux_firefox": [
        "@linux_geckodriver//:geckodriver",
        "@linux_firefox//:firefox",
    ],
    "//common:use_pinned_macos_firefox": [
        "@mac_geckodriver//:geckodriver",
        "@mac_firefox//:Firefox.app",
    ],
    "//common:use_local_geckodriver": ["//common:geckodriver"],
    "//conditions:default": [],
})

firefox_jvm_flags = select({
    "//common:use_pinned_linux_firefox": [
        "-Dwebdriver.gecko.driver=$(location @linux_geckodriver//:geckodriver)",
        "-Dwebdriver.firefox.bin=$(location @linux_firefox//:firefox)/firefox",
    ],
    "//common:use_pinned_macos_firefox": [
        "-Dwebdriver.gecko.driver=$(location @mac_geckodriver//:geckodriver)",
        "-Dwebdriver.firefox.bin=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
    ],
    "//common:use_local_geckodriver": [
        "-Dwebdriver.gecko.driver=$(location //common:geckodriver)",
    ],
    "//conditions:default": [
        "-Dselenium.skiptest=true",
    ],
})
