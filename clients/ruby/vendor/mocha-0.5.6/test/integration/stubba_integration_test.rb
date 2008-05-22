require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/object'
require 'mocha/test_case_adapter'
require 'mocha/standalone'

class StubbaIntegrationTest < Test::Unit::TestCase
  
  class DontMessWithMe
    def self.my_class_method
      :original_return_value
    end
    def my_instance_method
      :original_return_value
    end
  end
  
  def test_should_stub_class_method_within_test
    test = build_test do
      DontMessWithMe.expects(:my_class_method).returns(:new_return_value)
      assert_equal :new_return_value, DontMessWithMe.my_class_method
    end

    test_result = Test::Unit::TestResult.new
    test.run(test_result) {}
    assert test_result.passed?
  end

  def test_should_leave_stubbed_class_method_unchanged_after_test
    test = build_test do
      DontMessWithMe.expects(:my_class_method).returns(:new_return_value)
    end

    test.run(Test::Unit::TestResult.new) {}
    assert_equal :original_return_value, DontMessWithMe.my_class_method
  end
  
  def test_should_reset_class_expectations_after_test
    test = build_test do
      DontMessWithMe.expects(:my_class_method)
    end
    
    test.run(Test::Unit::TestResult.new) {}
    assert_equal 0, DontMessWithMe.mocha.expectations.length
  end  

  def test_should_stub_instance_method_within_test
    instance = DontMessWithMe.new
    test = build_test do
      instance.expects(:my_instance_method).returns(:new_return_value)
      assert_equal :new_return_value, instance.my_instance_method
    end
    test_result = Test::Unit::TestResult.new
    test.run(test_result) {}
    assert test_result.passed?
  end
  
  def test_should_leave_stubbed_instance_method_unchanged_after_test
    instance = DontMessWithMe.new
    test = build_test do
      instance.expects(:my_instance_method).returns(:new_return_value)
    end

    test.run(Test::Unit::TestResult.new) {}
    assert_equal :original_return_value, instance.my_instance_method
  end
  
  def test_should_reset_instance_expectations_after_test
    instance = DontMessWithMe.new
    test = build_test do
      instance.expects(:my_instance_method).returns(:new_return_value)
    end
    
    test.run(Test::Unit::TestResult.new) {}
    assert_equal 0, instance.mocha.expectations.length
  end  

  private

  def build_test(&block)
    test_class = Class.new(Test::Unit::TestCase) do
      include Mocha::Standalone
      include Mocha::TestCaseAdapter
      define_method(:test_me, &block)
    end
    test_class.new(:test_me)
  end

end