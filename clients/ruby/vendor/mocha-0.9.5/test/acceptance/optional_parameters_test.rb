require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class OptionalParameterMatcherTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_pass_if_all_required_parameters_match_and_no_optional_parameters_are_supplied
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2)
    end
    assert_passed(test_result)
  end

  def test_should_pass_if_all_required_and_optional_parameters_match_and_some_optional_parameters_are_supplied
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2, 3)
    end
    assert_passed(test_result)
  end

  def test_should_pass_if_all_required_and_optional_parameters_match_and_all_optional_parameters_are_supplied
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2, 3, 4)
    end
    assert_passed(test_result)
  end

  def test_should_fail_if_all_required_and_optional_parameters_match_but_too_many_optional_parameters_are_supplied
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2, 3, 4, 5)
    end
    assert_failed(test_result)
  end

  def test_should_fail_if_all_required_parameters_match_but_some_optional_parameters_do_not_match
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2, 4)
    end
    assert_failed(test_result)
  end

  def test_should_fail_if_all_required_parameters_match_but_no_optional_parameters_match
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(1, 2, optionally(3, 4))
      mock.method(1, 2, 4, 5)
    end
    assert_failed(test_result)
  end

end