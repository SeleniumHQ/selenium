require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/includes'
require 'mocha/inspect'

class IncludesTest < Test::Unit::TestCase

  include Mocha::ParameterMatchers

  def test_should_match_object_including_value
    matcher = includes(:x)
    assert matcher.matches?([[:x, :y, :z]])
  end

  def test_should_not_match_object_that_does_not_include_value
    matcher = includes(:not_included)
    assert !matcher.matches?([[:x, :y, :z]])
  end

  def test_should_describe_matcher
    matcher = includes(:x)
    assert_equal "includes(:x)", matcher.mocha_inspect
  end

end
