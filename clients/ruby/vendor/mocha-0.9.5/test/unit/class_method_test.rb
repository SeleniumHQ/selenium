require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'method_definer'
require 'mocha/mock'

require 'mocha/class_method'

class ClassMethodTest < Test::Unit::TestCase
  
  include Mocha

  def test_should_provide_hidden_version_of_method_name_starting_with_prefix
    method = ClassMethod.new(nil, :original_method_name)
    assert_match(/^__stubba__/, method.hidden_method.to_s)
  end
  
  def test_should_provide_hidden_version_of_method_name_ending_with_suffix
    method = ClassMethod.new(nil, :original_method_name)
    assert_match(/__stubba__$/, method.hidden_method.to_s)
  end
  
  def test_should_provide_hidden_version_of_method_name_including_original_method_name
    method = ClassMethod.new(nil, :original_method_name)
    assert_match(/original_method_name/, method.hidden_method.to_s)
  end
  
  def test_should_provide_hidden_version_of_method_name_substituting_question_mark
    method = ClassMethod.new(nil, :question_mark?)
    assert_no_match(/\?/, method.hidden_method.to_s)
    assert_match(/question_mark_substituted_character_63/, method.hidden_method.to_s)
  end
  
  def test_should_provide_hidden_version_of_method_name_substituting_exclamation_mark
    method = ClassMethod.new(nil, :exclamation_mark!)
    assert_no_match(/!/, method.hidden_method.to_s)
    assert_match(/exclamation_mark_substituted_character_33/, method.hidden_method.to_s)
  end

  def test_should_provide_hidden_version_of_method_name_substituting_equals_sign
    method = ClassMethod.new(nil, :equals_sign=)
    assert_no_match(/\=/, method.hidden_method.to_s)
    assert_match(/equals_sign_substituted_character_61/, method.hidden_method.to_s)
  end

  def test_should_provide_hidden_version_of_method_name_substituting_brackets
    method = ClassMethod.new(nil, :[])
    assert_no_match(/\[\]/, method.hidden_method.to_s)
    assert_match(/substituted_character_91__substituted_character_93/, method.hidden_method.to_s)
  end
  
  def test_should_provide_hidden_version_of_method_name_substituting_plus_sign
    method = ClassMethod.new(nil, :+)
    assert_no_match(/\+/, method.hidden_method.to_s)
    assert_match(/substituted_character_43/, method.hidden_method.to_s)
  end
  
  def test_should_hide_original_method
    klass = Class.new { def self.method_x; end }
    method = ClassMethod.new(klass, :method_x)
    hidden_method_x = method.hidden_method
    
    method.hide_original_method

    assert klass.respond_to?(hidden_method_x)
  end
  
  def test_should_respond_to_original_method_name_after_original_method_has_been_hidden
    klass = Class.new { def self.original_method_name; end }
    method = ClassMethod.new(klass, :original_method_name)
    hidden_method_x = method.hidden_method
    
    method.hide_original_method

    assert klass.respond_to?(:original_method_name)
  end
  
  def test_should_not_hide_original_method_if_method_not_defined
    klass = Class.new
    method = ClassMethod.new(klass, :method_x)
    hidden_method_x = method.hidden_method
    
    method.hide_original_method

    assert_equal false, klass.respond_to?(hidden_method_x)
  end
  
  def test_should_define_a_new_method_which_should_call_mocha_method_missing
    klass = Class.new { def self.method_x; end }
    mocha = Mocha::Mock.new
    klass.define_instance_method(:mocha) { mocha }
    mocha.expects(:method_x).with(:param1, :param2).returns(:result)
    method = ClassMethod.new(klass, :method_x)
    
    method.hide_original_method
    method.define_new_method
    result = klass.method_x(:param1, :param2)
    
    assert_equal :result, result
    assert mocha.__verified__?
  end
  
  def test_should_remove_new_method
    klass = Class.new { def self.method_x; end }
    method = ClassMethod.new(klass, :method_x)
    
    method.remove_new_method
    
    assert_equal false, klass.respond_to?(:method_x)
  end

  def test_should_restore_original_method
    klass = Class.new { def self.method_x; end }
    method = ClassMethod.new(klass, :method_x)
    hidden_method_x = method.hidden_method.to_sym
    klass.define_instance_method(hidden_method_x) { :original_result }

    method.remove_new_method
    method.restore_original_method
    
    assert_equal :original_result, klass.method_x 
    assert_equal false, klass.respond_to?(hidden_method_x)
  end

  def test_should_not_restore_original_method_if_hidden_method_is_not_defined
    klass = Class.new { def self.method_x; :new_result; end }
    method = ClassMethod.new(klass, :method_x)

    method.restore_original_method
    
    assert_equal :new_result, klass.method_x
  end

  def test_should_call_hide_original_method
    klass = Class.new { def self.method_x; end }
    method = ClassMethod.new(klass, :method_x)
    method.hide_original_method
    method.define_instance_accessor(:hide_called)
    method.replace_instance_method(:hide_original_method) { self.hide_called = true }
    
    method.stub
    
    assert method.hide_called
  end

  def test_should_call_define_new_method
    klass = Class.new { def self.method_x; end }
    method = ClassMethod.new(klass, :method_x)
    method.define_instance_accessor(:define_called)
    method.replace_instance_method(:define_new_method) { self.define_called = true }
    
    method.stub
    
    assert method.define_called
  end
  
  def test_should_call_remove_new_method
    klass = Class.new { def self.method_x; end }
    klass.define_instance_method(:reset_mocha) { }
    method = ClassMethod.new(klass, :method_x)
    method.define_instance_accessor(:remove_called)
    method.replace_instance_method(:remove_new_method) { self.remove_called = true }
    
    method.unstub
    
    assert method.remove_called
  end

  def test_should_call_restore_original_method
    klass = Class.new { def self.method_x; end }
    klass.define_instance_method(:reset_mocha) { }
    method = ClassMethod.new(klass, :method_x)
    method.define_instance_accessor(:restore_called)
    method.replace_instance_method(:restore_original_method) { self.restore_called = true }
    
    method.unstub
    
    assert method.restore_called
  end

  def test_should_call_reset_mocha
    klass = Class.new { def self.method_x; end }
    klass.define_instance_accessor(:reset_called)
    klass.define_instance_method(:reset_mocha) { self.reset_called = true }
    method = ClassMethod.new(klass, :method_x)
    method.replace_instance_method(:restore_original_method) { }
    
    method.unstub
    
    assert klass.reset_called
  end
  
  def test_should_return_mock_for_stubbee
    mocha = Object.new
    stubbee = Object.new
    stubbee.define_instance_accessor(:mocha) { mocha }
    stubbee.mocha = nil
    method = ClassMethod.new(stubbee, :method_name)
    assert_equal stubbee.mocha, method.mock
  end
  
  def test_should_not_be_equal_if_other_object_has_a_different_class
    class_method = ClassMethod.new(Object.new, :method)
    other_object = Object.new
    assert class_method != other_object
  end

  def test_should_not_be_equal_if_other_class_method_has_different_stubbee
    stubbee_1 = Object.new
    stubbee_2 = Object.new
    class_method_1 = ClassMethod.new(stubbee_1, :method)
    class_method_2 = ClassMethod.new(stubbee_2, :method)
    assert class_method_1 != class_method_2
  end
  
  def test_should_not_be_equal_if_other_class_method_has_different_method
    stubbee = Object.new
    class_method_1 = ClassMethod.new(stubbee, :method_1)
    class_method_2 = ClassMethod.new(stubbee, :method_2)
    assert class_method_1 != class_method_2
  end
  
  def test_should_be_equal_if_other_class_method_has_same_stubbee_and_same_method_so_no_attempt_is_made_to_stub_a_method_twice
    stubbee = Object.new
    class_method_1 = ClassMethod.new(stubbee, :method)
    class_method_2 = ClassMethod.new(stubbee, :method)
    assert class_method_1 == class_method_2
  end
  
  def test_should_be_equal_if_other_class_method_has_same_stubbee_and_same_method_but_stubbee_equal_method_lies_like_active_record_association_proxy
    stubbee = Class.new do
      def equal?(other); false; end
    end.new
    class_method_1 = ClassMethod.new(stubbee, :method)
    class_method_2 = ClassMethod.new(stubbee, :method)
    assert class_method_1 == class_method_2
  end
  
end