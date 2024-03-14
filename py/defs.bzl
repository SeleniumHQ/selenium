load("//py/private:generate_devtools.bzl", _generate_devtools = "generate_devtools")
load("//py/private:import.bzl", _py_import = "py_import")
load("//py/private:pytest.bzl", _pytest_test = "pytest_test")
load("//py/private:py_with_lint_macro.bzl", _py_binary = "py_binary", _py_library = "py_library")
load("//py/private:suite.bzl", _py_test_suite = "py_test_suite")
load("//py/private:black_config.bzl", _black_config = "black_config")

black_config = _black_config
generate_devtools = _generate_devtools
pytest_test = _pytest_test
py_binary = _py_binary
py_library = _py_library
py_import = _py_import
py_test_suite = _py_test_suite
