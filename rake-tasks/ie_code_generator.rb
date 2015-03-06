# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returened from wdGetScriptResultType) to a meaningful
# string identifier.
#
class JavaFormatter
  def generate_file_header
    out_str = "/* AUTO GENERATED - Do not edit by hand. */\n"
    out_str += "/* See rake-tasks/ie_code_generator.rb instead. */\n"
    out_str += "package org.openqa.selenium.ie;\n"
    out_str += "public class IeReturnTypes {\n"
    return out_str
  end
  def generate_file_footer
    return "}\n"
  end
  def generate_line_string(numeric_type, type_desc)
    return "  public static final int #{type_desc} = #{numeric_type};\n"
  end
end

class CppFormatter
  def generate_file_header
    out_str = "/* AUTO GENERATED - Do not edit by hand. */\n"
    out_str += "/* See rake-tasks/ie_code_generator.rb instead. */\n"
    out_str += "#ifndef __IE_RETURN_TYPES_H_\n"
    out_str += "#define __IE_RETURN_TYPES_H_\n"
    return out_str
  end
  def generate_file_footer
    return "#endif\n"
  end
  def generate_line_string(numeric_type, type_desc)
    return "#define TYPE_#{type_desc} (#{numeric_type})\n"
  end
end

class TypeDefinitionsGenerator
  def initialize(type_definitions_file)
    file = File.new(type_definitions_file, "r")
    @type_to_name_map = {}
    while (line = file.gets)
      (val, name) = line.split
      @type_to_name_map[val.to_i] = name
    end
  end

  def generate_defs_file(dest_file, formatter)
    file = File.new(dest_file, "w")
    file.puts formatter.generate_file_header
    sorted_keys = @type_to_name_map.keys.sort
    for num_type in sorted_keys
      str_type = @type_to_name_map[num_type]
      file.puts(formatter.generate_line_string(num_type, str_type))
    end
    file.puts formatter.generate_file_footer
    file.close
  end

  def generate_java_definitions(dest_file)
    java_formatter = JavaFormatter.new
    generate_defs_file(dest_file, java_formatter)
  end

  def generate_cpp_definitions(dest_file)
    cpp_formatter = CppFormatter.new
    generate_defs_file(dest_file, cpp_formatter)
  end
end

def ie_generate_type_mapping(args)
  types_mapping_file = args[:src]
  generated_file = "#{args[:out]}"

  file generated_file => args[:src] do
    generator = TypeDefinitionsGenerator.new types_mapping_file
    method_name = "generate_#{args[:type]}_definitions"
    if generator.respond_to?(method_name) then
      generator.send(method_name, generated_file)
    else
      puts "Cannot generate definitions for #{args[:type]}"
    end
  end

  task "#{args[:name]}" => generated_file
end
