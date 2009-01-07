require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/method_matcher'

class MethodMatcherTest < Test::Unit::TestCase
  
  include Mocha

  def test_should_match_if_actual_method_name_is_same_as_expected_method_name
    method_matcher = MethodMatcher.new(:method_name)
    assert method_matcher.match?(:method_name)
  end

  def test_should_not_match_if_actual_method_name_is_not_same_as_expected_method_name
    method_matcher = MethodMatcher.new(:method_name)
    assert !method_matcher.match?(:different_method_name)
  end
  
  def test_should_describe_what_method_is_expected
    method_matcher = MethodMatcher.new(:method_name)
    assert_equal "method_name", method_matcher.mocha_inspect
  end

end