require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha'
require 'test_runner'

class MockedMethodDispatchAcceptanceTest < Test::Unit::TestCase

  include TestRunner

  def test_should_find_latest_matching_expectation
    test_result = run_test do
      mock = mock()
      mock.stubs(:method).returns(1)
      mock.stubs(:method).returns(2)
      assert_equal 2, mock.method
      assert_equal 2, mock.method
      assert_equal 2, mock.method
    end
    assert_passed(test_result)
  end

  def test_should_find_latest_expectation_which_has_not_stopped_matching
    test_result = run_test do
      mock = mock()
      mock.stubs(:method).returns(1)
      mock.stubs(:method).once.returns(2)
      assert_equal 2, mock.method
      assert_equal 1, mock.method
      assert_equal 1, mock.method
    end
    assert_passed(test_result)
  end

  def test_should_keep_finding_later_stub_and_so_never_satisfy_earlier_expectation
    test_result = run_test do
      mock = mock()
      mock.expects(:method).returns(1)
      mock.stubs(:method).returns(2)
      assert_equal 2, mock.method
      assert_equal 2, mock.method
      assert_equal 2, mock.method
    end
    assert_failed(test_result)
  end

  def test_should_find_later_expectation_until_it_stops_matching_then_find_earlier_stub
    test_result = run_test do
      mock = mock()
      mock.stubs(:method).returns(1)
      mock.expects(:method).returns(2)
      assert_equal 2, mock.method
      assert_equal 1, mock.method
      assert_equal 1, mock.method
    end
    assert_passed(test_result)
  end

  def test_should_find_latest_expectation_with_range_of_expected_invocation_count_which_has_not_stopped_matching
    test_result = run_test do
      mock = mock()
      mock.stubs(:method).returns(1)
      mock.stubs(:method).times(2..3).returns(2)
      assert_equal 2, mock.method
      assert_equal 2, mock.method
      assert_equal 2, mock.method
      assert_equal 1, mock.method
      assert_equal 1, mock.method
    end
    assert_passed(test_result)
  end

end