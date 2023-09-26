load("//rust/private:rustfmt_config.bzl", _rustfmt_config = "rustfmt_config")
load(
    "//rust/private:rustfmt_wrapper.bzl",
    _rust_binary = "rust_binary",
    _rust_library = "rust_library",
    _rust_test = "rust_test",
    _rust_test_suite = "rust_test_suite",
)

rust_binary = _rust_binary
rust_library = _rust_library
rust_test = _rust_test
rust_test_suite = _rust_test_suite
rustfmt_config = _rustfmt_config
