require File.expand_path(File.dirname(__FILE__) + '/spartan/internals')
require File.expand_path(File.dirname(__FILE__) + '/spartan/object_extensions')
require File.expand_path(File.dirname(__FILE__) + '/spartan/test_case_extensions')
require "test/unit"

Object.send :include, Spartan::ObjectExtensions
Test::Unit::TestCase.send :extend, Spartan::TestCaseExtensions
