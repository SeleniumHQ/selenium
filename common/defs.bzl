load("@bazel_skylib//rules:copy_file.bzl", _copy_file = "copy_file")
load("//common/private:selenium_test.bzl", _selenium_test = "selenium_test")

copy_file = _copy_file
selenium_test = _selenium_test
