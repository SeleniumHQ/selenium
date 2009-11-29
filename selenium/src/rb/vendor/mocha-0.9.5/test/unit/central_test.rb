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
    
    assert method.__verified__?
  end
  
  def test_should_not_stub_method_if_already_stubbed
    method = Mock.new
    method.expects(:stub).times(0)
    stubba = Central.new
    stubba_methods = Mock.new
    stubba_methods.stubs(:include?).with(method).returns(true)
    stubba.stubba_methods = stubba_methods
    
    stubba.stub(method)
    
    assert method.__verified__?
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
    assert method_1.__verified__?
    assert method_2.__verified__?
  end
  
end
