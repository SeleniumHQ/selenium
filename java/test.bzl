load("@bazel_tools//tools/jdk:toolchain_utils.bzl", "find_java_runtime_toolchain", "find_java_toolchain")

_BROWSERS = {
    "chrome": {
        "jvm_flags": ["-Dselenium.browser=chrome"],
        "tags": []
    },
    "edge": {
        "jvm_flags": ["-Dselenium.browser=edge"],
        "tags": [],
    },
    "ie": {
        "jvm_flags": ["-Dselenium.browser=ie"],
        "tags": [
            "exclusive",
        ],
    },
    "firefox": {
        "jvm_flags": ["-Dselenium.browser=ff"],
        "tags": [],
    },
    "safari": {
        "jvm_flags": ["-Dselenium.browser=safari"],
        "tags": [
            "exclusive",
        ],
    },
}

def _package_name():
    # By default bazel computes the name of test classes based on the
    # standard Maven directory structure, which we don't use in
    # Selenium, so try to compute the correct package name.
    pkg = native.package_name()
    idx = pkg.find("/com/")
    if idx == -1:
        idx = pkg.find("/org/")
    if idx != -1:
        pkg = pkg[idx + 1:].replace("/", ".")
    else:
        pkg = None
    return pkg

def _test_class_name(src_file):
    test_name = src_file[:-len(".java")]

    pkg = _package_name()
    if pkg != None:
        return pkg + "." + test_name.replace("/", ".")
    return test_name.replace("/", ".")

def _web_test_rule_impl(ctx):
    java_toolchain = find_java_toolchain(ctx, ctx.attr._java_toolchain)
    java_runtime = find_java_runtime_toolchain(ctx, ctx.attr._host_javabase)

    executable = ctx.actions.declare_file("%s-runner" % ctx.label.name)
    all_jvm_flags = [
        "-ea",
        "-Dbazel.test_suite=%s" % ctx.attr.test_class,
    ] + _BROWSERS[ctx.attr.browser]["jvm_flags"] + ctx.attr.jvm_flags
    jvm_flags = " ".join(all_jvm_flags)

    javabin = "export JAVABIN=%s" % java_runtime.java_executable_exec_path
    jarbin = "%s/jar" % java_runtime.java_executable_runfiles_path

    browser_deps = [dep[JavaInfo].transitive_runtime_jars for dep in getattr(ctx.attr, "_" + ctx.attr.browser)]
    runtime_deps = [ctx.attr.runtime_dep[JavaInfo].transitive_runtime_jars]

    all_deps = depset(
        direct = ctx.files._bazel_test_runner,
        transitive = browser_deps + runtime_deps,
    )

    classpath = ctx.configuration.host_path_separator.join(
        ["${RUNPATH}%s" % (dep.short_path) for dep in all_deps.to_list()],
    )

    if ctx.attr.browser in ctx.attr.supported_browsers:
        template = ctx.file._test_template
    else:
        template = ctx.file._empty_test_template

    ctx.actions.expand_template(
        template = template,
        output = executable,
        substitutions = {
            "%classpath%": "\"%s\"" % classpath,
            "%java_start_class%": "com.google.testing.junit.runner.BazelTestRunner",
            "%javabin%": javabin,
            "%jarbin%": jarbin,
            "%jvm_flags%": jvm_flags,
            "%needs_runfiles%": "",
            "%runfiles_manifest_only%": "",
            "%set_jacoco_metadata%": "",
            "%set_jacoco_main_class%": "",
            "%set_jacoco_java_runfiles_root%": "",
            "%workspace_prefix%": ctx.workspace_name + "/",
            "%set_java_coverage_new_implementation%": """export JAVA_COVERAGE_NEW_IMPLEMENTATION=NO""",
        },
        is_executable = True,
    )

    # Create the runfiles needed. This will include all the jars we depend on,
    # including the test runner, as well as the JRE. Oof.
    runfiles = ctx.runfiles(transitive_files = all_deps, files = ctx.files._host_javabase, collect_data = True)
    runfiles = runfiles.merge(ctx.attr.runtime_dep[DefaultInfo].data_runfiles)

    return struct(
        outputs = {
            "class_jar": ctx.files.runtime_dep,
        },
        executable = executable,
        runfiles = runfiles,
    )

_web_test = rule(
    _web_test_rule_impl,
    test = True,
    attrs = {
        "test_class": attr.string(),
        "runtime_dep": attr.label(
            allow_files = False,
            providers = [JavaInfo],
        ),
        "jvm_flags": attr.string_list(default = []),
        "supported_browsers": attr.string_list(),
        "browser": attr.string(mandatory = True),
        "_test_template": attr.label(
            default = "//java:java_stub_template.txt",
            allow_single_file = True,
        ),
        "_empty_test_template": attr.label(
            default = "//java:empty_test_template.txt",
            allow_single_file = True,
        ),
        "_bazel_test_runner": attr.label(
            default = "@bazel_tools//tools/jdk:TestRunner_deploy.jar",
        ),
        "_host_javabase": attr.label(
            default = Label("@bazel_tools//tools/jdk:current_java_runtime"),
            providers = [java_common.JavaRuntimeInfo],
        ),
        "_java_toolchain": attr.label(
            default = Label("@bazel_tools//tools/jdk:current_java_toolchain"),
            providers = [java_common.JavaToolchainInfo],
        ),
        "_chrome": attr.label_list(default = [Label("//java/client/src/org/openqa/selenium/chrome")]),
        "_edge": attr.label_list(default = [Label("//java/client/src/org/openqa/selenium/edge")]),
        "_ie": attr.label_list(default = [Label("//java/client/src/org/openqa/selenium/ie")]),
        "_firefox": attr.label_list(default = [Label("//java/client/src/org/openqa/selenium/firefox")]),
        "_safari": attr.label_list(default = [Label("//java/client/src/org/openqa/selenium/safari")]),
    },
    fragments = ["java", "cpp"],
)

def java_selenium_test_suite(
        name,
        srcs,
        size = "medium",
        browsers = ["chrome", "edge", "firefox", "ie", "safari"],
        resources = [],
        data = [],
        deps = [],
        tags = []):
    native.java_library(
        name = "%s-base-lib" % name,
        srcs = srcs,
        data = data,
        resources = resources,
        deps = deps,
    )

    suites = []
    for src in srcs:
        if src.endswith("Test.java"):
            tests = []

            test_class = _test_class_name(src)
            test_name = test_class.rpartition(".")[2]

            for browser in browsers:
                if not browser in _BROWSERS:
                    fail("Unrecognized browser: " + browser)

                _web_test(
                    name = "%s-%s" % (test_name, browser),
                    test_class = test_class,
                    size = size,
                    tags = tags + _BROWSERS[browser]["tags"] + ["local", "requires-network", browser],
                    browser = browser,
                    runtime_dep = ":%s-base-lib" % name,
                    supported_browsers = ["chrome", "firefox"] + select({
                        "@bazel_tools//src/conditions:darwin": ["safari"],
                        "@bazel_tools//src/conditions:host_windows": ["edge", "ie"],
                        "//conditions:default": [],
                    }),
                )
                tests.append("%s-%s" % (test_name, browser))
            native.test_suite(name = test_name, tests = tests, tags = ["manual"])
            suites.append(test_name)
    native.test_suite(name = name, tests = suites, tags = tags + ["manual"])


def java_test_suite(
    name,
    srcs,
    resources=None,
    jvm_flags=[],
    deps=None,
    visibility=None,
    size = None,
    tags = []):

  # By default bazel computes the name of test classes based on the
  # standard Maven directory structure, which we don't use in
  # Selenium, so try to compute the correct package name.
  pkg = _package_name()

  tests = []

  actual_tags = []
  actual_tags.extend(tags)
  if "small" != size:
    actual_tags.append("no-sandbox")

  for src in srcs:
    if src.endswith('Test.java'):
      test_name = src[:-len('.java')]

      test_class = _test_class_name(src)

      if test_name in native.existing_rules():
        test_name = "%s-%s" % (name, test_name)
      tests += [test_name]

      native.java_test(
          name = test_name,
          srcs = [src],
          size = size,
          jvm_flags = jvm_flags,
          test_class = test_class,
          resources = resources,
	  tags = actual_tags,
          deps = deps,
          visibility = ["//visibility:private"])

  native.test_suite(
      name = name,
      tests = tests,
      tags = ["manual"] + tags,
      visibility = visibility)
