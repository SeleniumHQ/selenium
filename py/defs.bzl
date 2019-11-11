load("//py/private:import.bzl", _py_import = "py_import")
load("//py/private:pytest.bzl", _pytest_test = "pytest_test")
load("//py/private:suite.bzl", _py_test_suite = "py_test_suite")

pytest_test = _pytest_test
py_import = _py_import
py_test_suite = _py_test_suite
