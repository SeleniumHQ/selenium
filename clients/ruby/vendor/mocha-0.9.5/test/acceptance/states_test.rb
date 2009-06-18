require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class StatesTest < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  def test_should_constrain_expectations_to_occur_within_a_given_state
    test_result = run_test do
      mock = mock()
      readiness = states('readiness')
      
      mock.stubs(:first).when(readiness.is('ready'))
      mock.stubs(:second).then(readiness.is('ready'))
      
      mock.first
    end
    assert_failed(test_result)
  end
  
  def test_should_allow_expectations_to_occur_in_correct_state
    test_result = run_test do
      mock = mock()
      readiness = states('readiness')
      
      mock.stubs(:first).when(readiness.is('ready'))
      mock.stubs(:second).then(readiness.is('ready'))
      
      mock.second
      mock.first
    end
    assert_passed(test_result)
  end
  
  def test_should_be_able_to_start_in_a_specific_state
    test_result = run_test do
      mock = mock()
      readiness = states('readiness')
      
      mock.stubs(:first).when(readiness.is('ready'))
      
      readiness.starts_as('ready')
      mock.first
    end
    assert_passed(test_result)
  end
  
  def test_should_switch_state_when_method_raises_an_exception
    test_result = run_test do
      mock = mock()
      readiness = states('readiness')
      
      mock.expects(:first).raises().then(readiness.is('ready'))
      mock.expects(:second).when(readiness.is('ready'))
      
      mock.first rescue nil
      mock.second
    end
    assert_passed(test_result)
  end
    
end