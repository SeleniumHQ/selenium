require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/anything'
require 'mocha/inspect'

class AnythingTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_anything
    matcher = anything
    assert matcher.matches?([:something])
    assert matcher.matches?([{'x' => 'y'}])
  end
  
  def test_should_describe_matcher
    matcher = anything
    assert_equal "anything", matcher.mocha_inspect
  end
  
end