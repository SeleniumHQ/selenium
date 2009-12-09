require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/not'
require 'mocha/inspect'
require 'stub_matcher'

class NotTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_if_matcher_does_not_match
    matcher = Not(Stub::Matcher.new(false))
    assert matcher.matches?(['any_old_value'])
  end
  
  def test_should_not_match_if_matcher_does_match
    matcher = Not(Stub::Matcher.new(true))
    assert !matcher.matches?(['any_old_value'])
  end
  
  def test_should_describe_matcher
    matcher = Not(Stub::Matcher.new(true))
    assert_equal 'Not(matcher(true))', matcher.mocha_inspect
  end
  
end