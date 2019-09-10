load("//java/private:export.bzl", _java_export = "java_export")
load("//java/private:test.bzl", _java_test_suite = "java_test_suite", _java_selenium_test_suite = "java_selenium_test_suite")

java_export = _java_export
java_selenium_test_suite = _java_selenium_test_suite
java_test_suite = _java_test_suite
