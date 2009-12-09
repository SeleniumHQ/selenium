require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/in_state_ordering_constraint'

class InStateOrderingConstraintTest < Test::Unit::TestCase
  
  include Mocha
  
  class FakeStatePredicate
    
    attr_writer :active, :description
    
    def active?
      @active
    end
    
    def mocha_inspect
      @description
    end
    
  end
  
  def test_should_allow_invocation_when_state_is_active
    state_predicate = FakeStatePredicate.new
    ordering_constraint = InStateOrderingConstraint.new(state_predicate)
    
    state_predicate.active = true
    assert ordering_constraint.allows_invocation_now?
    
    state_predicate.active = false
    assert !ordering_constraint.allows_invocation_now?
  end
  
  def test_should_describe_itself_in_terms_of_the_state_predicates_description
    state_predicate = FakeStatePredicate.new
    ordering_constraint = InStateOrderingConstraint.new(state_predicate)
    
    state_predicate.description = 'the-state-predicate'
    
    assert_equal 'when the-state-predicate', ordering_constraint.mocha_inspect
  end
  
end
