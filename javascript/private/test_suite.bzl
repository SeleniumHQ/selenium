load("@rules_jvm_external//:defs.bzl", "artifact")
load("//java:defs.bzl", "java_binary", "selenium_test")

def closure_test_suite(name, data = [], browsers = None):
    data = data + [
        "//third_party/closure/goog:base",
        "//third_party/closure/goog:css",
        "//third_party/closure/goog:deps",
        "//third_party/closure/goog:library",
        "//third_party/closure/goog/testing",
        "//third_party/js/qunit",
    ]

    kwargs = {
        "name": name,
        "test_class": "org.openqa.selenium.javascript.ClosureTestSuite",
        "jvm_flags": [
            "-Djs.test.timeout=20",
            "-Djs.test.dir=%s" % native.package_name(),
        ],
        "data": data,
        "runtime_deps": [
            "//java/test/org/openqa/selenium/javascript:javascript",
        ],
    }

    if browsers != None:
        kwargs["browsers"] = browsers

    selenium_test(**kwargs)
    java_binary(
        name = name + "_debug_server",
        main_class = "org.openqa.selenium.environment.webserver.NettyAppServer",
        data = data,
        testonly = 1,
        runtime_deps = [
            "//java/test/org/openqa/selenium/environment",
            artifact("org.slf4j:slf4j-jdk14"),
        ],
    )
