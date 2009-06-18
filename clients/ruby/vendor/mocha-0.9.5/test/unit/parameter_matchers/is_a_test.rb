require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/is_a'
require 'mocha/inspect'

class IsATest < Test::Unit::TestCase

  include Mocha::ParameterMatchers

  def test_should_match_object_that_is_a_specified_class
    matcher = is_a(Integer)
    assert matcher.matches?([99])
  end

  def test_should_not_match_object_that_is_not_a_specified_class
    matcher = is_a(Integer)
    assert !matcher.matches?(['string'])
  end

  def test_should_describe_matcher
    matcher = is_a(Integer)
    assert_equal "is_a(Integer)", matcher.mocha_inspect
  end

end
