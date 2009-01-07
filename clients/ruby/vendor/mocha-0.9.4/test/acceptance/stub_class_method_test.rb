require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubClassMethodTest < Test::Unit::TestCase

  include AcceptanceTest
   
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_stub_method_within_test
    klass = Class.new do
      class << self
        def my_class_method
          :original_return_value
        end
      end
    end
    test_result = run_test do
      klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, klass.my_class_method
    end
    assert_passed(test_result)
  end

  def test_should_leave_stubbed_public_method_unchanged_after_test
    klass = Class.new do
      class << self
        def my_class_method
          :original_return_value
        end
      end
    end
    run_test do
      klass.stubs(:my_class_method).returns(:new_return_value)
    end
    assert klass.public_methods(false).any? { |m| m.to_s == 'my_class_method' }
    assert_equal :original_return_value, klass.my_class_method
  end
  
  def test_should_leave_stubbed_protected_method_unchanged_after_test
    klass = Class.new do
      class << self
        def my_class_method
          :original_return_value
        end
        protected :my_class_method
      end
    end
    run_test do
      klass.stubs(:my_class_method).returns(:new_return_value)
    end
    assert klass.protected_methods(false).any? { |m| m.to_s == 'my_class_method' }
    assert_equal :original_return_value, klass.send(:my_class_method)
  end
  
  def test_should_leave_stubbed_private_method_unchanged_after_test
    klass = Class.new do
      class << self
        def my_class_method
          :original_return_value
        end
        private :my_class_method
      end
    end
    run_test do
      klass.stubs(:my_class_method).returns(:new_return_value)
    end
    assert klass.private_methods(false).any? { |m| m.to_s == 'my_class_method' }
    assert_equal :original_return_value, klass.send(:my_class_method)
  end
  
  def test_should_reset_class_expectations_after_test
    klass = Class.new do
      class << self
        def my_class_method
          :original_return_value
        end
      end
    end
    run_test do
      klass.stubs(:my_class_method)
    end
    assert_equal 0, klass.mocha.expectations.length
  end  
  
  def test_should_be_able_to_stub_a_superclass_method
    superklass = Class.new do
      class << self
        def my_superclass_method
          :original_return_value
        end
      end
    end
    klass = Class.new(superklass)
    test_result = run_test do
      klass.stubs(:my_superclass_method).returns(:new_return_value)
      assert_equal :new_return_value, klass.my_superclass_method
    end
    assert_passed(test_result)
    superklass_public_methods = superklass.public_methods - superklass.superclass.public_methods
    assert superklass_public_methods.any? { |m| m.to_s == 'my_superclass_method' }
    klass_public_methods = klass.public_methods - klass.superclass.public_methods
    assert !klass_public_methods.any? { |m| m.to_s == 'my_superclass_method' }
    assert_equal :original_return_value, superklass.my_superclass_method
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_public_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def public_methods(include_superclass = true)
          ['my_class_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_public_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def public_methods(include_superclass = true)
          [:my_class_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_protected_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def protected_methods(include_superclass = true)
          ['my_class_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_protected_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def protected_methods(include_superclass = true)
          [:my_class_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_private_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def private_methods(include_superclass = true)
          ['my_class_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_private_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def private_methods(include_superclass = true)
          [:my_class_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.stubs(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.my_class_method
    end
    assert_passed(test_result)
  end
  
end