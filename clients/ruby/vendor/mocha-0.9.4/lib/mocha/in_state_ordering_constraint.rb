module Mocha

  class InStateOrderingConstraint
  
    def initialize(state_predicate)
      @state_predicate = state_predicate
    end
  
    def allows_invocation_now?
      @state_predicate.active?
    end
  
    def mocha_inspect
      "when #{@state_predicate.mocha_inspect}"
    end
  
  end

end