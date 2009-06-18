require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: has_value(value) -> parameter_matcher
    #
    # Matches +Hash+ containing +value+.
    #   object = mock()
    #   object.expects(:method_1).with(has_value(1))
    #   object.method_1('key_1' => 1, 'key_2' => 2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(has_value(1))
    #   object.method_1('key_2' => 2)
    #   # error raised, because method_1 was not called with Hash containing value: 1
    def has_value(value)
      HasValue.new(value)
    end

    class HasValue < Base # :nodoc:
      
      def initialize(value)
        @value = value
      end
      
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.values.any? { |value| @value.to_matcher.matches?([value]) }
      end
      
      def mocha_inspect
        "has_value(#{@value.mocha_inspect})"
      end
      
    end
    
  end
  
end