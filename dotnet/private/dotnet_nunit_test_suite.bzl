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
            "--params=ActiveDriverConfig=Chrome",
        ] + select({
            "@selenium//common:use_pinned_linux_chrome": [
                "--params=DriverServiceLocation=$(location @linux_chromedriver//:chromedriver)",
                "--params=BrowserLocation=$(location @linux_chrome//:chrome-linux64/chrome)",
            ],
            "@selenium//common:use_pinned_macos_chrome": [
                "--params=DriverServiceLocation=$(location @mac_chromedriver//:chromedriver)",
                "--params=BrowserLocation=$(location @mac_chrome//:Chrome.app)/Contents/MacOS/Chrome",
            ],
            "//conditions:default": [],
        }),
        "data": chrome_data,
        "tags": [],
    },
    "edge": {
        "args": [
            "--params=ActiveDriverConfig=Edge",
        ] + select({
            "@selenium//common:use_pinned_linux_edge": [
                "--params=DriverServiceLocation=$(location @linux_edgedriver//:msedgedriver)",
                "--params=BrowserLocation=$(location @linux_edge//:opt/microsoft/msedge/microsoft-edge)",
            ],
            "@selenium//common:use_pinned_macos_edge": [
                "--params=DriverServiceLocation=$(location @mac_edgedriver//:msedgedriver)",
                "\"--params=BrowserLocation=$(location @mac_edge//:Edge.app)/Contents/MacOS/Microsoft Edge\"",
            ],
            "//conditions:default": [],
        }),
        "data": edge_data,
        "tags": [],
    },
    "firefox": {
        "args": [
            "--params=ActiveDriverConfig=Firefox",
        ] + select({
            "@selenium//common:use_pinned_linux_firefox": [
                "--params=DriverServiceLocation=$(location @linux_geckodriver//:geckodriver)",
                "--params=BrowserLocation=$(location @linux_firefox//:firefox/firefox)",
            ],
            "@selenium//common:use_pinned_macos_firefox": [
                "--params=DriverServiceLocation=$(location @mac_geckodriver//:geckodriver)",
                "--params=BrowserLocation=$(location @mac_firefox//:Firefox.app)/Contents/MacOS/firefox",
            ],
            "//conditions:default": [],
        }),
        "data": firefox_data,
        "tags": [],
    },
    "ie": {
        "args": [
            "--params=ActiveDriverConfig=IE",
        ] + select({
            "//common:windows": [],
            "//conditions:default": [
                "--where=SkipTest==True",
            ],
        }),
        "data": [],
        "tags": ["skip-rbe"],
    },
    "safari": {
        "args": [
            "--params=ActiveDriverConfig=Safari",
        ] + select({
            "//common:macos": [],
            "//conditions:default": [
                "--where=SkipTest==True",
            ],
        }),
        "data": [],
        "tags": ["skip-rbe"],
    },
    "remote": {
        "args": [
            "--params=ActiveDriverConfig=Remote",
        ],
        "data": [
            "//:grid",
        ],
        "tags": ["skip-rbe"],
    },
}

_HEADLESS_ARGS = select({
    "@selenium//common:use_headless_browser": [
        "--params=Headless=true",
    ],
    "//conditions:default": [],
})

_TEST_SUFFIXES = ("Test.cs", "Tests.cs")

_NUNIT_ARGS = [
    "--workers=1",  # Bazel tests share a single driver instance; prevent NUnit parallelism
]

_NUNIT_SHIM = "@rules_dotnet//dotnet/private/rules/common/nunit:shim.cs"

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
        if browser:
            all_browser_data += _BROWSERS[browser]["data"]

    # Compile all tests into a single binary once,
    # then create wrapper tests that execute it with --where filters.
    csharp_test(
        name = name,
        srcs = srcs + [_NUNIT_SHIM],
        deps = deps + ["@paket.nuget//nunitlite"],
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
                args = _NUNIT_ARGS + ["--where=class=~\\.%s$$" % class_name] + browser_args,
                data = browser_data,
                tags = tags + browser_tags,
                size = size,
            )
