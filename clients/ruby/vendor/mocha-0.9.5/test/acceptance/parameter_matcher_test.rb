require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class ParameterMatcherTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
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
  
  def test_should_match_hash_parameter_with_specified_entries_using_nested_matchers
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entries(:key_1 => regexp_matches(/value_1/), kind_of(Symbol) => 'value_2'))
      mock.method(:key_1 => 'value_1', :key_2 => 'value_2', :key_3 => 'value_3')
    end
    assert_passed(test_result)
  end
  
  def test_should_not_match_hash_parameter_with_specified_entries_using_nested_matchers
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(has_entries(:key_1 => regexp_matches(/value_1/), kind_of(String) => 'value_2'))
      mock.method(:key_1 => 'value_2', :key_2 => 'value_3')
    end
    assert_failed(test_result)
  end
  
  def test_should_match_parameter_that_matches_any_value
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(any_of('value_1', 'value_2')).times(2)
      mock.method('value_1')
      mock.method('value_2')
    end
    assert_passed(test_result)
  end
  
  def test_should_not_match_parameter_that_does_not_match_any_value
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(any_of('value_1', 'value_2'))
      mock.method('value_3')
    end
    assert_failed(test_result)
  end

  def test_should_match_parameter_that_matches_all_values
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(all_of('value_1', 'value_1'))
      mock.method('value_1')
    end
    assert_passed(test_result)
  end
  
  def test_should_not_match_parameter_that_does_not_match_all_values
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(all_of('value_1', 'value_2'))
      mock.method('value_1')
    end
    assert_failed(test_result)
  end

  def test_should_match_parameter_that_responds_with_specified_value
    klass = Class.new do
      def quack
        'quack'
      end
    end
    duck = klass.new
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(responds_with(:quack, 'quack'))
      mock.method(duck)
    end
    assert_passed(test_result)
  end

  def test_should_not_match_parameter_that_does_not_respond_with_specified_value
    klass = Class.new do
      def quack
        'woof'
      end
    end
    duck = klass.new
    test_result = run_test do
      mock = mock()
      mock.expects(:method).with(responds_with(:quack, 'quack'))
      mock.method(duck)
    end
    assert_failed(test_result)
  end

end
