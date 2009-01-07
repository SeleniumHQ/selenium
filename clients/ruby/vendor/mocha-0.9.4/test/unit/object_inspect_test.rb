require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/inspect'
require 'method_definer'

class ObjectInspectTest < Test::Unit::TestCase
  
  def test_should_return_default_string_representation_of_object_not_including_instance_variables
    object = Object.new
    class << object
      attr_accessor :attribute
    end
    object.attribute = 'instance_variable'
    assert_match Regexp.new("^#<Object:0x[0-9A-Fa-f]{1,8}.*>$"), object.mocha_inspect
    assert_no_match(/instance_variable/, object.mocha_inspect)
  end
  
  def test_should_return_customized_string_representation_of_object
    object = Object.new
    class << object
      define_method(:inspect) { 'custom_inspect' }
    end
    assert_equal 'custom_inspect', object.mocha_inspect
  end
  
  def test_should_use_underscored_id_instead_of_object_id_or_id_so_that_they_can_be_stubbed
    object = Object.new
    object.define_instance_accessor(:called)
    object.called = false
    object.replace_instance_method(:object_id) { self.called = true; 1 }
    if RUBY_VERSION < '1.9'
      object.replace_instance_method(:id) { self.called = true; 1 }
    end
    object.mocha_inspect
    assert_equal false, object.called
  end
  
end
