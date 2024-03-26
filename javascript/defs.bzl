load("//javascript/private:fragment.bzl", _closure_fragment = "closure_fragment")
load("//javascript/private:header.bzl", _closure_lang_file = "closure_lang_file")
load("//javascript/private:mocha_test.bzl", _mocha_test = "mocha_test")
load("//javascript/private:test_suite.bzl", _closure_test_suite = "closure_test_suite")

closure_fragment = _closure_fragment
closure_lang_file = _closure_lang_file
closure_test_suite = _closure_test_suite
mocha_test = _mocha_test
