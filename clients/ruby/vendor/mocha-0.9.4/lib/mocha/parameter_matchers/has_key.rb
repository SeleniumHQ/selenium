require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: has_key(key) -> parameter_matcher
    #
    # Matches +Hash+ containing +key+.
    #   object = mock()
    #   object.expects(:method_1).with(has_key('key_1'))
    #   object.method_1('key_1' => 1, 'key_2' => 2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(has_key('key_1'))
    #   object.method_1('key_2' => 2)
    #   # error raised, because method_1 was not called with Hash containing key: 'key_1'
    def has_key(key)
      HasKey.new(key)
    end

    class HasKey < Base # :nodoc:
      
      def initialize(key)
        @key = key
      end
      
      def matches?(available_parameters)
        parameter = available_parameters.shift
        parameter.keys.any? { |key| @key.to_matcher.matches?([key]) }
      end
      
      def mocha_inspect
        "has_key(#{@key.mocha_inspect})"
      end
      
    end
    
  end
  
end