require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class MockWithInitializerBlockTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_expect_two_method_invocations_and_receive_both_of_them
    test_result = run_test do
      mock = mock() do
        expects(:method_1)
        expects(:method_2)
      end
      mock.method_1
      mock.method_2
    end
    assert_passed(test_result)
  end

  def test_should_expect_two_method_invocations_but_receive_only_one_of_them
    test_result = run_test do
      mock = mock() do
        expects(:method_1)
        expects(:method_2)
      end
      mock.method_1
    end
    assert_failed(test_result)
  end

  def test_should_stub_methods
    test_result = run_test do
      mock = mock() do
        stubs(:method_1).returns(1)
        stubs(:method_2).returns(2)
      end
      assert_equal 1, mock.method_1
      assert_equal 2, mock.method_2
    end
    assert_passed(test_result)
  end

end