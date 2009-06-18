require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/responds_with'
require 'mocha/inspect'

class RespondsWithTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_parameter_responding_with_expected_value
    matcher = responds_with(:upcase, 'FOO')
    assert matcher.matches?(['foo'])
  end
  
  def test_should_not_match_parameter_responding_with_unexpected_value
    matcher = responds_with(:upcase, 'FOO')
    assert !matcher.matches?(['bar'])
  end
  
  def test_should_describe_matcher
    matcher = responds_with(:foo, :bar)
    assert_equal 'responds_with(:foo, :bar)', matcher.mocha_inspect
  end
  
end