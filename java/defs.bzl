load("//java/private:dist_zip.bzl", _java_dist_zip = "java_dist_zip")
load("//java/private:export.bzl", _java_export = "java_export")
load("//java/private:test.bzl", _java_test_suite = "java_test_suite", _java_selenium_test_suite = "java_selenium_test_suite")

java_dist_zip = _java_dist_zip
java_export = _java_export
java_selenium_test_suite = _java_selenium_test_suite
java_test_suite = _java_test_suite
