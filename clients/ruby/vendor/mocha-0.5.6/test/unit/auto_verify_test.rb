require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/auto_verify'
require 'method_definer'

class AutoVerifyTest < Test::Unit::TestCase
  
  attr_reader :test_case
  
  def setup
    @test_case = Object.new
    class << test_case
      include Mocha::AutoVerify
    end
  end
  
  def test_should_build_mock
    mock = test_case.mock
    assert mock.is_a?(Mocha::Mock)
  end
  
  def test_should_add_expectations_to_mock
    mock = test_case.mock(:method_1 => 'result_1', :method_2 => 'result_2')
    assert_equal 'result_1', mock.method_1
    assert_equal 'result_2', mock.method_2
  end
  
  def test_should_build_stub
    stub = test_case.stub
    assert stub.is_a?(Mocha::Mock)
  end
  
  def test_should_add_expectation_to_stub
    stub = test_case.stub(:method_1 => 'result_1', :method_2 => 'result_2')
    assert_equal 'result_1', stub.method_1
    assert_equal 'result_2', stub.method_2
  end
  
  def test_should_build_stub_that_stubs_all_methods
    stub = test_case.stub_everything
    assert stub.everything_stubbed
  end
  
  def test_should_add_expectations_to_stub_that_stubs_all_methods
    stub = test_case.stub_everything(:method_1 => 'result_1', :method_2 => 'result_2')
    assert_equal 'result_1', stub.method_1
    assert_equal 'result_2', stub.method_2
  end
  
  def test_should_always_new_mock
    assert_not_equal test_case.mock, test_case.mock
  end
  
  def test_should_always_build_new_stub
    assert_not_equal test_case.stub, test_case.stub
  end
  
  def test_should_always_build_new_stub_that_stubs_all_methods
    assert_not_equal test_case.stub, test_case.stub
  end
  
  def test_should_store_each_new_mock
    expected = Array.new(3) { test_case.mock }
    assert_equal expected, test_case.mocks
  end
  
  def test_should_store_each_new_stub
    expected = Array.new(3) { test_case.stub }
    assert_equal expected, test_case.mocks
  end
  
  def test_should_store_each_new_stub_that_stubs_all_methods
    expected = Array.new(3) { test_case.stub_everything }
    assert_equal expected, test_case.mocks
  end
  
  def test_should_verify_each_mock
    mocks = Array.new(3) do
      mock = Object.new
      mock.define_instance_accessor(:verify_called)
      class << mock
        def verify(&block)
          self.verify_called = true
        end
      end
      mock
    end
    test_case.replace_instance_method(:mocks)  { mocks }
    test_case.verify_mocks
    assert mocks.all? { |mock| mock.verify_called }
  end
  
  def test_should_yield_to_block_for_each_assertion
    mock_class = Class.new do
      def verify(&block); yield; end
    end
    mock = mock_class.new
    test_case.replace_instance_method(:mocks)  { [mock] }
    yielded = false
    test_case.verify_mocks { yielded = true }
    assert yielded
  end
  
  def test_should_reset_mocks_on_teardown
    mock = Class.new { define_method(:verify) {} }.new
    test_case.mocks << mock
    test_case.teardown_mocks
    assert test_case.mocks.empty?
  end
  
  def test_should_create_named_mock
    mock = test_case.mock('named_mock')
    assert_equal '#<Mock:named_mock>', mock.mocha_inspect
  end
  
  def test_should_create_named_stub
    stub = test_case.stub('named_stub')
    assert_equal '#<Mock:named_stub>', stub.mocha_inspect
  end
  
  def test_should_create_named_stub_that_stubs_all_methods
    stub = test_case.stub_everything('named_stub')
    assert_equal '#<Mock:named_stub>', stub.mocha_inspect
  end
  
  def test_should_build_sequence
    assert_not_nil test_case.sequence('name')
  end
  
end