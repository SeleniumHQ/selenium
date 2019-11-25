def closure_test_suite(name, data):
    browsers = {
        "firefox": ("ff", "//java/client/src/org/openqa/selenium/firefox"),
        "chrome": ("chrome", "//java/client/src/org/openqa/selenium/chrome"),
        "ie": ("ie", "//java/client/src/org/openqa/selenium/ie"),
        "safari": ("safari", "//java/client/src/org/openqa/selenium/safari"),
    }

    data = data + [
        "@com_google_javascript_closure_library//:com_google_javascript_closure_library",
    ]

    tests = []
    for browser in browsers.keys():
        spec = browsers[browser]
        test_name = "%s-%s" % (name, browser)
        native.java_test(
            name = test_name,
            test_class = "org.openqa.selenium.javascript.ClosureTestSuite",
            jvm_flags = [
                "-Dselenium.browser=%s" % spec[0],
                "-Djs.test.timeout=20",
                "-Djs.test.dir=%s" % native.package_name(),
            ],
            data = data,
            runtime_deps = [
                "//java/client/test/org/openqa/selenium/javascript:javascript",
                spec[1],
            ],
            tags = ["no-sandbox"],
        )
        tests.append(":" + test_name)

    native.test_suite(
        name = name,
        tests = tests,
        tags = ["manual", "no-sandbox"],
    )

    native.java_binary(
        name = name + "_debug_server",
        main_class = "org.openqa.selenium.environment.webserver.JettyAppServer",
        data = data,
        testonly = 1,
        runtime_deps = [
            "//java/client/test/org/openqa/selenium/environment",
        ],
    )
