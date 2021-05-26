load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_data",
    "edge_data",
    "firefox_data",
)

headless_args = select({
    "@selenium//common:use_headless_browser": [
        "--headless=true",
    ],
    "//conditions:default": [],
})

chrome_args = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "--driver-binary=$(location @linux_chromedriver//:chromedriver)",
        "--browser-binary=$(location @linux_chrome//:chrome-linux)/chrome",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "--driver-binary=$(location @mac_chromedriver//:chromedriver)",
        "--browser-binary=$(location @mac_chrome//:Chromium.app)/Contents/MacOS/Chromium",
    ],
    "@selenium//common:use_local_chromedriver": [
        "--driver-binary=$(location @selenium//common:chromedriver)",
    ],
    "//conditions:default": [],
}) + headless_args

edge_args = select({
    "@selenium//common:use_pinned_macos_edge": [
        "--driver-binary=$(location @mac_edgedriver//:msedgedriver)",
        "--browser-binary='$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge'",
    ],
    "@selenium//common:use_local_msedgedriver": [
        "--driver-binary=$(location @selenium//common:msedgedriver)",
    ],
    "//conditions:default": [],
}) + headless_args

firefox_args = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "--driver-binary=$(location @linux_geckodriver//:geckodriver)",
        "--browser-binary=$(location @linux_firefox//:firefox)/firefox",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "--driver-binary=$(location @mac_geckodriver//:geckodriver)",
        "--browser-binary=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
    ],
    "@selenium//common:use_local_geckodriver": [
        "--driver-binary=$(location @selenium//common:geckodriver)",
    ],
    "//conditions:default": [],
}) + headless_args

BROWSERS = {
    "chrome": {
        "args": ["--driver=chrome"] + chrome_args,
        "data": chrome_data,
        "tags": COMMON_TAGS + ["chrome"],
    },
    "edge": {
        "args": ["--driver=edge"] + edge_args,
        "data": edge_data,
        "tags": COMMON_TAGS + ["edge"],
    },
    "firefox": {
        "args": ["--driver=firefox"] + firefox_args,
        "data": firefox_data,
        "tags": COMMON_TAGS + ["firefox"],
    },
    "ie": {
        "args": ["--driver=ie"],
        "data": [],
        "tags": COMMON_TAGS + ["ie"],
    },
    "safari": {
        "args": ["--driver=safari"],
        "data": [],
        "tags": COMMON_TAGS + ["safari"],
    },
}
