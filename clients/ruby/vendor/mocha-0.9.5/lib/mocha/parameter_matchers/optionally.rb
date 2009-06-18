module Mocha
  
  module ParameterMatchers

    # :call-seq: optionally(*parameter_matchers) -> parameter_matcher
    #
    # Matches optional parameters if available.
    #   object = mock()
    #   object.expects(:method_1).with(1, 2, optionally(3, 4))
    #   object.method_1(1, 2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(1, 2, optionally(3, 4))
    #   object.method_1(1, 2, 3)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(1, 2, optionally(3, 4))
    #   object.method_1(1, 2, 3, 4)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(1, 2, optionally(3, 4))
    #   object.method_1(1, 2, 3, 5)
    #   # error raised, because optional parameters did not match
    def optionally(*matchers)
      Optionally.new(*matchers)
    end
    
    class Optionally < Base # :nodoc:
      
      def initialize(*parameters)
        @matchers = parameters.map { |parameter| parameter.to_matcher }
      end
      
      def matches?(available_parameters)
        index = 0
        while (available_parameters.length > 0) && (index < @matchers.length) do
          matcher = @matchers[index]
          return false unless matcher.matches?(available_parameters)
          index += 1
        end
        return true
      end
      
      def mocha_inspect
        "optionally(#{@matchers.map { |matcher| matcher.mocha_inspect }.join(", ") })"
      end
      
    end
    
  end
  
end