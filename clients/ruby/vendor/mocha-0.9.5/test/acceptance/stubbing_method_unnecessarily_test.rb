require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubbingMethodUnnecessarilyTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_stubbing_method_unnecessarily
    Mocha::Configuration.allow(:stubbing_method_unnecessarily)
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:public_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?('stubbing method unnecessarily: #<Mock:mock>.public_method(any_parameters)')
  end
  
  def test_should_warn_when_stubbing_method_unnecessarily
    Mocha::Configuration.warn_when(:stubbing_method_unnecessarily)
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:public_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?('stubbing method unnecessarily: #<Mock:mock>.public_method(any_parameters)')
  end
  
  def test_should_prevent_stubbing_method_unnecessarily
    Mocha::Configuration.prevent(:stubbing_method_unnecessarily)
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:public_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?('Mocha::StubbingError: stubbing method unnecessarily: #<Mock:mock>.public_method(any_parameters)')
  end
  
  def test_should_default_to_allow_stubbing_method_unnecessarily
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:public_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?('stubbing method unnecessarily: #<Mock:mock>.public_method(any_parameters)')
  end
  
  def test_should_allow_stubbing_method_when_stubbed_method_is_invoked
    Mocha::Configuration.prevent(:stubbing_method_unnecessarily)
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:public_method)
      mock.public_method
    end
    assert_passed(test_result)
  end

end