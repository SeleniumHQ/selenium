require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/all_of'
require 'mocha/inspect'
require 'stub_matcher'

class AllOfTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_if_all_matchers_match
    matcher = all_of(Stub::Matcher.new(true), Stub::Matcher.new(true), Stub::Matcher.new(true))
    assert matcher.matches?(['any_old_value'])
  end
  
  def test_should_not_match_if_any_matcher_does_not_match
    matcher = all_of(Stub::Matcher.new(true), Stub::Matcher.new(false), Stub::Matcher.new(true))
    assert !matcher.matches?(['any_old_value'])
  end
  
  def test_should_describe_matcher
    matcher = all_of(Stub::Matcher.new(true), Stub::Matcher.new(false), Stub::Matcher.new(true))
    assert_equal 'all_of(matcher(true), matcher(false), matcher(true))', matcher.mocha_inspect
  end
  
end