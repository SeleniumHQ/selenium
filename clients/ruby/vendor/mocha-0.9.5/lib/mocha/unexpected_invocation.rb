module Mocha # :nodoc:

  class UnexpectedInvocation
    
    def initialize(mock, symbol, *arguments)
      @mock = mock
      @method_matcher = MethodMatcher.new(symbol)
      @parameters_matcher = ParametersMatcher.new(arguments)
    end
    
    def to_s
      method_signature = "#{@mock.mocha_inspect}.#{@method_matcher.mocha_inspect}#{@parameters_matcher.mocha_inspect}"
      "unexpected invocation: #{method_signature}\n"
    end
    
  end
  
end