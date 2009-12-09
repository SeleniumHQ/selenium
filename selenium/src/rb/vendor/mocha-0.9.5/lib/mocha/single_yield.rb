module Mocha # :nodoc:
  
  class SingleYield # :nodoc:
    
    attr_reader :parameters
    
    def initialize(*parameters)
      @parameters = parameters
    end
    
    def each
      yield(@parameters)
    end
    
  end
  
end
    
