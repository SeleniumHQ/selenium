load("@rules_python//python:defs.bzl", "py_library")
load("//py/private:pytest.bzl", "pytest_test")

def _is_test(file):
    return file.startswith("test_") or file.endswith("_tests.py")

def _suite_suffix(name):
    return name[len("test-"):] if name.startswith("test-") else name

def _strip_test_prefixes(path):
    if path.endswith(".py"):
        path = path[:-len(".py")]
    filename = path.rsplit("/", 1)[-1]
    if filename.startswith("test_"):
        path = path[:-len(filename)] + filename[len("test_"):]
    return path

def py_test_suite(name, srcs, size = None, deps = None, python_version = None, imports = None, visibility = None, test_suffix = None, **kwargs):
    support_srcs = [src for src in srcs if not _is_test(src)]

    if support_srcs:
        library_name = "%s-test-lib" % name
        py_library(
            name = library_name,
            testonly = True,
            srcs = support_srcs,
            deps = deps,
            imports = imports,
            precompile = "disabled",
        )
        test_deps = [library_name]
    else:
        test_deps = deps or []

    suffix = test_suffix if test_suffix != None else _suite_suffix(name)

    tests = []
    for src in srcs:
        if _is_test(src):
            test_name = "%s-%s" % (_strip_test_prefixes(src), suffix)

            tests.append(test_name)

            pytest_test(
                name = test_name,
                size = size,
                srcs = [src],
                deps = test_deps,
                python_version = python_version,
                precompile = "disabled",
                **kwargs
            )
    native.test_suite(
        name = name,
        tests = tests,
        visibility = visibility,
    )
