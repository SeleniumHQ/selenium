# frozen_string_literal: true

# This file auto-generates code for the IE driver. To make different language
# bindings easier to maintain, it generates code for mapping numeric return
# type identifiers (returned from wdGetScriptResultType) to a meaningful
# string identifier.
#
module SeleniumRake
  class JavaFormatter
    def generate_file_header
      <<~HEREDOC
        /* AUTO GENERATED - Do not edit by hand. */
        /* See rake-tasks/selenium_rake/java_formatter.rb instead. */
        package org.openqa.selenium.ie;
        public class IeReturnTypes {
      HEREDOC
    end

    def generate_file_footer
      "}\n"
    end

    def generate_line_string(numeric_type, type_desc)
      "  public static final int #{type_desc} = #{numeric_type};\n"
    end
  end
end
