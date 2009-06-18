require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: includes(item) -> parameter_matcher
    #
    # Matches any object that responds true to include?(item)
    #   object = mock()
    #   object.expects(:method_1).with(includes('foo'))
    #   object.method_1(['foo', 'bar'])
    #   # no error raised
    #
    #   object.method_1(['baz'])
    #   # error raised, because ['baz'] does not include 'foo'.
    def includes(item)
      Includes.new(item)
    end

    class Includes < Base # :nodoc:

      def initialize(item)
        @item = item
      end

      def matches?(available_parameters)
        parameter = available_parameters.shift
        return parameter.include?(@item)
      end

      def mocha_inspect
        "includes(#{@item.mocha_inspect})"
      end

    end

  end
  
end
