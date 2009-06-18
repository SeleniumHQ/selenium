require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class SequenceTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_constrain_invocations_to_occur_in_expected_order
    test_result = run_test do
      mock = mock()
      sequence = sequence('one')
      
      mock.expects(:first).in_sequence(sequence)
      mock.expects(:second).in_sequence(sequence)
      
      mock.second
    end
    assert_failed(test_result)
  end

  def test_should_allow_invocations_in_sequence
    test_result = run_test do
      mock = mock()
      sequence = sequence('one')
      
      mock.expects(:first).in_sequence(sequence)
      mock.expects(:second).in_sequence(sequence)
      
      mock.first
      mock.second
    end
    assert_passed(test_result)
  end

  def test_should_constrain_invocations_to_occur_in_expected_order_even_if_expected_on_different_mocks
    test_result = run_test do
      mock_one = mock('1')
      mock_two = mock('2')
      sequence = sequence('one')
      
      mock_one.expects(:first).in_sequence(sequence)
      mock_two.expects(:second).in_sequence(sequence)
      
      mock_two.second
    end
    assert_failed(test_result)
  end

  def test_should_allow_invocations_in_sequence_even_if_expected_on_different_mocks
    test_result = run_test do
      mock_one = mock('1')
      mock_two = mock('2')
      sequence = sequence('one')
      
      mock_one.expects(:first).in_sequence(sequence)
      mock_two.expects(:second).in_sequence(sequence)
      
      mock_one.first
      mock_two.second
    end
    assert_passed(test_result)
  end

  def test_should_constrain_invocations_to_occur_in_expected_order_even_if_expected_on_partial_mocks
    test_result = run_test do
      partial_mock_one = "1"
      partial_mock_two = "2"
      sequence = sequence('one')
      
      partial_mock_one.expects(:first).in_sequence(sequence)
      partial_mock_two.expects(:second).in_sequence(sequence)
      
      partial_mock_two.second
    end
    assert_failed(test_result)
  end

  def test_should_allow_invocations_in_sequence_even_if_expected_on_partial_mocks
    test_result = run_test do
      partial_mock_one = "1"
      partial_mock_two = "2"
      sequence = sequence('one')
      
      partial_mock_one.expects(:first).in_sequence(sequence)
      partial_mock_two.expects(:second).in_sequence(sequence)
      
      partial_mock_one.first
      partial_mock_two.second
    end
    assert_passed(test_result)
  end

  def test_should_allow_stub_expectations_to_be_skipped_in_sequence
    test_result = run_test do
      mock = mock()
      sequence = sequence('one')
      
      mock.expects(:first).in_sequence(sequence)
      mock.stubs(:second).in_sequence(sequence)
      mock.expects(:third).in_sequence(sequence)
      
      mock.first
      mock.third
    end
    assert_passed(test_result)
  end

  def test_should_regard_sequences_as_independent_of_each_other
    test_result = run_test do
      mock = mock()
      sequence_one = sequence('one')
      sequence_two = sequence('two')
      
      mock.expects(:first).in_sequence(sequence_one)
      mock.expects(:second).in_sequence(sequence_one)
      
      mock.expects(:third).in_sequence(sequence_two)
      mock.expects(:fourth).in_sequence(sequence_two)
      
      mock.first
      mock.third
      mock.second
      mock.fourth
    end
    assert_passed(test_result)
  end
  
  def test_should_include_sequence_in_failure_message
    test_result = run_test do
      mock = mock()
      sequence = sequence('one')
      
      mock.expects(:first).in_sequence(sequence)
      mock.expects(:second).in_sequence(sequence)
      
      mock.second
    end
    assert_failed(test_result)
    assert_match Regexp.new("in sequence 'one'"), test_result.failures.first.message
  end

  def test_should_allow_expectations_to_be_in_more_than_one_sequence
    test_result = run_test do
      mock = mock()
      sequence_one = sequence('one')
      sequence_two = sequence('two')
      
      mock.expects(:first).in_sequence(sequence_one)
      mock.expects(:second).in_sequence(sequence_two)
      mock.expects(:three).in_sequence(sequence_one).in_sequence(sequence_two)
      
      mock.first
      mock.three
    end
    assert_failed(test_result)
    assert_match Regexp.new("in sequence 'one'"), test_result.failures.first.message
    assert_match Regexp.new("in sequence 'two'"), test_result.failures.first.message
  end

  def test_should_have_shortcut_for_expectations_to_be_in_more_than_one_sequence
    test_result = run_test do
      mock = mock()
      sequence_one = sequence('one')
      sequence_two = sequence('two')
      
      mock.expects(:first).in_sequence(sequence_one)
      mock.expects(:second).in_sequence(sequence_two)
      mock.expects(:three).in_sequence(sequence_one, sequence_two)
      
      mock.first
      mock.three
    end
    assert_failed(test_result)
    assert_match Regexp.new("in sequence 'one'"), test_result.failures.first.message
    assert_match Regexp.new("in sequence 'two'"), test_result.failures.first.message
  end

end