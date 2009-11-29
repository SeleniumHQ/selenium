require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubAnyInstanceMethodTest < Test::Unit::TestCase

  include AcceptanceTest
   
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_stub_method_within_test
    klass = Class.new do
      def my_instance_method
        :original_return_value
      end
    end
    instance = klass.new
    test_result = run_test do
      klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_leave_stubbed_public_method_unchanged_after_test
    klass = Class.new do
      def my_instance_method
        :original_return_value
      end
    end
    instance = klass.new
    run_test do
      klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.public_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.my_instance_method
  end
  
  def test_should_leave_stubbed_protected_method_unchanged_after_test
    klass = Class.new do
      def my_instance_method
        :original_return_value
      end
      protected :my_instance_method
    end
    instance = klass.new
    run_test do
      klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.protected_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.send(:my_instance_method)
  end
  
  def test_should_leave_stubbed_private_method_unchanged_after_test
    klass = Class.new do
      def my_instance_method
        :original_return_value
      end
      private :my_instance_method
    end
    instance = klass.new
    run_test do
      klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.private_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.send(:my_instance_method)
  end
  
  def test_should_reset_expectations_after_test
    klass = Class.new do
      def my_instance_method
        :original_return_value
      end
    end
    instance = klass.new
    run_test do
      klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert_equal 0, klass.any_instance.mocha.expectations.length
  end
  
  def test_should_be_able_to_stub_a_superclass_method
    superklass = Class.new do
      def my_superclass_method
        :original_return_value
      end
    end
    klass = Class.new(superklass)
    instance = klass.new
    test_result = run_test do
      klass.any_instance.stubs(:my_superclass_method).returns(:new_return_value)
      assert_equal :new_return_value, instance.my_superclass_method
    end
    assert_passed(test_result)
    assert instance.public_methods(true).any? { |m| m.to_s == 'my_superclass_method' }
    assert !klass.public_methods(false).any? { |m| m.to_s == 'my_superclass_method' }
    assert_equal :original_return_value, instance.my_superclass_method
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_public_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def public_instance_methods(include_superclass = true)
          ['my_instance_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_public_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def public_instance_methods(include_superclass = true)
          [:my_instance_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_protected_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def protected_instance_methods(include_superclass = true)
          ['my_instance_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_protected_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def protected_instance_methods(include_superclass = true)
          [:my_instance_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_private_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby18_klass = Class.new do
      class << self
        def private_instance_methods(include_superclass = true)
          ['my_instance_method']
        end
      end
    end
    test_result = run_test do
      ruby18_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end

  def test_should_be_able_to_stub_method_if_ruby19_private_instance_methods_include_method_but_method_does_not_actually_exist_like_active_record_association_proxy
    ruby19_klass = Class.new do
      class << self
        def private_instance_methods(include_superclass = true)
          [:my_instance_method]
        end
      end
    end
    test_result = run_test do
      ruby19_klass.any_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_klass.new.my_instance_method
    end
    assert_passed(test_result)
  end

end