require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: regexp_matches(regular_expression) -> parameter_matcher
    #
    # Matches any object that matches +regular_expression+.
    #   object = mock()
    #   object.expects(:method_1).with(regexp_matches(/e/))
    #   object.method_1('hello')
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(regexp_matches(/a/))
    #   object.method_1('hello')
    #   # error raised, because method_1 was not called with a parameter that matched the 
    #   # regular expression
    def regexp_matches(regexp)
      RegexpMatches.new(regexp)
    end

    class RegexpMatches < Base # :nodoc:
  
      def initialize(regexp)
        @regexp = regexp
      end
  
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter =~ @regexp
      end
  
      def mocha_inspect
        "regexp_matches(#{@regexp.mocha_inspect})"
      end
  
    end
    
  end
  
end
