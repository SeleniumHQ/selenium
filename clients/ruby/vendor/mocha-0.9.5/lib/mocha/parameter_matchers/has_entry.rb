require 'mocha/parameter_matchers/base'

module Mocha
  
  module ParameterMatchers

    # :call-seq: has_entry(key, value) -> parameter_matcher
    #            has_entry(key => value) -> parameter_matcher
    #
    # Matches +Hash+ containing entry with +key+ and +value+.
    #   object = mock()
    #   object.expects(:method_1).with(has_entry('key_1', 1))
    #   object.method_1('key_1' => 1, 'key_2' => 2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(has_entry('key_1' => 1))
    #   object.method_1('key_1' => 1, 'key_2' => 2)
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(has_entry('key_1', 1))
    #   object.method_1('key_1' => 2, 'key_2' => 1)
    #   # error raised, because method_1 was not called with Hash containing entry: 'key_1' => 1
    #
    #   object = mock()
    #   object.expects(:method_1).with(has_entry('key_1' => 1))
    #   object.method_1('key_1' => 2, 'key_2' => 1)
    #   # error raised, because method_1 was not called with Hash containing entry: 'key_1' => 1
    def has_entry(*options)
      key, value = options.shift, options.shift
      key, value = key.to_a[0][0..1] if key.is_a?(Hash)
      HasEntry.new(key, value)
    end
    
    class HasEntry < Base # :nodoc:
      
      def initialize(key, value)
        @key, @value = key, value
      end
      
      def matches?(available_parameters)
        parameter = available_parameters.shift
        matching_keys = parameter.keys.select { |key| @key.to_matcher.matches?([key]) }
        matching_keys.any? { |key| @value.to_matcher.matches?([parameter[key]]) }
      end
      
      def mocha_inspect
        "has_entry(#{@key.mocha_inspect} => #{@value.mocha_inspect})"
      end
      
    end
    
  end
  
end