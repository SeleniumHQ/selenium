require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: any_parameters() -> parameter_matcher
    #
    # Matches any parameters.
    #   object = mock()
    #   object.expects(:method_1).with(any_parameters)
    #   object.method_1(1, 2, 3, 4)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(any_parameters)
    #   object.method_1(5, 6, 7, 8, 9, 0)
    #   # no error raised
    def any_parameters
      AnyParameters.new
    end

    class AnyParameters < Base # :nodoc:
      
      def matches?(available_parameters)
        while available_parameters.length > 0 do
          available_parameters.shift
        end
        return true
      end

      def mocha_inspect
        "any_parameters"
      end

    end
    
  end
  
end