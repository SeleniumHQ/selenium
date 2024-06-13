load("@py_dev_requirements//:requirements.bzl", "requirement")

def release_selenium(name, additional_args = []):
    native.py_binary(
        name = name,
        srcs = [
            "release-selenium.py",
        ],
        args = [
            "upload",
            "$(location :selenium-wheel)",
            "$(location :selenium-sdist)",
        ] + additional_args,
        data = [
            ":selenium-sdist",
            ":selenium-wheel",
        ],
        main = "release-selenium.py",
        deps = [
            requirement("twine"),
        ],
        env = {
            "TWINE_USERNAME": "$(TWINE_USERNAME)",
            "TWINE_PASSWORD": "$(TWINE_PASSWORD)",
        },
    )
