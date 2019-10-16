# frozen_string_literal: true

# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returned from wdGetScriptResultType) to a meaningful
# string identifier.
module SeleniumRake
  class IEGenerator
    def generate_type_mapping(args)
      types_mapping_file = args[:src]
      generated_file = args[:out].to_s

      file generated_file => args[:src] do
        generator = TypeDefinitionsGenerator.new types_mapping_file
        method_name = "generate_#{args[:type]}_definitions"
        if generator.respond_to?(method_name)
          generator.send(method_name, generated_file)
        else
          puts "Cannot generate definitions for #{args[:type]}"
        end
      end

      task args[:name].to_s => generated_file
    end
  end
end
