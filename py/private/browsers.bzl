load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_beta_data",
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
        "--browser-binary=$(location @linux_chrome//:chrome-linux64/chrome)",
        "--browser-args=--disable-dev-shm-usage",
        "--browser-args=--no-sandbox",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "--driver-binary=$(location @mac_chromedriver//:chromedriver)",
        "--browser-binary=$(location @mac_chrome//:Chrome.app)/Contents/MacOS/Chrome",
    ],
    "//conditions:default": [],
}) + headless_args

chrome_beta_args = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "--driver-binary=$(location @linux_beta_chromedriver//:chromedriver)",
        "--browser-binary=$(location @linux_beta_chrome//:chrome-linux64/chrome)",
        "--browser-args=--disable-dev-shm-usage",
        "--browser-args=--no-sandbox",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "--driver-binary=$(location @mac_beta_chromedriver//:chromedriver)",
        "--browser-binary=$(location @mac_beta_chrome//:Chrome.app)/Contents/MacOS/Chrome",
    ],
    "//conditions:default": [],
}) + headless_args

edge_args = select({
    "@selenium//common:use_pinned_linux_edge": [
        "--driver-binary=$(location @linux_edgedriver//:msedgedriver)",
        "--browser-binary=$(location @linux_edge//:opt/microsoft/msedge/microsoft-edge)",
        "--browser-args=--disable-dev-shm-usage",
        "--browser-args=--no-sandbox",
    ],
    "@selenium//common:use_pinned_macos_edge": [
        "--driver-binary=$(location @mac_edgedriver//:msedgedriver)",
        "--browser-binary='$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge'",
    ],
    "//conditions:default": [],
}) + headless_args

firefox_args = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "--driver-binary=$(location @linux_geckodriver//:geckodriver)",
        "--browser-binary=$(location @linux_firefox//:firefox/firefox)",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "--driver-binary=$(location @mac_geckodriver//:geckodriver)",
        "--browser-binary=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
    ],
    "//conditions:default": [],
}) + headless_args

BROWSERS = {
    "chrome": {
        "args": ["--driver=chrome"] + chrome_args,
        "data": chrome_data,
        "tags": COMMON_TAGS + ["chrome"],
    },
    "chrome-beta": {
        "args": ["--driver=chrome"] + chrome_beta_args,
        "data": chrome_beta_data,
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
        "tags": COMMON_TAGS + ["ie", "skip-rbe"],
    },
    "safari": {
        "args": ["--driver=safari"],
        "data": [],
        "tags": COMMON_TAGS + ["safari", "skip-rbe"],
    },
}
