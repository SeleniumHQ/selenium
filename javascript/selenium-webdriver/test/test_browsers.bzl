"""Browsers for large test files whose suite() is limited to some; others run on every browser.

test/lib/test_browsers_test.js checks this against each file's suite() options.
"""

TEST_BROWSERS = {
    "test/bidi/bidi_test.js": ["firefox"],
    "test/bidi/generated/browser_test.js": ["chrome", "firefox"],
    "test/bidi/generated/browsing_context_test.js": ["chrome", "firefox"],
    "test/bidi/generated/emulation_test.js": ["chrome", "firefox"],
    "test/bidi/generated/input_test.js": ["chrome", "firefox"],
    "test/bidi/generated/log_test.js": ["chrome", "firefox"],
    "test/bidi/generated/network_test.js": ["chrome", "firefox"],
    "test/bidi/generated/script_test.js": ["chrome", "firefox"],
    "test/bidi/generated/storage_test.js": ["chrome", "firefox"],
    "test/bidi/network_commands_test.js": ["firefox"],
    "test/chrome/cast_test.js": ["chrome"],
    "test/chrome/devtools_test.js": ["chrome"],
    "test/chrome/options_test.js": ["chrome"],
    "test/chrome/permission_test.js": ["chrome"],
    "test/chrome/service_test.js": ["chrome"],
    "test/devtools_test.js": ["chrome"],
    "test/edge/options_test.js": ["edge"],
    "test/edge/service_test.js": ["edge"],
    "test/elementAccessibleName_test.js": ["chrome"],
    "test/elementAriaRole_test.js": ["chrome"],
    "test/fedcm/fedcm_test.js": ["chrome", "edge"],
    "test/firefox/addon_test.js": ["firefox"],
    "test/firefox/contextSwitching_test.js": ["firefox"],
    "test/firefox/full_page_screenshot_test.js": ["firefox"],
    "test/firefox/options_test.js": ["firefox"],
    # Internet Explorer and Safari have no Bazel browser targets.
    "test/ie/options_test.js": [],
    "test/lib/form_submit_test.js": ["chrome", "firefox"],
    "test/lib/webdriver_network_test.js": ["firefox"],
    "test/print_pdf_test.js": ["chrome", "firefox"],
    "test/safari_test.js": [],
    "test/select_test.js": ["chrome", "firefox"],
    "test/webComponent_test.js": ["chrome"],
}
