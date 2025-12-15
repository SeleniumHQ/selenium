# Rust Testing Guide

This guide helps contributors write tests in the Selenium Rust codebase.

- `bazel test //rust/...`

Recommended flags: 
* `--test_env=RUST_BACKTRACE=full` (see full errors)
* `--test_env=RUST_TEST_NOCAPTURE=1` (display output)
