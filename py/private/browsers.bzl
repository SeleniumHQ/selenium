load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_beta_data",
    "chrome_beta_version_env",
    "chrome_data",
    "chrome_version_env",
    "edge_data",
    "edge_version_env",
    "firefox_data",
    "firefox_version_env",
)

headless_args = select({
    "@selenium//common:use_headless_browser": [
        "--headless",
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
        "env": chrome_version_env,
        "tags": COMMON_TAGS + ["chrome"],
        "target_compatible_with": [],
    },
    "chrome-beta": {
        "args": ["--driver=chrome"] + chrome_beta_args,
        "data": chrome_beta_data,
        "env": chrome_beta_version_env,
        "tags": COMMON_TAGS + ["chrome"],
        "target_compatible_with": [],
    },
    "edge": {
        "args": ["--driver=edge"] + edge_args,
        "data": edge_data,
        "env": edge_version_env,
        "tags": COMMON_TAGS + ["edge"],
        "target_compatible_with": [],
    },
    "firefox": {
        "args": ["--driver=firefox"] + firefox_args,
        "data": firefox_data,
        "env": firefox_version_env,
        "tags": COMMON_TAGS + ["firefox"],
        "target_compatible_with": [],
    },
    "ie": {
        "args": ["--driver=ie"],
        "data": [],
        "env": {},
        "tags": COMMON_TAGS + ["ie"],
        "target_compatible_with": ["@platforms//os:windows"],
    },
    "safari": {
        "args": ["--driver=safari"],
        "data": [],
        "env": {},
        "tags": COMMON_TAGS + ["exclusive-if-local", "safari"],
        "target_compatible_with": ["@platforms//os:macos"],
    },
}
