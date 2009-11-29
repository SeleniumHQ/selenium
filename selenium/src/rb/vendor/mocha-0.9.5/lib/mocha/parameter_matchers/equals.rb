require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: equals(value) -> parameter_matcher
    #
    # Matches +Object+ equalling +value+.
    #   object = mock()
    #   object.expects(:method_1).with(equals(2))
    #   object.method_1(2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(equals(2))
    #   object.method_1(3)
    #   # error raised, because method_1 was not called with Object equalling 3
    def equals(value)
      Equals.new(value)
    end

    class Equals < Base # :nodoc:
      
      def initialize(value)
        @value = value
      end
      
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter == @value
      end
      
      def mocha_inspect
        @value.mocha_inspect
      end
      
    end
    
  end
  
end