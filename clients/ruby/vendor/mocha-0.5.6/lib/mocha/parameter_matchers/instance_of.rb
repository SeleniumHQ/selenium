require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: instance_of(klass) -> parameter_matcher
    #
    # Matches any object that is an instance of +klass+
    #   object = mock()
    #   object.expects(:method_1).with(instance_of(String))
    #   object.method_1('string')
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(instance_of(String))
    #   object.method_1(99)
    #   # error raised, because method_1 was not called with an instance of String
    def instance_of(klass)
      InstanceOf.new(klass)
    end
    
    class InstanceOf < Base # :nodoc:
      
      def initialize(klass)
        @klass = klass
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.instance_of?(@klass)
      end
      
      def mocha_inspect
        "instance_of(#{@klass.mocha_inspect})"
      end
      
    end
    
  end
  
end