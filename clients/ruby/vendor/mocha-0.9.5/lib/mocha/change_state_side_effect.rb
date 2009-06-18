module Mocha

  class ChangeStateSideEffect
  
    def initialize(state)
      @state = state
    end
  
    def perform
      @state.activate
    end
  
    def mocha_inspect
      "then #{@state.mocha_inspect}"
    end
  
  end

end