ENV = select({
    "//rb/spec/integration:chrome": {
        "WD_REMOTE_BROWSER": "chrome",
        "WD_SPEC_DRIVER": "chrome",
    },
    "//rb/spec/integration:edge": {
        "WD_REMOTE_BROWSER": "edge",
        "WD_SPEC_DRIVER": "edge",
    },
    "//rb/spec/integration:firefox": {
        "WD_REMOTE_BROWSER": "firefox",
        "WD_SPEC_DRIVER": "firefox",
    },
    "//rb/spec/integration:ie": {
        "WD_REMOTE_BROWSER": "ie",
        "WD_SPEC_DRIVER": "ie",
    },
    "//rb/spec/integration:safari": {
        "WD_REMOTE_BROWSER": "safari",
        "WD_SPEC_DRIVER": "safari",
    },
    "//rb/spec/integration:safari-preview": {
        "WD_REMOTE_BROWSER": "safari-preview",
        "WD_SPEC_DRIVER": "safari-preview",
    },
    "//conditions:default": {},
}) | select({
    "//rb/spec/integration:remote": {
        "WD_SPEC_DRIVER": "remote",
    },
    "//conditions:default": {},
}) | select({
    "//rb/spec/integration:headless": {
        "HEADLESS": "true",
    },
    "//conditions:default": {},
})

# We have to use no-sandbox at the moment because Firefox crashes
# when run under sandbox: https://bugzilla.mozilla.org/show_bug.cgi?id=1382498.
# For Chromium-based browser, we can just pass `--no-sandbox` flag.
TAGS = ["no-sandbox"]
