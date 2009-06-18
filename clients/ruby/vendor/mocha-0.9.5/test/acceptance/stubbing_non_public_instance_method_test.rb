require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubbingNonPublicInstanceMethodTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_stubbing_private_instance_method
    Mocha::Configuration.allow(:stubbing_non_public_method)
    instance = Class.new do
      def private_method; end
      private :private_method
    end.new
    test_result = run_test do
      instance.stubs(:private_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing non-public method: #{instance}.private_method")
  end
  
  def test_should_allow_stubbing_protected_instance_method
    Mocha::Configuration.allow(:stubbing_non_public_method)
    instance = Class.new do
      def protected_method; end
      protected :protected_method
    end.new
    test_result = run_test do
      instance.stubs(:protected_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing non-public method: #{instance}.protected_method")
  end
  
  def test_should_warn_when_stubbing_private_instance_method
    Mocha::Configuration.warn_when(:stubbing_non_public_method)
    instance = Class.new do
      def private_method; end
      private :private_method
    end.new
    test_result = run_test do
      instance.stubs(:private_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?("stubbing non-public method: #{instance}.private_method")
  end
  
  def test_should_warn_when_stubbing_protected_instance_method
    Mocha::Configuration.warn_when(:stubbing_non_public_method)
    instance = Class.new do
      def protected_method; end
      protected :protected_method
    end.new
    test_result = run_test do
      instance.stubs(:protected_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?("stubbing non-public method: #{instance}.protected_method")
  end
  
  def test_should_prevent_stubbing_private_instance_method
    Mocha::Configuration.prevent(:stubbing_non_public_method)
    instance = Class.new do
      def private_method; end
      private :private_method
    end.new
    test_result = run_test do
      instance.stubs(:private_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?("Mocha::StubbingError: stubbing non-public method: #{instance}.private_method")
  end
  
  def test_should_prevent_stubbing_protected_instance_method
    Mocha::Configuration.prevent(:stubbing_non_public_method)
    instance = Class.new do
      def protected_method; end
      protected :protected_method
    end.new
    test_result = run_test do
      instance.stubs(:protected_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?("Mocha::StubbingError: stubbing non-public method: #{instance}.protected_method")
  end
  
  def test_should_default_to_allow_stubbing_private_instance_method
    instance = Class.new do
      def private_method; end
      private :private_method
    end.new
    test_result = run_test do
      instance.stubs(:private_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing non-public method: #{instance}.private_method")
  end
  
  def test_should_default_to_allow_stubbing_protected_instance_method
    instance = Class.new do
      def protected_method; end
      protected :protected_method
    end.new
    test_result = run_test do
      instance.stubs(:protected_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing non-public method: #{instance}.protected_method")
  end
  
  def test_should_allow_stubbing_public_instance_method
    Mocha::Configuration.prevent(:stubbing_non_public_method)
    instance = Class.new do
      def public_method; end
      public :public_method
    end.new
    test_result = run_test do
      instance.stubs(:public_method)
    end
    assert_passed(test_result)
  end

  def test_should_allow_stubbing_method_to_which_instance_responds
    Mocha::Configuration.prevent(:stubbing_non_public_method)
    instance = Class.new do
      def respond_to?(method, include_private_methods = false)
        (method == :method_to_which_instance_responds)
      end
    end.new
    test_result = run_test do
      instance.stubs(:method_to_which_instance_responds)
    end
    assert_passed(test_result)
  end

end
