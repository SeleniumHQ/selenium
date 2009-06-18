require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class ExpectedInvocationCountTest < Test::Unit::TestCase

  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end

  def test_should_pass_if_method_is_never_expected_and_is_never_called
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).never
      0.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_fast_if_method_is_never_expected_but_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).never
      1.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:mock>.method()\nsatisfied expectations:\n- expected never, not yet invoked: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
  end
  
  def test_should_pass_if_method_is_expected_twice_and_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).twice
      2.times { mock.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_if_method_is_expected_twice_but_is_called_once
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).twice
      1.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["not all expectations were satisfied\nunsatisfied expectations:\n- expected exactly twice, already invoked once: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
  end
  
  def test_should_fail_fast_if_method_is_expected_twice_but_is_called_three_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).twice
      3.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:mock>.method()\nsatisfied expectations:\n- expected exactly twice, already invoked twice: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
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
    assert_equal ["not all expectations were satisfied\nunsatisfied expectations:\n- expected between 2 and 4 times, already invoked once: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
  end

  def test_should_fail_fast_if_method_is_expected_between_two_and_four_times_and_is_called_five_times
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).times(2..4)
      5.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:mock>.method()\nsatisfied expectations:\n- expected between 2 and 4 times, already invoked 4 times: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
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
    assert_equal ["not all expectations were satisfied\nunsatisfied expectations:\n- expected at least once, not yet invoked: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
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
  
  def test_should_fail_fast_if_method_is_expected_at_most_once_but_is_called_twice
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).at_most_once
      2.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:mock>.method()\nsatisfied expectations:\n- expected at most once, already invoked once: #<Mock:mock>.method(any_parameters)\n"], test_result.failure_messages
  end
  
  def test_should_pass_if_method_is_never_expected_and_is_never_called_even_if_everything_is_stubbed
    test_result = run_test do
      stub = stub_everything('stub')
      stub.expects(:method).never
      0.times { stub.method }
    end
    assert_passed(test_result)
  end
  
  def test_should_fail_fast_if_method_is_never_expected_but_is_called_once_even_if_everything_is_stubbed
    test_result = run_test do
      stub = stub_everything('stub')
      stub.expects(:method).never
      1.times { stub.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:stub>.method()\nsatisfied expectations:\n- expected never, not yet invoked: #<Mock:stub>.method(any_parameters)\n"], test_result.failure_messages
  end
  
  def test_should_fail_fast_if_there_is_no_matching_expectation
    test_result = run_test do
      mock = mock('mock')
      mock.expects(:method).with(1)
      1.times { mock.method }
    end
    assert_failed(test_result)
    assert_equal ["unexpected invocation: #<Mock:mock>.method()\nunsatisfied expectations:\n- expected exactly once, not yet invoked: #<Mock:mock>.method(1)\n"], test_result.failure_messages
  end
  
end
