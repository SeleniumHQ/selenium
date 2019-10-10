# frozen_string_literal: true

# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returned from wdGetScriptResultType) to a meaningful
# string identifier.
module SeleniumRake
  class TypeDefinitionsGenerator
    def initialize(type_definitions_file)
      file = File.new(type_definitions_file, 'r')
      @type_to_name_map = {}
      while (line = file.gets)
        (val, name) = line.split
        @type_to_name_map[val.to_i] = name
      end
    end

    def generate_defs_file(dest_file, formatter)
      file = File.new(dest_file, 'w')
      file.puts formatter.generate_file_header
      sorted_keys = @type_to_name_map.keys.sort
      sorted_keys.each do |num_type|
        str_type = @type_to_name_map[num_type]
        file.puts(formatter.generate_line_string(num_type, str_type))
      end
      file.puts formatter.generate_file_footer
      file.close
    end

    def generate_java_definitions(dest_file)
      generate_defs_file(dest_file, JavaFormatter.new)
    end

    def generate_cpp_definitions(dest_file)
      generate_defs_file(dest_file, CppFormatter.new)
    end
  end
end
