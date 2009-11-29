require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: any_of(*parameter_matchers) -> parameter_matcher
    #
    # Matches if any +parameter_matchers+ match.
    #   object = mock()
    #   object.expects(:method_1).with(any_of(1, 3))
    #   object.method_1(1)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(any_of(1, 3))
    #   object.method_1(3)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(any_of(1, 3))
    #   object.method_1(2)
    #   # error raised, because method_1 was not called with 1 or 3
    def any_of(*matchers)
      AnyOf.new(*matchers)
    end
    
    class AnyOf < Base # :nodoc:
      
      def initialize(*matchers)
        @matchers = matchers
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        @matchers.any? { |matcher| matcher.to_matcher.matches?([parameter]) }
      end
      
      def mocha_inspect
        "any_of(#{@matchers.map { |matcher| matcher.mocha_inspect }.join(", ") })"
      end
      
    end
    
  end
  
end