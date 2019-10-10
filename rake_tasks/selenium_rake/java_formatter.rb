# frozen_string_literal: true

# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returned from wdGetScriptResultType) to a meaningful
# string identifier.
#
module SeleniumRake
  class JavaFormatter
    def generate_file_header
      out_str = "/* AUTO GENERATED - Do not edit by hand. */\n"
      out_str += "/* See rake-tasks/selenium_rake/java_formatter.rb instead. */\n"
      out_str += "package org.openqa.selenium.ie;\n"
      out_str += "public class IeReturnTypes {\n"
      out_str
    end

    def generate_file_footer
      "}\n"
    end

    def generate_line_string(numeric_type, type_desc)
      "  public static final int #{type_desc} = #{numeric_type};\n"
    end
  end
end
