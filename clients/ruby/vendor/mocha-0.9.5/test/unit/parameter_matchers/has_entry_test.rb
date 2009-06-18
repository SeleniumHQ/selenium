require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/has_entry'
require 'mocha/parameter_matchers/object'
require 'mocha/parameter_matchers/equals'
require 'mocha/inspect'

class HasEntryTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_hash_including_specified_key_value_pair
    matcher = has_entry(:key_1, 'value_1')
    assert matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_not_match_hash_not_including_specified_key_value_pair
    matcher = has_entry(:key_1, 'value_2')
    assert !matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_match_hash_including_specified_entry
    matcher = has_entry(:key_1 => 'value_1')
    assert matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_not_match_hash_not_including_specified_entry
    matcher = has_entry(:key_1 => 'value_2')
    assert !matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_describe_matcher_with_key_value_pair
    matcher = has_entry(:key_1, 'value_1')
    assert_equal "has_entry(:key_1 => 'value_1')", matcher.mocha_inspect
  end
  
  def test_should_describe_matcher_with_entry
    matcher = has_entry(:key_1 => 'value_1')
    assert_equal "has_entry(:key_1 => 'value_1')", matcher.mocha_inspect
  end
  
  def test_should_match_hash_including_specified_entry_with_nested_key_matcher
    matcher = has_entry(equals(:key_1) => 'value_1')
    assert matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_match_hash_including_specified_entry_with_nested_value_matcher
    matcher = has_entry(:key_1 => equals('value_1'))
    assert matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_not_match_hash_not_including_specified_entry_with_nested_key_matcher
    matcher = has_entry(equals(:key_1) => 'value_2')
    assert !matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
  def test_should_not_match_hash_not_including_specified_entry_with_nested_value_matcher
    matcher = has_entry(:key_1 => equals('value_2'))
    assert !matcher.matches?([{ :key_1 => 'value_1', :key_2 => 'value_2' }])
  end
  
end