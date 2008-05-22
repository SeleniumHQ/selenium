require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/kind_of'
require 'mocha/inspect'

class KindOfTest < Test::Unit::TestCase

  include Mocha::ParameterMatchers

  def test_should_match_object_that_is_a_kind_of_specified_class
    matcher = kind_of(Integer)
    assert matcher.matches?([99])
  end

  def test_should_not_match_object_that_is_not_a_kind_of_specified_class
    matcher = kind_of(Integer)
    assert !matcher.matches?(['string'])
  end

  def test_should_describe_matcher
    matcher = kind_of(Integer)
    assert_equal "kind_of(Integer)", matcher.mocha_inspect
  end

end
