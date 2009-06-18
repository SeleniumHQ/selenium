require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubbingOnNonMockObjectTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_stubbing_method_on_non_mock_object
    Mocha::Configuration.allow(:stubbing_method_on_non_mock_object)
    non_mock_object = Class.new { def existing_method; end }
    test_result = run_test do
      non_mock_object.stubs(:existing_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing method on non-mock object: #{non_mock_object}.existing_method")
  end
  
  def test_should_warn_on_stubbing_method_on_non_mock_object
    Mocha::Configuration.warn_when(:stubbing_method_on_non_mock_object)
    non_mock_object = Class.new { def existing_method; end }
    test_result = run_test do
      non_mock_object.stubs(:existing_method)
    end
    assert_passed(test_result)
    assert @logger.warnings.include?("stubbing method on non-mock object: #{non_mock_object}.existing_method")
  end
  
  def test_should_prevent_stubbing_method_on_non_mock_object
    Mocha::Configuration.prevent(:stubbing_method_on_non_mock_object)
    non_mock_object = Class.new { def existing_method; end }
    test_result = run_test do
      non_mock_object.stubs(:existing_method)
    end
    assert_failed(test_result)
    assert test_result.error_messages.include?("Mocha::StubbingError: stubbing method on non-mock object: #{non_mock_object}.existing_method")
  end
  
  def test_should_default_to_allow_stubbing_method_on_non_mock_object
    non_mock_object = Class.new { def existing_method; end }
    test_result = run_test do
      non_mock_object.stubs(:existing_method)
    end
    assert_passed(test_result)
    assert !@logger.warnings.include?("stubbing method on non-mock object: #{non_mock_object}.existing_method")
  end
  
  def test_should_allow_stubbing_method_on_mock_object
    Mocha::Configuration.prevent(:stubbing_method_on_non_mock_object)
    test_result = run_test do
      mock = mock('mock')
      mock.stubs(:any_method)
    end
    assert_passed(test_result)
  end

end