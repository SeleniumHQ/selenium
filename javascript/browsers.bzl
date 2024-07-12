headless = select({
    "@selenium//common:use_headless_browser": {
        "headless": True,
    },
    "//conditions:default": {},
})

_chromedriver_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_chromedriver//:chromedriver-js",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chromedriver//:chromedriver-js",
    ],
    #    "@selenium//common:use_local_chromedriver": ["@selenium//common:chromedriver-js"],
    "//conditions:default": [],
})

_chrome_data = select({
    "@selenium//common:use_pinned_linux_chrome": [
        "@linux_chrome//:chrome-js",
    ],
    "@selenium//common:use_pinned_macos_chrome": [
        "@mac_chrome//:chrome-js",
    ],
    "//conditions:default": [],
}) + _chromedriver_data

chrome = {
    "env": select({
        "@selenium//common:use_pinned_linux_chrome": {
            #            "BROWSER_BINARY": "$(location @linux_chrome//:chrome-linux64/chrome)",
            #            "DRIVER_BINARY": "$(location @linux_chromedriver//:chromedriver)",
            "SELENIUM_BROWSER": "chrome",
        },
        "@selenium//common:use_pinned_macos_chrome": {
            "BROWSER_BINARY": "mac_chrome/Chrome.app/Contents/MacOS/Chrome",
            "DRIVER_BINARY": "mac_chromedriver/chromedriver",
            "SELENIUM_BROWSER": "chrome",
        },
        "//conditions:default": {
            "SELENIUM_BROWSER": "chrome",
        },
    }),
    "data": _chrome_data,
}

_geckodriver_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_geckodriver//:geckodriver-js",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_geckodriver//:geckodriver-js",
    ],
    #    "@selenium//common:use_local_chromedriver": ["@selenium//common:chromedriver-js"],
    "//conditions:default": [],
})

_firefox_data = select({
    "@selenium//common:use_pinned_linux_firefox": [
        "@linux_firefox//:firefox-js",
    ],
    "@selenium//common:use_pinned_macos_firefox": [
        "@mac_firefox//:firefox-js",
    ],
    "//conditions:default": [],
}) + _geckodriver_data

firefox = {
    "env": select({
        "@selenium//common:use_pinned_linux_firefox": {
            #            "BROWSER_BINARY": "$(location @linux_chrome//:chrome-linux64/chrome)",
            #            "DRIVER_BINARY": "$(location @linux_chromedriver//:chromedriver)",
            "SELENIUM_BROWSER": "firefox",
        },
        "@selenium//common:use_pinned_macos_firefox": {
            "BROWSER_BINARY": "mac_firefox/Firefox.app/Contents/MacOS/firefox",
            "DRIVER_BINARY": "mac_geckodriver/geckodriver",
            "SELENIUM_BROWSER": "firefox",
        },
        "//conditions:default": {
            "SELENIUM_BROWSER": "firefox",
        },
    }),
    "data": _firefox_data,
}

BROWSERS = {
    "chrome": chrome,
    "firefox": firefox,
}
