require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/object'
require 'mocha/mockery'
require 'mocha/mock'
require 'method_definer'

class ObjectTest < Test::Unit::TestCase
  
  include Mocha
    
  def test_should_build_mocha_referring_to_self
    instance = Object.new
    mocha = instance.mocha
    assert_not_nil mocha
    assert mocha.is_a?(Mock)
    assert_equal instance.mocha_inspect, mocha.mocha_inspect
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
  
  def test_should_use_stubba_instance_method_for_object
    assert_equal Mocha::InstanceMethod, Object.new.stubba_method
  end
    
  def test_should_use_stubba_module_method_for_module
    assert_equal Mocha::ModuleMethod, Module.new.stubba_method
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