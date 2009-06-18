require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/change_state_side_effect'

class ChangeStateSideEffectTest < Test::Unit::TestCase
  
  include Mocha
  
  class FakeState
    
    attr_reader :active
    attr_writer :description
    
    def activate
      @active = true
    end
    
    def mocha_inspect
      @description
    end
    
  end
  
  def test_should_activate_the_given_state
    state = FakeState.new
    side_effect = ChangeStateSideEffect.new(state)
    
    side_effect.perform
    
    assert state.active
  end
  
  def test_should_describe_itself_in_terms_of_the_activated_state
    state = FakeState.new
    state.description = 'the-new-state'
    side_effect = ChangeStateSideEffect.new(state)
    
    assert_equal 'then the-new-state', side_effect.mocha_inspect
  end
  
end
