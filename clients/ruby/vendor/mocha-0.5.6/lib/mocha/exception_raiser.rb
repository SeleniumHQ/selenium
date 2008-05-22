module Mocha # :nodoc:
  
  class ExceptionRaiser # :nodoc:
    
    def initialize(exception, message)
      @exception, @message = exception, message
    end
    
    def evaluate
      raise @exception, @exception.to_s if @exception == Interrupt
      raise @exception, @message if @message
      raise @exception
    end
    
  end
  
end
