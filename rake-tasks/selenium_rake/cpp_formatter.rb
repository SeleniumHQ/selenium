# moved from ie_code_generator.rb
# # This file auto-generates code for the IE driver. To make different language
# # bindings easier to maintain, it generates code for mapping numeric return
# # type identifiers (returned from wdGetScriptResultType) to a meaningful
# # string identifier.
module SeleniumRake
  class CppFormatter
    def generate_file_header
      out_str = "/* AUTO GENERATED - Do not edit by hand. */\n"
      out_str += "/* See rake-tasks/ie_code_generator.rb instead. */\n"
      out_str += "#ifndef __IE_RETURN_TYPES_H_\n"
      out_str += "#define __IE_RETURN_TYPES_H_\n"
      out_str
    end

    def generate_file_footer
      "#endif\n"
    end

    def generate_line_string(numeric_type, type_desc)
      "#define TYPE_#{type_desc} (#{numeric_type})\n"
    end
  end
end
