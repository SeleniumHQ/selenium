load("//py/private:generate_devtools.bzl", _generate_devtools = "generate_devtools", _generate_devtools_latest = "generate_devtools_latest")
load("//py/private:import.bzl", _py_import = "py_import")
load("//py/private:pytest.bzl", _pytest_test = "pytest_test")
load("//py/private:suite.bzl", _py_test_suite = "py_test_suite")

generate_devtools = _generate_devtools
generate_devtools_latest = _generate_devtools_latest
pytest_test = _pytest_test
py_import = _py_import
py_test_suite = _py_test_suite
