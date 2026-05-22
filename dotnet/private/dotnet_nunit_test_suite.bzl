load("@rules_dotnet//dotnet:defs.bzl", "csharp_test")
load(
    "//common:browsers.bzl",
    "COMMON_TAGS",
    "chrome_data",
    "edge_data",
    "firefox_data",
)

_BROWSERS = {
    "chrome": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=Chrome",
        ] + select({
            "@selenium//common:use_pinned_linux_chrome": [
                "--test-parameter",
                "DriverServiceLocation=$(location @linux_chromedriver//:chromedriver)",
                "--test-parameter",
                "BrowserLocation=$(location @linux_chrome//:chrome-linux64/chrome)",
            ],
            "@selenium//common:use_pinned_macos_chrome": [
                "--test-parameter",
                "DriverServiceLocation=$(location @mac_chromedriver//:chromedriver)",
                "--test-parameter",
                "BrowserLocation=$(location @mac_chrome//:Chrome.app)/Contents/MacOS/Chrome",
            ],
            "//conditions:default": [],
        }),
        "data": chrome_data,
        "tags": [],
    },
    "edge": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=Edge",
        ] + select({
            "@selenium//common:use_pinned_linux_edge": [
                "--test-parameter",
                "DriverServiceLocation=$(location @linux_edgedriver//:msedgedriver)",
                "--test-parameter",
                "BrowserLocation=$(location @linux_edge//:opt/microsoft/msedge/microsoft-edge)",
            ],
            "@selenium//common:use_pinned_macos_edge": [
                "--test-parameter",
                "DriverServiceLocation=$(location @mac_edgedriver//:msedgedriver)",
                "--test-parameter",
                "BrowserLocation=$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge",
            ],
            "//conditions:default": [],
        }),
        "data": edge_data,
        "tags": [],
    },
    "firefox": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=Firefox",
        ] + select({
            "@selenium//common:use_pinned_linux_firefox": [
                "--test-parameter",
                "DriverServiceLocation=$(location @linux_geckodriver//:geckodriver)",
                "--test-parameter",
                "BrowserLocation=$(location @linux_firefox//:firefox/firefox)",
            ],
            "@selenium//common:use_pinned_macos_firefox": [
                "--test-parameter",
                "DriverServiceLocation=$(location @mac_geckodriver//:geckodriver)",
                "--test-parameter",
                "BrowserLocation=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
            ],
            "//conditions:default": [],
        }),
        "data": firefox_data,
        "tags": [],
    },
    "ie": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=IE",
        ],
        "data": [],
        "tags": ["skip-rbe"],
        "target_compatible_with": ["@platforms//os:windows"],
    },
    "safari": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=Safari",
        ],
        "data": [],
        "tags": ["skip-rbe"],
        "target_compatible_with": ["@platforms//os:osx"],
    },
    "remote": {
        "args": [
            "--test-parameter",
            "ActiveDriverConfig=Remote",
        ],
        "data": [
            "//:grid",
        ],
        "tags": ["skip-rbe"],
    },
}

_DEFAULT_BROWSERS = [b for b in _BROWSERS if b != "ie"]

_HEADLESS_ARGS = select({
    "@selenium//common:use_headless_browser": [
        "--test-parameter",
        "Headless=true",
    ],
    "//conditions:default": [],
})

_TEST_SUFFIXES = ("Test.cs", "Tests.cs")

# Exit code 8 = "Zero tests ran". Treated as success: a target whose tests
# are all filtered out (e.g. [IgnoreBrowser], [Ignore], commented-out source)
# should not fail the build. Real test failures still exit with code 2.
_NUNIT_ARGS = [
    "--ignore-exit-code",
    "8",
]

_NUNIT_SHIM = "//dotnet/private:mtp_shim.cs"

_MTP_DEPS = [
    "@paket.nuget//nunit",
    "//dotnet/private:nunit3testadapter_runtime",
    "@paket.nuget//microsoft.testing.platform",
    "@paket.nuget//microsoft.testing.extensions.vstestbridge",
    "@paket.nuget//microsoft.extensions.dependencymodel",
]

def _test_wrapper_impl(ctx):
    binary = ctx.executable.test_binary
    is_windows = ctx.target_platform_has_constraint(ctx.attr._windows_constraint[platform_common.ConstraintValueInfo])

    # On Windows, the test binary is a .bat launcher; preserve the extension
    # so Bazel's test runner invokes it through cmd.exe instead of CreateProcessW.
    ext = ".bat" if is_windows else ""
    symlink = ctx.actions.declare_file(ctx.label.name + ext)
    ctx.actions.symlink(output = symlink, target_file = binary, is_executable = True)

    runfiles = ctx.runfiles(files = ctx.files.data)
    runfiles = runfiles.merge(ctx.attr.test_binary[DefaultInfo].default_runfiles)
    for d in ctx.attr.data:
        if DefaultInfo in d:
            runfiles = runfiles.merge(d[DefaultInfo].default_runfiles)

    return [DefaultInfo(
        executable = symlink,
        runfiles = runfiles,
    )]

_test_wrapper_test = rule(
    implementation = _test_wrapper_impl,
    test = True,
    attrs = {
        "test_binary": attr.label(
            executable = True,
            cfg = "target",
            mandatory = True,
        ),
        "data": attr.label_list(allow_files = True),
        "_windows_constraint": attr.label(default = "@platforms//os:windows"),
    },
)

def _is_test(src):
    return src.endswith(_TEST_SUFFIXES)

def dotnet_nunit_test_suite(
        name,
        srcs,
        deps = [],
        target_frameworks = None,
        size = None,
        tags = [],
        data = [],
        browsers = None,
        **kwargs):
    test_srcs = [src for src in srcs if _is_test(src)]

    browsers = browsers or [None]
    default_browser = browsers[0]

    # Collect all browser data deps so the compiled binary has everything.
    all_browser_data = []
    for browser in browsers:
        if browser and browser in _DEFAULT_BROWSERS:
            all_browser_data += _BROWSERS[browser]["data"]

    # Compile all tests into a single binary once,
    # then create wrapper tests that execute it with --filter arguments.
    csharp_test(
        name = name,
        srcs = srcs + [_NUNIT_SHIM],
        deps = depset(deps + _MTP_DEPS).to_list(),
        target_frameworks = target_frameworks,
        data = data + all_browser_data,
        tags = ["manual"] + tags,
        size = size,
        **kwargs
    )

    for src in test_srcs:
        test_name = src[:src.rfind(".")]
        class_name = test_name.rsplit("/", 1)[-1]

        for browser in browsers:
            if browser and browser not in _DEFAULT_BROWSERS:
                continue
            browser_test_name = "%s-%s" % (test_name, browser) if browser else test_name
            browser_cfg = _BROWSERS[browser] if browser else None
            browser_args = browser_cfg["args"] + _HEADLESS_ARGS if browser_cfg else []
            browser_data = browser_cfg["data"] if browser_cfg else []
            browser_tags = [browser] + COMMON_TAGS + browser_cfg["tags"] if browser_cfg else []

            if browser and browser == default_browser:
                native.test_suite(
                    name = test_name,
                    tests = [browser_test_name],
                )

            _test_wrapper_test(
                name = browser_test_name,
                test_binary = ":" + name,
                args = _NUNIT_ARGS + ["--filter", "FullyQualifiedName~.%s" % class_name] + browser_args,
                data = browser_data,
                tags = tags + browser_tags,
                size = size,
                target_compatible_with = browser_cfg["target_compatible_with"] if browser_cfg and "target_compatible_with" in browser_cfg else [],
            )
