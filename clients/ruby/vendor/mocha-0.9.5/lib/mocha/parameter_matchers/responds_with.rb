require 'mocha/parameter_matchers/base'
require 'yaml'

module Mocha

  module ParameterMatchers

    # :call-seq: responds_with(message, result) -> parameter_matcher
    #
    # Matches any object that responds to +message+ with +result+. To put it another way, it tests the quack, not the duck.
    #   object = mock()
    #   object.expects(:method_1).with(responds_with(:upcase, "FOO"))
    #   object.method_1("foo")
    #   # no error raised, because "foo".upcase == "FOO"
    #
    #   object = mock()
    #   object.expects(:method_1).with(responds_with(:upcase, "BAR"))
    #   object.method_1("foo")
    #   # error raised, because "foo".upcase != "BAR"
    def responds_with(message, result)
      RespondsWith.new(message, result)
    end

    class RespondsWith < Base # :nodoc:

      def initialize(message, result)
        @message, @result = message, result
      end

      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.__send__(@message) == @result
      end

      def mocha_inspect
        "responds_with(#{@message.mocha_inspect}, #{@result.mocha_inspect})"
      end
      
    end
    
  end
  
end
