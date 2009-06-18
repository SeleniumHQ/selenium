require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class ReturnValueTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_build_mock_and_explicitly_add_an_expectation_with_a_return_value
    test_result = run_test do
      foo = mock('foo')
      foo.expects(:bar).returns('bar')
      assert_equal 'bar', foo.bar
    end
    assert_passed(test_result)
  end

  def test_should_build_mock_incorporating_two_expectations_with_return_values
    test_result = run_test do
      foo = mock('foo', :bar => 'bar', :baz => 'baz')
      assert_equal 'bar', foo.bar
      assert_equal 'baz', foo.baz
    end
    assert_passed(test_result)
  end

  def test_should_build_stub_and_explicitly_add_an_expectation_with_a_return_value
    test_result = run_test do
      foo = stub('foo')
      foo.stubs(:bar).returns('bar')
      assert_equal 'bar', foo.bar
    end
    assert_passed(test_result)
  end

  def test_should_build_stub_incorporating_two_expectations_with_return_values
    test_result = run_test do
      foo = stub('foo', :bar => 'bar', :baz => 'baz')
      assert_equal 'bar', foo.bar
      assert_equal 'baz', foo.baz
    end
    assert_passed(test_result)
  end

end