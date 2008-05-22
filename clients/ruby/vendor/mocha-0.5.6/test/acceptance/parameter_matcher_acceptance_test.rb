require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha'
require 'test_runner'

class ParameterMatcherAcceptanceTest < Test::Unit::TestCase
  
  include TestRunner

  def test_should_match_hash_parameter_with_specified_key
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_key(:key_1))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_hash_parameter_with_specified_key
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_key(:key_1))
      mock.method(:key_2 => 'value_2')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_hash_parameter_with_specified_value
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_value('value_1'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_hash_parameter_with_specified_value
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_value('value_1'))
      mock.method(:key_2 => 'value_2')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_hash_parameter_with_specified_key_value_pair
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entry(:key_1, 'value_1'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_hash_parameter_with_specified_key_value_pair
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entry(:key_1, 'value_2'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_hash_parameter_with_specified_hash_entry
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entry(:key_1 => 'value_1'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_hash_parameter_with_specified_hash_entry
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entry(:key_1 => 'value_2'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_hash_parameter_with_specified_entries
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entries(:key_1 => 'value_1', :key_2 => 'value_2'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2', :key_3 => 'value_3')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_hash_parameter_with_specified_entries
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entries(:key_1 => 'value_1', :key_2 => 'value_2'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_3')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_parameter_that_matches_regular_expression
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(regexp_matches(/meter/))
      mock.method('this parameter should match')
    end
    assert_passed(test_result)
  end

  def test_should_not_match_parameter_that_does_not_match_regular_expression
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(regexp_matches(/something different/))
      mock.method('this parameter should not match')
    end
    assert_failed(test_result)
  end
  
end