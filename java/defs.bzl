load("//java/private:dist_zip.bzl", _java_dist_zip = "java_dist_zip")
load("//java/private:export.bzl", _java_export = "java_export")
load("//java/private:javadoc.bzl", _javadoc = "javadoc")
load("//java/private:module.bzl", _java_module = "java_module")
load("//java/private:test.bzl", _java_selenium_test_suite = "java_selenium_test_suite", _java_test_suite = "java_test_suite")

java_dist_zip = _java_dist_zip
java_export = _java_export
javadoc = _javadoc
java_module = _java_module
java_selenium_test_suite = _java_selenium_test_suite
java_test_suite = _java_test_suite
