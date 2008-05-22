require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha'
require 'test_runner'

class PartialMockAcceptanceTest < Test::Unit::TestCase
  
  include TestRunner

  def test_should_pass_if_all_expectations_are_satisfied
    test_result = run_test do
      partial_mock_one = "partial_mock_one"
      partial_mock_two = "partial_mock_two"
      
      partial_mock_one.expects(:first)
      partial_mock_one.expects(:second)
      partial_mock_two.expects(:third)
      
      partial_mock_one.first
      partial_mock_one.second
      partial_mock_two.third
    end
    assert_passed(test_result)
  end

  def test_should_fail_if_all_expectations_are_not_satisfied
    test_result = run_test do
      partial_mock_one = "partial_mock_one"
      partial_mock_two = "partial_mock_two"
      
      partial_mock_one.expects(:first)
      partial_mock_one.expects(:second)
      partial_mock_two.expects(:third)
      
      partial_mock_one.first
      partial_mock_two.third
    end
    assert_failed(test_result)
  end

end