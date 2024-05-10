load("@npm//javascript/node/selenium-webdriver:mocha/package_json.bzl", mocha_bin = "bin")

def mocha_test(name, deps = [], args = [], data = [], env = {}, **kwargs):
    env = dict(env, **{
        # Add environment variable so that mocha writes its test xml
        # to the location Bazel expects.
        "MOCHA_FILE": "$$XML_OUTPUT_FILE",
    })

    mocha_bin.mocha_test(
        name = name,
        args = args,
        data = data,
        env = env,
        **kwargs
    )
