require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/mock'
require 'mocha/expectation_error'
require 'set'
require 'simple_counter'

class MockTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_set_single_expectation
   mock = Mock.new
   mock.expects(:method1).returns(1)
   assert_nothing_raised(ExpectationError) do
     assert_equal 1, mock.method1
   end
  end 

  def test_should_build_and_store_expectations
   mock = Mock.new
   expectation = mock.expects(:method1)
   assert_not_nil expectation
   assert_equal [expectation], mock.expectations.to_a
  end
  
  def test_should_not_stub_everything_by_default
    mock = Mock.new
    assert_equal false, mock.everything_stubbed
  end
  
  def test_should_stub_everything
    mock = Mock.new
    mock.stub_everything
    assert_equal true, mock.everything_stubbed
  end
  
  def test_should_be_able_to_extend_mock_object_with_module
    mock = Mock.new
    assert_nothing_raised(ExpectationError) { mock.extend(Module.new) }
  end
  
  def test_should_be_equal
    mock = Mock.new
    assert_equal true, mock.eql?(mock)
  end
  
  if RUBY_VERSION < '1.9'
    OBJECT_METHODS = STANDARD_OBJECT_PUBLIC_INSTANCE_METHODS.reject { |m| m =~ /^__.*__$/ }
  else
    OBJECT_METHODS = STANDARD_OBJECT_PUBLIC_INSTANCE_METHODS.reject { |m| m =~ /^__.*__$/ || m == :object_id }
  end
  
  def test_should_be_able_to_mock_standard_object_methods
    mock = Mock.new
    OBJECT_METHODS.each { |method| mock.__expects__(method.to_sym).returns(method) }
    OBJECT_METHODS.each { |method| assert_equal method, mock.__send__(method.to_sym) }
    assert mock.__verified__?
  end
  
  def test_should_be_able_to_stub_standard_object_methods
    mock = Mock.new
    OBJECT_METHODS.each { |method| mock.__stubs__(method.to_sym).returns(method) }
    OBJECT_METHODS.each { |method| assert_equal method, mock.__send__(method.to_sym) }
  end
  
  def test_should_create_and_add_expectations
    mock = Mock.new
    expectation1 = mock.expects(:method1)
    expectation2 = mock.expects(:method2)
    assert_equal [expectation1, expectation2].to_set, mock.expectations.to_set
  end
  
  def test_should_pass_backtrace_into_expectation
    mock = Mock.new
    backtrace = Object.new
    expectation = mock.expects(:method1, backtrace)
    assert_equal backtrace, expectation.backtrace
  end
  
  def test_should_pass_backtrace_into_stub
    mock = Mock.new
    backtrace = Object.new
    stub = mock.stubs(:method1, backtrace)
    assert_equal backtrace, stub.backtrace
  end
  
  def test_should_create_and_add_stubs
    mock = Mock.new
    stub1 = mock.stubs(:method1)
    stub2 = mock.stubs(:method2)
    assert_equal [stub1, stub2].to_set, mock.expectations.to_set
  end
  
  def test_should_invoke_expectation_and_return_result
    mock = Mock.new
    mock.expects(:my_method).returns(:result)
    result = mock.my_method
    assert_equal :result, result
  end
  
  def test_should_not_raise_error_if_stubbing_everything
    mock = Mock.new
    mock.stub_everything
    result = nil
    assert_nothing_raised(ExpectationError) do
      result = mock.unexpected_method
    end
    assert_nil result
  end
  
  def test_should_raise_assertion_error_for_unexpected_method_call
    mock = Mock.new
    error = assert_raise(ExpectationError) do
      mock.unexpected_method_called(:my_method, :argument1, :argument2)
    end
    assert_match(/unexpected invocation/, error.message)
    assert_match(/my_method/, error.message)
    assert_match(/argument1/, error.message)
    assert_match(/argument2/, error.message)
  end
  
  def test_should_not_verify_successfully_because_not_all_expectations_have_been_satisfied
    mock = Mock.new
    mock.expects(:method1)
    mock.expects(:method2)
    mock.method1
    assert !mock.__verified__?
  end
  
  def test_should_increment_assertion_counter_for_every_verified_expectation
    mock = Mock.new
    
    mock.expects(:method1)
    mock.method1
    
    mock.expects(:method2)
    mock.method2
    
    assertion_counter = SimpleCounter.new
    
    mock.__verified__?(assertion_counter)
    
    assert_equal 2, assertion_counter.count
  end
  
  def test_should_yield_supplied_parameters_to_block
    mock = Mock.new
    parameters_for_yield = [1, 2, 3]
    mock.expects(:method1).yields(*parameters_for_yield)
    yielded_parameters = nil
    mock.method1() { |*parameters| yielded_parameters = parameters }
    assert_equal parameters_for_yield, yielded_parameters
  end
  
  def test_should_set_up_multiple_expectations_with_return_values
    mock = Mock.new
    mock.expects(:method1 => :result1, :method2 => :result2)
    assert_equal :result1, mock.method1
    assert_equal :result2, mock.method2
  end
  
  def test_should_set_up_multiple_stubs_with_return_values
    mock = Mock.new
    mock.stubs(:method1 => :result1, :method2 => :result2)
    assert_equal :result1, mock.method1
    assert_equal :result2, mock.method2
  end
  
  def test_should_keep_returning_specified_value_for_stubs
    mock = Mock.new
    mock.stubs(:method1).returns(1)
    assert_equal 1, mock.method1
    assert_equal 1, mock.method1
  end
  
  def test_should_keep_returning_specified_value_for_expects
    mock = Mock.new
    mock.expects(:method1).times(2).returns(1)
    assert_equal 1, mock.method1
    assert_equal 1, mock.method1
  end
  
  def test_should_match_most_recent_call_to_expects
    mock = Mock.new
    mock.expects(:method1).returns(0)
    mock.expects(:method1).returns(1)
    assert_equal 1, mock.method1
  end

  def test_should_match_most_recent_call_to_stubs
    mock = Mock.new
    mock.stubs(:method1).returns(0)
    mock.stubs(:method1).returns(1)
    assert_equal 1, mock.method1
  end

  def test_should_match_most_recent_call_to_stubs_or_expects
    mock = Mock.new
    mock.stubs(:method1).returns(0)
    mock.expects(:method1).returns(1)
    assert_equal 1, mock.method1
  end

  def test_should_match_most_recent_call_to_expects_or_stubs
    mock = Mock.new
    mock.expects(:method1).returns(0)
    mock.stubs(:method1).returns(1)
    assert_equal 1, mock.method1
  end
  
  def test_should_respond_to_expected_method
    mock = Mock.new
    mock.expects(:method1)
    assert_equal true, mock.respond_to?(:method1)
  end
  
  def test_should_not_respond_to_unexpected_method
    mock = Mock.new
    assert_equal false, mock.respond_to?(:method1)
  end
  
  def test_should_respond_to_methods_which_the_responder_does_responds_to
    instance = Class.new do
      define_method(:respond_to?) { |symbol| true }
    end.new
    mock = Mock.new
    mock.responds_like(instance)
    assert_equal true, mock.respond_to?(:invoked_method)
  end
  
  def test_should_not_respond_to_methods_which_the_responder_does_not_responds_to
    instance = Class.new do
      define_method(:respond_to?) { |symbol| false }
    end.new
    mock = Mock.new
    mock.responds_like(instance)
    assert_equal false, mock.respond_to?(:invoked_method)
  end
  
  def test_should_return_itself_to_allow_method_chaining
    mock = Mock.new
    assert_same mock.responds_like(Object.new), mock
  end
  
  def test_should_not_raise_no_method_error_if_mock_is_not_restricted_to_respond_like_a_responder
    instance = Class.new do
      define_method(:respond_to?) { true }
    end.new
    mock = Mock.new
    mock.stubs(:invoked_method)
    assert_nothing_raised(NoMethodError) { mock.invoked_method }
  end
  
  def test_should_not_raise_no_method_error_if_responder_does_respond_to_invoked_method
    instance = Class.new do
      define_method(:respond_to?) { |symbol| true }
    end.new
    mock = Mock.new
    mock.responds_like(instance)
    mock.stubs(:invoked_method)
    assert_nothing_raised(NoMethodError) { mock.invoked_method }
  end
  
  def test_should_raise_no_method_error_if_responder_does_not_respond_to_invoked_method
    instance = Class.new do
      define_method(:respond_to?) { |symbol| false }
      define_method(:mocha_inspect) { 'mocha_inspect' }
    end.new
    mock = Mock.new
    mock.responds_like(instance)
    mock.stubs(:invoked_method)
    assert_raises(NoMethodError) { mock.invoked_method }
  end
  
  def test_should_raise_no_method_error_with_message_indicating_that_mock_is_constrained_to_respond_like_responder
    instance = Class.new do
      define_method(:respond_to?) { |symbol| false }
      define_method(:mocha_inspect) { 'mocha_inspect' }
    end.new
    mock = Mock.new
    mock.responds_like(instance)
    mock.stubs(:invoked_method)
    begin
      mock.invoked_method
    rescue NoMethodError => e
      assert_match(/which responds like mocha_inspect/, e.message)
    end
  end
  
  def test_should_handle_respond_to_with_private_methods_param_without_error
    mock = Mock.new
    assert_nothing_raised{ mock.respond_to?(:object_id, false) }
  end
  
  def test_should_respond_to_any_method_if_stubbing_everything
    mock = Mock.new
    mock.stub_everything
    assert mock.respond_to?(:abc)
    assert mock.respond_to?(:xyz)
  end
  
end