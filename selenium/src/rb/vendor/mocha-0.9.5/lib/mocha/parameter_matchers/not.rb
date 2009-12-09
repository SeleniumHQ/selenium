require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: Not(parameter_matcher) -> parameter_matcher
    #
    # Matches if +parameter_matcher+ does not match.
    #   object = mock()
    #   object.expects(:method_1).with(Not(includes(1)))
    #   object.method_1([0, 2, 3])
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(Not(includes(1)))
    #   object.method_1([0, 1, 2, 3])
    #   # error raised, because method_1 was not called with object not including 1
    def Not(matcher)
      Not.new(matcher)
    end
    
    class Not < Base # :nodoc:
      
      def initialize(matcher)
        @matcher = matcher
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        !@matcher.matches?([parameter])
      end
      
      def mocha_inspect
        "Not(#{@matcher.mocha_inspect})"
      end
      
    end
    
  end
  
end