# frozen_string_literal: true

# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returned from wdGetScriptResultType) to a meaningful
# string identifier.
module SeleniumRake
  class CppFormatter
    def generate_file_header
      <<~HEREDOC
        /* AUTO GENERATED - Do not edit by hand. */
        /* See rake-tasks/selenium_rake/cpp_formatter.rb instead. */
        #ifndef __IE_RETURN_TYPES_H_
        #define __IE_RETURN_TYPES_H_
      HEREDOC
    end

    def generate_file_footer
      "#endif\n"
    end

    def generate_line_string(numeric_type, type_desc)
      "#define TYPE_#{type_desc} (#{numeric_type})\n"
    end
  end
end
