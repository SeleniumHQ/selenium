require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: anything() -> parameter_matcher
    #
    # Matches any object.
    #   object = mock()
    #   object.expects(:method_1).with(anything)
    #   object.method_1('foo')
    #   # no error raised
    def anything
      Anything.new
    end
    
    class Anything < Base # :nodoc:
    
      def matches?(available_parameters)
        available_parameters.shift
        return true
      end
      
      def mocha_inspect
        "anything"
      end
      
    end
    
  end
  
end