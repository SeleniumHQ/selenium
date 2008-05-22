require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/single_return_value'
require 'deprecation_disabler'

class SingleReturnValueTest < Test::Unit::TestCase
  
  include Mocha
  include DeprecationDisabler
  
  def test_should_return_value
    value = SingleReturnValue.new('value')
    assert_equal 'value', value.evaluate
  end
  
  def test_should_return_result_of_calling_proc
    proc = lambda { 'value' }
    value = SingleReturnValue.new(proc)
    result = nil
    disable_deprecations { result = value.evaluate }
    assert_equal 'value', result
  end
  
  def test_should_indicate_deprecated_use_of_expectation_returns_method
    proc = lambda {}
    value = SingleReturnValue.new(proc)
    Deprecation.messages = []
    disable_deprecations { value.evaluate }
    expected_message = "use of Expectation#returns with instance of Proc - see Expectation#returns RDoc for alternatives"
    assert_equal [expected_message], Deprecation.messages
  end
  
end
