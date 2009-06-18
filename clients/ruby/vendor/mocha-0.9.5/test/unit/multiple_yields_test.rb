require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/multiple_yields'

class MultipleYieldsTest < Test::Unit::TestCase
  
  include Mocha

  def test_should_provide_parameters_for_multiple_yields_in_single_invocation
    parameter_group = MultipleYields.new([1, 2, 3], [4, 5])
    parameter_groups = []
    parameter_group.each do |parameters|
      parameter_groups << parameters
    end
    assert_equal [[1, 2, 3], [4, 5]], parameter_groups
  end
  
end
