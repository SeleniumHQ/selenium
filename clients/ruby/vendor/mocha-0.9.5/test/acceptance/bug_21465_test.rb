require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class Bug21465Test < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_allow_expected_method_name_to_be_a_string
    test_result = run_test do
      mock = mock()
      mock.expects('wibble')
      mock.wibble
    end
    assert_passed(test_result)
  end
  
  def test_should_allow_stubbed_method_name_to_be_a_string
    test_result = run_test do
      mock = mock()
      mock.stubs('wibble')
      mock.wibble
    end
    assert_passed(test_result)
  end
  
end
