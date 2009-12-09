require File.join(File.dirname(__FILE__), "acceptance_test_helper")
require 'mocha'

class Bug18914Test < Test::Unit::TestCase
  
  include AcceptanceTest
  
  def setup
    setup_acceptance_test
  end
  
  def teardown
    teardown_acceptance_test
  end
  
  class AlwaysEql
    
    def my_method
      true
    end
    
    def ==(o)
      true
    end
    
    def eql?(o)
      true
    end
    
  end

  def test_should_not_allow_stubbing_of_non_mock_instance_disrupted_by_legitimate_overriding_of_eql_method
    
    always_eql_1 = AlwaysEql.new
    always_eql_1.stubs(:my_method).returns(false)
    
    always_eql_2 = AlwaysEql.new
    always_eql_2.stubs(:my_method).returns(false)
    
    assert_equal false, always_eql_2.my_method
  end
  
end
