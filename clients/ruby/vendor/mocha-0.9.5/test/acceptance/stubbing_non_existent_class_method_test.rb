require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubbingNonExistentClassMethodTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_stubbing_non_existent_class_method
    Mocha::Configuration.allow(:stubbing_non_existent_method)
    klass = Class.new
    test_result = run_test do
      klass.stubs(:non_existent_method)
    end
    assert !@logger.warnings.include?("stubbing non-existent method: #{klass}.non_existent_method")
    assert_passed(test_result)
  end
  
  def test_should_warn_when_stubbing_non_existent_class_method
    Mocha::Configuration.warn_when(:stubbing_non_existent_method)
    klass = Class.new
    test_result = run_test do
      klass.stubs(:non_existent_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?("stubbing non-existent method: #{klass}.non_existent_method")
  end
  
  def test_should_prevent_stubbing_non_existent_class_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new
    test_result = run_test do
      klass.stubs(:non_existent_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?("Mocha::StubbingError: stubbing non-existent method: #{klass}.non_existent_method")
  end
  
  def test_should_default_to_allow_stubbing_non_existent_class_method
    klass = Class.new
    test_result = run_test do
      klass.stubs(:non_existent_method)
    end
    assert !@logger.warnings.include?("stubbing non-existent method: #{klass}.non_existent_method")
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_public_class_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      class << self
        def existing_public_method; end
        public :existing_public_method
      end
    end
    test_result = run_test do
      klass.stubs(:existing_public_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_method_to_which_class_responds
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      class << self
        def respond_to?(method, include_private = false)
          (method == :method_to_which_class_responds)
        end
      end
    end
    test_result = run_test do
      klass.stubs(:method_to_which_class_responds)
    end
    assert_passed(test_result)
  end
 
  def test_should_allow_stubbing_existing_protected_class_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      class << self
        def existing_protected_method; end
        protected :existing_protected_method
      end
    end
    test_result = run_test do
      klass.stubs(:existing_protected_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_private_class_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    klass = Class.new do
      class << self
        def existing_private_method; end
        private :existing_private_method
      end
    end
    test_result = run_test do
      klass.stubs(:existing_private_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_public_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      class << self
        def existing_public_method; end
        public :existing_public_method
      end
    end
    klass = Class.new(superklass)
    test_result = run_test do
      klass.stubs(:existing_public_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_protected_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      class << self
        def existing_protected_method; end
        protected :existing_protected_method
      end
    end
    klass = Class.new(superklass)
    test_result = run_test do
      klass.stubs(:existing_protected_method)
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbing_existing_private_superclass_method
    Mocha::Configuration.prevent(:stubbing_non_existent_method)
    superklass = Class.new do
      class << self
        def existing_private_method; end
        protected :existing_private_method
      end
    end
    klass = Class.new(superklass)
    test_result = run_test do
      klass.stubs(:existing_private_method)
    end
    assert_passed(test_result)
  end
  
end
