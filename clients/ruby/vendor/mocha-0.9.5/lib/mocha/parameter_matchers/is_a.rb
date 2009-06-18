require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: is_a(klass) -> parameter_matcher
    #
    # Matches any object that is a +klass+
    #   object = mock()
    #   object.expects(:method_1).with(is_a(Integer))
    #   object.method_1(99)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(is_a(Integer))
    #   object.method_1('string')
    #   # error raised, because method_1 was not called with an Integer
    def is_a(klass)
      IsA.new(klass)
    end
    
    class IsA < Base # :nodoc:
      
      def initialize(klass)
        @klass = klass
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.is_a?(@klass)
      end
      
      def mocha_inspect
        "is_a(#{@klass.mocha_inspect})"
      end
      
    end
    
  end
  
end