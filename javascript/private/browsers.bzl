# We need to enable `build --experimental_inprocess_symlink_creation` in the project `.bazelrc`
# to allow the runfiles that are generated to include spaces. However, doing this breaks
# test execution in `aspect_rules_js`, so we can't do that yet. Fortunately, when running on
# Linux, there are no spaces in file names, and that's all we need to get the tests running
# on the RBE. For now, we'll only use pinned browsers when running remotely.
BROWSERS = {
    "chrome": {
        "data": select({
            "@selenium//common:use_pinned_linux_chrome": [
                "@linux_chrome//:chrome-js",
                "@linux_chromedriver//:chromedriver-js",
            ],
            #            "@selenium//common:use_pinned_macos_chrome": [
            #                "@mac_chrome//:chrome-js",
            #                "@mac_chromedriver//:chromedriver-js",
            #            ],
            "//conditions:default": [],
        }),
        "env": select({
            "@selenium//common:use_pinned_linux_chrome": {
                "SE_CHROMEDRIVER": "linux_chromedriver/chromedriver",
                "SE_CHROME": "linux_chrome/chrome-linux64/chrome",
            },
            #            "@selenium//common:use_pinned_macos_chrome": {
            #                "SE_CHROMEDRIVER": "mac_chromedriver/chromedriver",
            #                "SE_CHROME": "mac_chrome/Chrome.app)/Contents/MacOS/Chrome",
            #            },
            "//conditions:default": {},
        }),
    },
    "firefox": {
        "data": select({
            "@selenium//common:use_pinned_linux_firefox": [
                "@linux_geckodriver//:geckodriver-js",
                "@linux_firefox//:firefox-js",
            ],
            #            "@selenium//common:use_pinned_macos_firefox": [
            #                "@mac_geckodriver//:geckodriver-js",
            #                "@mac_firefox//:firefox-js",
            #            ],
            "//conditions:default": [],
        }),
        "env": select({
            "@selenium//common:use_pinned_linux_firefox": {
                "SE_GECKODRIVER": "linux_geckodriver/geckodriver",
                "SE_FIREFOX": "linux_firefox/firefox/firefox",
            },
            #            "@selenium//common:use_pinned_macos_firefox": {
            #                "SE_GECKODRIVER": "mac_geckodriver/geckodriver",
            #                "SE_FIREFOX": "mac_firefox/Firefox.app/Contents/MacOS/firefox",
            #            },
            "//conditions:default": {},
        }),
    },
}
