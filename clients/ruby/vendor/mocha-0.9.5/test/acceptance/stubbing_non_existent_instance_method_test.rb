require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubbingNonExistentInstanceMethodTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_stubbing_non_existent_instance_method
    Mocha::Configuration.allow(:stubbing_non_existent_method)
    instance = Class.new.new
    test_result = run_test do
      instance.stubs(:non_existent_method)
    end
    assert !@logger.warnings.include?("stubbing non-existent method: #{instance}.non_existent_method")
    assert_passed(test_result)
  end
  
  def test_should_warn_when_stubbing_non_existent_instance_method
    Mocha::Configuration.warn_when(:stubbing_non_existent_method)
    instance = Class.new.new
    test_result = run_test do
      instance.stubs(:non_existent_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?("stubbing non-existent method: #{instance}.non_existent_method")
  end
  
  def test_should_prevent_stubbing_non_existent_instance_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    instance = Class.new.new
    test_result = run_test do
      instance.stubs(:non_existent_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?("Mocha::StubbingError: stubbing non-existent method: #{instance}.non_existent_method")
  end
  
  def test_should_default_to_allow_stubbing_non_existent_instance_method
    instance = Class.new.new
    test_result = run_test do
      instance.stubs(:non_existent_method)
    end
    assert !@logger.warnings.include?("stubbing non-existent method: #{instance}.non_existent_method")
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_public_instance_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      def existing_public_method; end
      public :existing_public_method
    end
    instance = klass.new
    test_result = run_test do
      instance.stubs(:existing_public_method)
    end
    assert_passed(test_result)
  end

  def test_should_allow_stubbing_method_to_which_instance_responds
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      def respond_to?(method, include_private = false)
        (method == :method_to_which_instance_responds)
      end
    end
    instance = klass.new
    test_result = run_test do
      instance.stubs(:method_to_which_instance_responds)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_protected_instance_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      def existing_protected_method; end
      protected :existing_protected_method
    end
    instance = klass.new
    test_result = run_test do
      instance.stubs(:existing_protected_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_private_instance_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      def existing_private_method; end
      private :existing_private_method
    end
    instance = klass.new
    test_result = run_test do
      instance.stubs(:existing_private_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_public_instance_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      def existing_public_method; end
      public :existing_public_method
    end
    instance = Class.new(superklass).new
    test_result = run_test do
      instance.stubs(:existing_public_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_protected_instance_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      def existing_protected_method; end
      protected :existing_protected_method
    end
    instance = Class.new(superklass).new
    test_result = run_test do
      instance.stubs(:existing_protected_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_private_instance_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      def existing_private_method; end
      private :existing_private_method
    end
    instance = Class.new(superklass).new
    test_result = run_test do
      instance.stubs(:existing_private_method)
    end
    assert_passed(test_result)
  end
  
end
