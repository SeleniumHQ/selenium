require 'mocha/parameter_matchers/base'
require 'yaml'

module Mocha

  module ParameterMatchers

    # :call-seq: yaml_equivalent(object) -> parameter_matcher
    #
    # Matches any YAML that represents the specified +object+
    #   object = mock()
    #   object.expects(:method_1).with(yaml_equivalent(1, 2, 3))
    #   object.method_1("--- \n- 1\n- 2\n- 3\n")
    #   # no error raised
    #
    #   object = mock()
    #   object.expects(:method_1).with(yaml_equivalent(1, 2, 3))
    #   object.method_1("--- \n- 1\n- 2\n")
    #   # error raised, because method_1 was not called with YAML representing the specified Array
    def yaml_equivalent(object)
      YamlEquivalent.new(object)
    end

    class YamlEquivalent < Base # :nodoc:

      def initialize(object)
        @object = object
      end

      def matches?(available_parameters)
        parameter = available_parameters.shift
        @object == YAML.load(parameter)
      end

      def mocha_inspect
        "yaml_equivalent(#{@object.mocha_inspect})"
      end
      
    end
    
  end
  
end
