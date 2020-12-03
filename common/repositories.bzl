load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//common/private:drivers.bzl", "local_drivers")

def pin_browsers():
    local_drivers()

