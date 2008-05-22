require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/has_value'
require 'mocha/inspect'

class HasValueTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_hash_including_specified_value
    matcher = has_value('value_1')
    assert matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_not_match_hash_not_including_specified_value
    matcher = has_value('value_1')
    assert !matcher.matches?([{ :key_2 => 'value_2' }])
  end
  
  def test_should_describe_matcher
    matcher = has_value('value_1')
    assert_equal "has_value('value_1')", matcher.mocha_inspect
  end
  
end