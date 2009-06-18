require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/no_yields'

class NoYieldsTest < Test::Unit::TestCase
  
  include Mocha

  def test_should_provide_parameters_for_no_yields_in_single_invocation
    parameter_group = NoYields.new
    parameter_groups = []
    parameter_group.each do |parameters|
      parameter_groups << parameters
    end
    assert_equal [], parameter_groups
  end
  
end
