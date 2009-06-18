require 'mocha/is_a'

module Mocha # :nodoc:
  
  class SingleReturnValue # :nodoc:
    
    def initialize(value)
      @value = value
    end
    
    def evaluate
      @value
    end
    
  end
  
end
