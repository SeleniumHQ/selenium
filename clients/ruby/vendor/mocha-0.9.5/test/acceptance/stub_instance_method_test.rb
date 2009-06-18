require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubInstanceMethodTest < Test::Unit::TestCase

  include AcceptanceTest
   
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_leave_stubbed_public_method_unchanged_after_test
    instance = Class.new do
      def my_instance_method
        :original_return_value
      end
    end.new
    run_test do
      instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.public_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.my_instance_method
  end
  
  def test_should_leave_stubbed_protected_method_unchanged_after_test
    instance = Class.new do
      def my_instance_method
        :original_return_value
      end
      protected :my_instance_method
    end.new
    run_test do
      instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.protected_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.send(:my_instance_method)
  end
  
  def test_should_leave_stubbed_private_method_unchanged_after_test
    instance = Class.new do
      def my_instance_method
        :original_return_value
      end
      private :my_instance_method
    end.new
    run_test do
      instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert instance.private_methods(false).any? { |m| m.to_s == 'my_instance_method' }
    assert_equal :original_return_value, instance.send(:my_instance_method)
  end
  
  def test_should_reset_expectations_after_test
    instance = Class.new do
      def my_instance_method
        :original_return_value
      end
    end.new
    run_test do
      instance.stubs(:my_instance_method).returns(:new_return_value)
    end
    assert_equal 0, instance.mocha.expectations.length
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
      instance.stubs(:my_superclass_method).returns(:new_return_value)
      assert_equal :new_return_value, instance.my_superclass_method
    end
    assert_passed(test_result)
    assert instance.public_methods(true).any? { |m| m.to_s == 'my_superclass_method' }
    assert !instance.public_methods(false).any? { |m| m.to_s == 'my_superclass_method' }
    assert_equal :original_return_value, instance.my_superclass_method
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_public_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby18_instance = Class.new do
      def public_methods(include_superclass = true)
        ['my_instance_method']
      end
    end.new
    test_result = run_test do
      ruby18_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_public_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby19_instance = Class.new do
      def public_methods(include_superclass = true)
        [:my_instance_method]
      end
    end.new
    test_result = run_test do
      ruby19_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_protected_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby18_instance = Class.new do
      def protected_methods(include_superclass = true)
        ['my_instance_method']
      end
    end.new
    test_result = run_test do
      ruby18_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_protected_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby19_instance = Class.new do
      def protected_methods(include_superclass = true)
        [:my_instance_method]
      end
    end.new
    test_result = run_test do
      ruby19_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby18_private_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby18_instance = Class.new do
      def private_methods(include_superclass = true)
        ['my_instance_method']
      end
    end.new
    test_result = run_test do
      ruby18_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby18_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_stub_method_if_ruby19_private_methods_include_method_but_method_does_not_exist_like_active_record_association_proxy
    ruby19_instance = Class.new do
      def private_methods(include_superclass = true)
        [:my_instance_method]
      end
    end.new
    test_result = run_test do
      ruby19_instance.stubs(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, ruby19_instance.my_instance_method
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_specify_expectations_on_multiple_methods_in_a_single_call_to_expects
    instance = Class.new do
      def my_instance_method_1
        :original_return_value_1
      end
      def my_instance_method_2
        :original_return_value_2
      end
    end.new
    run_test do
      instance.expects(
        :my_instance_method_1 => :new_return_value_1,
        :my_instance_method_2 => :new_return_value_2
      )
      assert_equal :new_return_value_1, instance.my_instance_method_1
      assert_equal :new_return_value_2, instance.my_instance_method_2
    end
  end
  
  def test_should_be_able_to_specify_expectations_on_multiple_methods_in_a_single_call_to_stubs
    instance = Class.new do
      def my_instance_method_1
        :original_return_value_1
      end
      def my_instance_method_2
        :original_return_value_2
      end
    end.new
    run_test do
      instance.stubs(
        :my_instance_method_1 => :new_return_value_1,
        :my_instance_method_2 => :new_return_value_2
      )
      assert_equal :new_return_value_1, instance.my_instance_method_1
      assert_equal :new_return_value_2, instance.my_instance_method_2
    end
  end

end