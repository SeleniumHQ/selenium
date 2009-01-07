require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StubTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_build_stub_and_explicitly_add_an_expectation
    test_result = run_test do
      foo = stub()
      foo.stubs(:bar)
      foo.bar
    end
    assert_passed(test_result)
  end

  def test_should_build_named_stub_and_explicitly_add_an_expectation
    test_result = run_test do
      foo = stub('foo')
      foo.stubs(:bar)
      foo.bar
    end
    assert_passed(test_result)
  end

  def test_should_build_stub_incorporating_two_expectations
    test_result = run_test do
      foo = stub(:bar => 'bar', :baz => 'baz')
      foo.bar
      foo.baz
    end
    assert_passed(test_result)
  end

  def test_should_build_named_stub_incorporating_two_expectations
    test_result = run_test do
      foo = stub('foo', :bar => 'bar', :baz => 'baz')
      foo.bar
      foo.baz
    end
    assert_passed(test_result)
  end

end