load("//common:defs.bzl", "selenium_test")

def closure_test_suite(name, data = [], browsers = None):
    data = data + [
        "@com_google_javascript_closure_library//:com_google_javascript_closure_library",
    ]

    selenium_test(
        name = name,
        test_class = "org.openqa.selenium.javascript.ClosureTestSuite",
        jvm_flags = [
            "-Djs.test.timeout=20",
            "-Djs.test.dir=%s" % native.package_name(),
        ],
        data = data,
        runtime_deps = [
            "//java/client/test/org/openqa/selenium/javascript:javascript",
        ],
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
