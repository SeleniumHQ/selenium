require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/yield_parameters'
require 'mocha/no_yields'
require 'mocha/single_yield'
require 'mocha/multiple_yields'

class YieldParametersTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_return_null_yield_parameter_group_by_default
    yield_parameters = YieldParameters.new
    assert yield_parameters.next_invocation.is_a?(NoYields)
  end
  
  def test_should_return_single_yield_parameter_group
    yield_parameters = YieldParameters.new
    yield_parameters.add(1, 2, 3)
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [1, 2, 3], parameter_group.parameters
  end
  
  def test_should_keep_returning_single_yield_parameter_group
    yield_parameters = YieldParameters.new
    yield_parameters.add(1, 2, 3)
    yield_parameters.next_invocation
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [1, 2, 3], parameter_group.parameters
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [1, 2, 3], parameter_group.parameters
  end
  
  def test_should_return_consecutive_single_yield_parameter_groups
    yield_parameters = YieldParameters.new
    yield_parameters.add(1, 2, 3)
    yield_parameters.add(4, 5)
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [1, 2, 3], parameter_group.parameters
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [4, 5], parameter_group.parameters
  end
  
  def test_should_return_multiple_yield_parameter_group
    yield_parameters = YieldParameters.new
    yield_parameters.multiple_add([1, 2, 3], [4, 5])
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[1, 2, 3], [4, 5]], parameter_group.parameter_groups
  end
  
  def test_should_keep_returning_multiple_yield_parameter_group
    yield_parameters = YieldParameters.new
    yield_parameters.multiple_add([1, 2, 3], [4, 5])
    yield_parameters.next_invocation
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[1, 2, 3], [4, 5]], parameter_group.parameter_groups
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[1, 2, 3], [4, 5]], parameter_group.parameter_groups
  end
  
  def test_should_return_consecutive_multiple_yield_parameter_groups
    yield_parameters = YieldParameters.new
    yield_parameters.multiple_add([1, 2, 3], [4, 5])
    yield_parameters.multiple_add([6, 7], [8, 9, 0])
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[1, 2, 3], [4, 5]], parameter_group.parameter_groups
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[6, 7], [8, 9, 0]], parameter_group.parameter_groups
  end
  
  def test_should_return_consecutive_single_and_multiple_yield_parameter_groups
    yield_parameters = YieldParameters.new
    yield_parameters.add(1, 2, 3)
    yield_parameters.multiple_add([4, 5, 6], [7, 8])
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(SingleYield)
    assert_equal [1, 2, 3], parameter_group.parameters
    parameter_group = yield_parameters.next_invocation
    assert parameter_group.is_a?(MultipleYields)
    assert_equal [[4, 5, 6], [7, 8]], parameter_group.parameter_groups
  end
  
end