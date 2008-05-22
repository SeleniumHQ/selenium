require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/metaclass'

class MetaclassTest < Test::Unit::TestCase
  
  def test_should_return_objects_singleton_class
    object = Object.new
    assert_raises(NoMethodError) { object.success? }

    object = Object.new
    assert object.__metaclass__.ancestors.include?(Object)
    assert object.__metaclass__.ancestors.include?(Kernel)
    assert object.__metaclass__.is_a?(Class)

    object.__metaclass__.class_eval { def success?; true; end }
    assert object.success?
    
    object = Object.new
    assert_raises(NoMethodError) { object.success? }
  end
  
end