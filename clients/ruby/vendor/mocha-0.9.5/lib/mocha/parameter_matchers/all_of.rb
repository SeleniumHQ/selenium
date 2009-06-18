require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: all_of(*parameter_matchers) -> parameter_matcher
    #
    # Matches if all +parameter_matchers+ match.
    #   object = mock()
    #   object.expects(:method_1).with(all_of(includes(1), includes(3)))
    #   object.method_1([1, 3])
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(all_of(includes(1), includes(3)))
    #   object.method_1([1, 2])
    #   # error raised, because method_1 was not called with object including 1 and 3
    def all_of(*matchers)
      AllOf.new(*matchers)
    end
    
    class AllOf < Base # :nodoc:
      
      def initialize(*matchers)
        @matchers = matchers
      end
    
      def matches?(available_parameters)
        parameter = available_parameters.shift
        @matchers.all? { |matcher| matcher.to_matcher.matches?([parameter]) }
      end
      
      def mocha_inspect
        "all_of(#{@matchers.map { |matcher| matcher.mocha_inspect }.join(", ") })"
      end
      
    end
    
  end
  
end