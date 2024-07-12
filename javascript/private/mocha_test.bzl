load("@npm//javascript/node/selenium-webdriver:mocha/package_json.bzl", mocha_bin = "bin")

_TIMEOUTS = {
    "small": "60000",
    "medium": "300000",
    "large": "900000",
}

def mocha_test(name, args = [], env = {}, size = None, **kwargs):
    mocha_bin.mocha_test(
        name = name,
        size = size,
        args = args + [
            "--timeout",
            _TIMEOUTS.get(size, "60000"),
        ],
        env = env | {
            # Add environment variable so that mocha writes its test xml
            # to the location Bazel expects.
            "MOCHA_FILE": "$$XML_OUTPUT_FILE",
        },
        **kwargs
    )
