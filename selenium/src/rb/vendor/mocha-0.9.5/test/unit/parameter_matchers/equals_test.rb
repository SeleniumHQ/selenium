require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/equals'
require 'mocha/inspect'

class EqualsTest < Test::Unit::TestCase

  include Mocha::ParameterMatchers

  def test_should_match_object_that_equals_value
    matcher = equals('x')
    assert matcher.matches?(['x'])
  end

  def test_should_not_match_object_that_does_not_equal_value
    matcher = equals('x')
    assert !matcher.matches?(['y'])
  end

  def test_should_describe_matcher
    matcher = equals('x')
    assert_equal "'x'", matcher.mocha_inspect
  end

end
