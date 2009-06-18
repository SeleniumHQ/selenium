require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha'

class Widget
  
  def model
    'original_model'
  end
    
  class << self
  
    def find(options)
      []
    end
  
    def create(attributes)
      Widget.new
    end
  
  end
  
end

module Thingy
  
  def self.wotsit
    :hoojamaflip
  end
  
end

class StubbaExampleTest < Test::Unit::TestCase
  
  def test_should_stub_instance_method
    widget = Widget.new
    widget.expects(:model).returns('different_model')
    assert_equal 'different_model', widget.model
  end
  
  def test_should_stub_module_method
    should_stub_module_method
  end
  
  def test_should_stub_module_method_again
    should_stub_module_method
  end
  
  def test_should_stub_class_method
    should_stub_class_method
  end
  
  def test_should_stub_class_method_again
    should_stub_class_method
  end
  
  def test_should_stub_instance_method_on_any_instance_of_a_class
    should_stub_instance_method_on_any_instance_of_a_class
  end
  
  def test_should_stub_instance_method_on_any_instance_of_a_class_again
    should_stub_instance_method_on_any_instance_of_a_class
  end
  
  def test_should_stub_two_different_class_methods
    should_stub_two_different_class_methods
  end
  
  def test_should_stub_two_different_class_methods_again
    should_stub_two_different_class_methods
  end
  
  private
  
  def should_stub_module_method
    Thingy.expects(:wotsit).returns(:dooda)
    assert_equal :dooda, Thingy.wotsit
  end
  
  def should_stub_class_method
    widgets = [Widget.new]
    Widget.expects(:find).with(:all).returns(widgets)
    assert_equal widgets, Widget.find(:all)
  end 
  
  def should_stub_two_different_class_methods
    found_widgets = [Widget.new]
    created_widget = Widget.new
    Widget.expects(:find).with(:all).returns(found_widgets)
    Widget.expects(:create).with(:model => 'wombat').returns(created_widget)
    assert_equal found_widgets, Widget.find(:all)
    assert_equal created_widget, Widget.create(:model => 'wombat')
  end
  
  def should_stub_instance_method_on_any_instance_of_a_class
    Widget.any_instance.expects(:model).at_least_once.returns('another_model')
    widget_1 = Widget.new
    widget_2 = Widget.new
    assert_equal 'another_model', widget_1.model
    assert_equal 'another_model', widget_2.model
  end

end