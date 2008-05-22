module Mocha
  
  module ParameterMatchers

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