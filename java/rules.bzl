def _gen_build_info(name, maven_coords, multi_release_jar):
    if not (maven_coords):
        return []

    rev = native.read_config("selenium", "rev", "unknown")
    time = native.read_config("selenium", "timestamp", "unknown")
    multi_release = "false"
    if multi_release_jar:
        multi_release = "true"

    native.genrule(
        name = "%s-gen-manifest" % name,
        out = "manifest",
        cmd = 'python -c "print(\'Multi-Release: {}\\n\\nName: Build-Info\\nBuild-Revision: {}\\nBuild-Time: {}\\n\\n\')" >> $OUT'.format(multi_release_jar, rev, time),
    )

    native.java_library(
        name = "%s-lib-build-info" % name,
        manifest_file = ":%s-gen-manifest" % name,
    )
    return [":%s-lib-build-info" % name]

def java_library(name, maven_coords = None, module_info = None, deps = [], **kwargs):
    all_deps = []
    all_deps += deps
    if module_info:
        native.genrule(
            name = "%s-generate-module-info" % name,
            srcs = [module_info],
            out = "module-info.jar",
            cmd = "$(exe //java/client/src/org/openqa/selenium/tools:module-maker) $SRCS $OUT",
        )

        native.prebuilt_jar(
            name = "%s-module-info" % name,
            binary_jar = ":%s-generate-module-info" % name,
        )

        all_deps += [":%s-module-info" % name]

    all_deps += _gen_build_info(name, maven_coords, module_info != None)

    native.java_library(
        name = name,
        deps = all_deps,
        maven_coords = maven_coords,
        **kwargs
    )

def java_binary(name, maven_coords = None, deps = [], **kwargs):
    all_deps = []
    all_deps += deps
    all_deps += _gen_build_info(name, maven_coords)

    native.java_binary(
        name = name,
        deps = all_deps,
        **kwargs
    )

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
  pkg = native.package_name()
  idx = pkg.find("/com/")
  if idx == -1:
    idx = pkg.find("/org/")
  if idx != -1:
    pkg = pkg[idx+1:].replace("/", ".")
  else:
    pkg = None

  tests = []

  actual_tags = []
  actual_tags.extend(tags)
  if "small" != size:
    actual_tags.append("no-sandbox")

  for src in srcs:
    if src.endswith('Test.java'):
      test_name = src[:-len('.java')]

      tests += [test_name]
      test_class = None
      if pkg != None:
        test_class = pkg + "." + test_name.replace("/", ".")

      if test_name in native.existing_rules():
        test_name = "%s-%s" % (name, test_name)

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

