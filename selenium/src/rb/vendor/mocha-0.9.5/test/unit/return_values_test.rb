require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/return_values'

class ReturnValuesTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_return_nil
    values = ReturnValues.new
    assert_nil values.next
  end

  def test_should_keep_returning_nil
    values = ReturnValues.new
    values.next
    assert_nil values.next
    assert_nil values.next
  end

  def test_should_return_evaluated_single_return_value
    values = ReturnValues.new(SingleReturnValue.new('value'))
    assert_equal 'value', values.next
  end

  def test_should_keep_returning_evaluated_single_return_value
    values = ReturnValues.new(SingleReturnValue.new('value'))
    values.next
    assert_equal 'value', values.next
    assert_equal 'value', values.next
  end

  def test_should_return_consecutive_evaluated_single_return_values
    values = ReturnValues.new(SingleReturnValue.new('value_1'), SingleReturnValue.new('value_2'))
    assert_equal 'value_1', values.next
    assert_equal 'value_2', values.next
  end

  def test_should_keep_returning_last_of_consecutive_evaluated_single_return_values
    values = ReturnValues.new(SingleReturnValue.new('value_1'), SingleReturnValue.new('value_2'))
    values.next
    values.next
    assert_equal 'value_2', values.next
    assert_equal 'value_2', values.next
  end
  
  def test_should_build_single_return_values_for_each_values
    values = ReturnValues.build('value_1', 'value_2', 'value_3').values
    assert_equal 'value_1', values[0].evaluate
    assert_equal 'value_2', values[1].evaluate
    assert_equal 'value_3', values[2].evaluate
  end
  
  def test_should_combine_two_sets_of_return_values
    values_1 = ReturnValues.build('value_1')
    values_2 = ReturnValues.build('value_2a', 'value_2b')
    values = (values_1 + values_2).values
    assert_equal 'value_1', values[0].evaluate
    assert_equal 'value_2a', values[1].evaluate
    assert_equal 'value_2b', values[2].evaluate
  end

end