require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/mock'
require 'method_definer'

require 'mocha/object'

class ObjectTest < Test::Unit::TestCase
  
  include Mocha
    
  def test_should_build_mocha
    instance = Object.new
    mocha = instance.mocha
    assert_not_nil mocha
    assert mocha.is_a?(Mock)
  end
  
  def test_should_reuse_existing_mocha
    instance = Object.new
    mocha_1 = instance.mocha
    mocha_2 = instance.mocha
    assert_equal mocha_1, mocha_2
  end
  
  def test_should_reset_mocha
    instance = Object.new
    assert_nil instance.reset_mocha
  end
  
  def test_should_stub_instance_method
    instance = Object.new
    $stubba = Mock.new
    $stubba.expects(:stub).with(Mocha::InstanceMethod.new(instance, :method1))
    instance.expects(:method1)
    $stubba.verify
  end 
  
  def test_should_build_and_store_expectation
    instance = Object.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    expectation = instance.expects(:method1)
    assert_equal [expectation], instance.mocha.expectations.to_a
  end
  
  def test_should_verify_expectations
    instance = Object.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    instance.expects(:method1).with(:value1, :value2)
    assert_raise(ExpectationError) { instance.verify }
  end
  
  def test_should_pass_backtrace_into_expects
    instance = Object.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    mocha = Object.new
    mocha.define_instance_accessor(:expects_parameters)
    mocha.define_instance_method(:expects) { |*parameters| self.expects_parameters = parameters }
    backtrace = Object.new
    instance.define_instance_method(:mocha) { mocha }
    instance.define_instance_method(:caller) { backtrace }
    instance.expects(:method1)
    assert_equal [:method1, backtrace], mocha.expects_parameters
  end
      
  def test_should_pass_backtrace_into_stubs
    instance = Object.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    mocha = Object.new
    mocha.define_instance_accessor(:stubs_parameters)
    mocha.define_instance_method(:stubs) { |*parameters| self.stubs_parameters = parameters }
    backtrace = Object.new
    instance.define_instance_method(:mocha) { mocha }
    instance.define_instance_method(:caller) { backtrace }
    instance.stubs(:method1)
    assert_equal [:method1, backtrace], mocha.stubs_parameters
  end
      
  def test_should_build_any_instance_object
    klass = Class.new
    any_instance = klass.any_instance
    assert_not_nil any_instance
    assert any_instance.is_a?(Class::AnyInstance)
  end
  
  def test_should_return_same_any_instance_object
    klass = Class.new
    any_instance_1 = klass.any_instance
    any_instance_2 = klass.any_instance
    assert_equal any_instance_1, any_instance_2
  end
  
  def test_should_stub_class_method
    klass = Class.new
    $stubba = Mock.new
    $stubba.expects(:stub).with(Mocha::ClassMethod.new(klass, :method1))
    klass.expects(:method1)
    $stubba.verify
  end 
  
  def test_should_build_and_store_class_method_expectation
    klass = Class.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    expectation = klass.expects(:method1)
    assert_equal [expectation], klass.mocha.expectations.to_a
  end
  
  def test_should_stub_module_method
    mod = Module.new
    $stubba = Mock.new
    $stubba.expects(:stub).with(Mocha::ClassMethod.new(mod, :method1))
    mod.expects(:method1)
    $stubba.verify
  end
  
  def test_should_build_and_store_module_method_expectation
    mod = Module.new
    $stubba = Mock.new
    $stubba.stubs(:stub)
    expectation = mod.expects(:method1)
    assert_equal [expectation], mod.mocha.expectations.to_a
  end
  
  def test_should_use_stubba_instance_method_for_object
    assert_equal Mocha::InstanceMethod, Object.new.stubba_method
  end
    
  def test_should_use_stubba_class_method_for_module
    assert_equal Mocha::ClassMethod, Module.new.stubba_method
  end
    
  def test_should_use_stubba_class_method_for_class
    assert_equal Mocha::ClassMethod, Class.new.stubba_method
  end
  
  def test_should_use_stubba_class_method_for_any_instance
    assert_equal Mocha::AnyInstanceMethod, Class::AnyInstance.new(nil).stubba_method
  end
  
  def test_should_stub_self_for_object
    object = Object.new
    assert_equal object, object.stubba_object
  end
      
  def test_should_stub_self_for_module
    mod = Module.new
    assert_equal mod, mod.stubba_object
  end
      
  def test_should_stub_self_for_class
    klass = Class.new
    assert_equal klass, klass.stubba_object
  end
      
  def test_should_stub_relevant_class_for_any_instance
    klass = Class.new
    any_instance = Class::AnyInstance.new(klass)
    assert_equal klass, any_instance.stubba_object
  end
  
end