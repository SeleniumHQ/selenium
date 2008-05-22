require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/infinite_range'
require 'date'

class InfiniteRangeTest < Test::Unit::TestCase
  
  def test_should_include_values_at_or_above_minimum
    range = Range.at_least(10)
    assert(range === 10)
    assert(range === 11)
    assert(range === 1000000)
  end
  
  def test_should_not_include_values_below_minimum
    range = Range.at_least(10)
    assert_false(range === 0)
    assert_false(range === 9)
    assert_false(range === -11)
  end
  
  def test_should_be_human_readable_description_for_at_least
    assert_equal "at least 10", Range.at_least(10).mocha_inspect
  end
  
  def test_should_include_values_at_or_below_maximum
    range = Range.at_most(10)
    assert(range === 10)
    assert(range === 0)
    assert(range === -1000000)
  end
  
  def test_should_not_include_values_above_maximum
    range = Range.at_most(10)
    assert_false(range === 11)
    assert_false(range === 1000000)
  end
  
  def test_should_be_human_readable_description_for_at_most
    assert_equal "at most 10", Range.at_most(10).mocha_inspect
  end
  
  def test_should_be_same_as_standard_to_string
    assert_equal((1..10).to_s, (1..10).mocha_inspect)
    assert_equal((1...10).to_s, (1...10).mocha_inspect)
    date_range = Range.new(Date.parse('2006-01-01'), Date.parse('2007-01-01'))
    assert_equal date_range.to_s, date_range.mocha_inspect
  end
  
  def assert_false(condition)
    assert(!condition)
  end
  
end