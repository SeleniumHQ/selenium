require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: kind_of(klass) -> parameter_matcher
    #
    # Matches any object that is a kind of +klass+
    #   object = mock()
    #   object.expects(:method_1).with(kind_of(Integer))
    #   object.method_1(99)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(kind_of(Integer))
    #   object.method_1('string')
    #   # error raised, because method_1 was not called with a kind of Integer
    def kind_of(klass)
      KindOf.new(klass)
    end
    
    class KindOf < Base # :nodoc:
      
      def initialize(klass)
        @klass = klass
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.kind_of?(@klass)
      end
      
      def mocha_inspect
        "kind_of(#{@klass.mocha_inspect})"
      end
      
    end
    
  end
  
end