require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha'
require 'test_runner'

class ExpectedInvocationCountAcceptanceTest < Test::Unit::TestCase

  include TestRunner

  def test_should_pass_if_method_is_never_expected_and_is_never_called
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).never
      0.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_never_expected_but_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).never
      1.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: 0, actual calls: 1'], failure_messages
  end
  
  def test_should_pass_if_method_is_expected_twice_and_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2)
      2.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_expected_twice_but_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2)
      1.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: 2, actual calls: 1'], failure_messages
  end
  
  def test_should_fail_if_method_is_expected_twice_but_is_called_three_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2)
      3.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: 2, actual calls: 3'], failure_messages
  end
  
  def test_should_pass_if_method_is_expected_between_two_and_four_times_and_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      2.times { mock.method }
    end
    assert_passed(test_result)
  end

  def test_should_pass_if_method_is_expected_between_two_and_four_times_and_is_called_three_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      3.times { mock.method }
    end
    assert_passed(test_result)
  end

  def test_should_pass_if_method_is_expected_between_two_and_four_times_and_is_called_four_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      4.times { mock.method }
    end
    assert_passed(test_result)
  end

  def test_should_fail_if_method_is_expected_between_two_and_four_times_and_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      1.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: 2..4, actual calls: 1'], failure_messages
  end

  def test_should_fail_if_method_is_expected_between_two_and_four_times_and_is_called_five_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      5.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: 2..4, actual calls: 5'], failure_messages
  end
  
  def test_should_pass_if_method_is_expected_at_least_once_and_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_least_once
      1.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_pass_if_method_is_expected_at_least_once_and_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_least_once
      2.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_expected_at_least_once_but_is_never_called
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_least_once
      0.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: at least 1, actual calls: 0'], failure_messages
  end
  
  def test_should_pass_if_method_is_expected_at_most_once_and_is_never_called
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_most_once
      0.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_pass_if_method_is_expected_at_most_once_and_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_most_once
      1.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_expected_at_most_once_but_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_most_once
      2.times { mock.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:mock>.method(any_parameters) - expected calls: at most 1, actual calls: 2'], failure_messages
  end
  
  def test_should_pass_if_method_is_never_expected_and_is_never_called_even_if_everything_is_stubbed
    test_result = run_test do
      stub = stub_everything('stub')
      stub.expects(:method).never
      0.times { stub.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_never_expected_but_is_called_once_even_if_everything_is_stubbed
    test_result = run_test do
      stub = stub_everything('stub')
      stub.expects(:method).never
      1.times { stub.method }
    end
    assert_failed(test_result)
    failure_messages = test_result.failures.map { |failure| failure.message }
    assert_equal ['#<Mock:stub>.method(any_parameters) - expected calls: 0, actual calls: 1'], failure_messages
  end
  
end
