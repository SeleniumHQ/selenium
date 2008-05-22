require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/central'
require 'mocha/mock'
require 'method_definer'

class CentralTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_start_with_empty_stubba_methods
    stubba = Central.new
    
    assert_equal [], stubba.stubba_methods
  end
  
  def test_should_stub_method_if_not_already_stubbed
    method = Mock.new
    method.expects(:stub)
    stubba = Central.new
    
    stubba.stub(method)
    
    method.verify
  end
  
  def test_should_not_stub_method_if_already_stubbed
    method = Mock.new
    method.expects(:stub).times(0)
    stubba = Central.new
    stubba_methods = Mock.new
    stubba_methods.stubs(:include?).with(method).returns(true)
    stubba.stubba_methods = stubba_methods
    
    stubba.stub(method)
    
    method.verify
  end
  
  def test_should_record_method
    method = Mock.new
    method.expects(:stub)
    stubba = Central.new
    
    stubba.stub(method)
    
    assert_equal [method], stubba.stubba_methods
  end
  
  def test_should_unstub_all_methods
    stubba = Central.new
    method_1 = Mock.new
    method_1.expects(:unstub)
    method_2 = Mock.new
    method_2.expects(:unstub)
    stubba.stubba_methods = [method_1, method_2]

    stubba.unstub_all
    
    assert_equal [], stubba.stubba_methods
    method_1.verify
    method_2.verify
  end
  
  def test_should_collect_mocks_from_all_methods
    method_1 = Mock.new
    method_1.stubs(:mock).returns(:mock_1)

    method_2 = Mock.new
    method_2.stubs(:mock).returns(:mock_2)

    stubba = Central.new
    stubba.stubba_methods = [method_1, method_2]
    
    assert_equal 2, stubba.unique_mocks.length
    assert stubba.unique_mocks.include?(:mock_1)
    assert stubba.unique_mocks.include?(:mock_2)
  end

  def test_should_return_unique_mochas
    method_1 = Mock.new
    method_1.stubs(:mock).returns(:mock_1)

    method_2 = Mock.new
    method_2.stubs(:mock).returns(:mock_1)

    stubba = Central.new
    stubba.stubba_methods = [method_1, method_2]
    
    assert_equal [:mock_1], stubba.unique_mocks
  end
  
  def test_should_call_verify_on_all_unique_mocks
    mock_class = Class.new do
      attr_accessor :verify_called
      def verify
        self.verify_called = true
      end
    end
    mocks = [mock_class.new, mock_class.new]
    stubba = Central.new
    stubba.replace_instance_method(:unique_mocks) { mocks }
    
    stubba.verify_all
    
    assert mocks.all? { |mock| mock.verify_called }
  end

  def test_should_call_verify_on_all_unique_mochas
    mock_class = Class.new do
      def verify(&block)
        yield if block_given?
      end
    end
    stubba = Central.new
    stubba.replace_instance_method(:unique_mocks) { [mock_class.new] }
    yielded = false
    
    stubba.verify_all { yielded = true }
    
    assert yielded
  end

end
