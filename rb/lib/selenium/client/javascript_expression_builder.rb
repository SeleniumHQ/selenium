module Selenium
  module Client

    class JavascriptExpressionBuilder
      attr_reader :script
	
      def initialize(javascript_framework_name=nil)
        @framework = javascript_framework_for(javascript_framework_name) if javascript_framework_name       
        @script = ""
      end
	    
	    def append(text)
	      @script << text
	      self
	    end
  
      def no_pending_ajax_requests
        append window_script("#{@framework.ajax_request_tracker} == 0")
      end

			def no_pending_effects
			  append window_script("Effect.Queue.size() == 0")
			end

      def visible(locator)
        append "selenium.isVisible('#{quote_escaped(locator)}')"
      end

      def not_visible(locator)
        append "!selenium.isVisible('#{quote_escaped(locator)}')"
      end
      
      def find_element(locator)
        append  <<-EOS
          var element;

          try {
            element = selenium.browserbot.findElement('#{quote_escaped(locator)}');
          } catch(e) {
            element = null;
          }
        EOS
      end
   
      def element_value_is(expected_value)
        append "(element != null && element.value == '#{quote_escaped(expected_value)}')"
      end

      def element_value_is_not(expected_value)
        append "(element == null || element.value != '#{quote_escaped(expected_value)}')"
      end

      def find_text(pattern, options)
        if options[:element].nil?
          find_text_in_document pattern, options
        else
          find_text_in_element pattern, options
        end

        self
      end

      def find_text_in_document(pattern, options)
        js_regexp = case pattern
        when Regexp
          pattern.inspect
        else
          /#{pattern}/.inspect
        end
        append <<-EOS
          var text_match;
          text_match = (null != selenium.browserbot.getCurrentWindow().document.body.innerHTML.match(#{js_regexp}));
        EOS
        
      end

      def find_text_in_element(pattern, options)
        find_element(options[:element])
        append <<-EOS
          var text_match;
          text_match = (element != null && #{text_match(pattern)});
        EOS
        
        self
      end

      def text_match(pattern)
        case pattern
        when Regexp
          "null != element.innerHTML.match(#{pattern.inspect})"
        else
          "element.innerHTML == '#{quote_escaped(pattern)}'"
        end
      end

      def javascript_framework_for(framework_name)
        case framework_name.to_sym
        when :prototype
          JavascriptFrameworks::Prototype
        when :jquery
          JavascriptFrameworks::JQuery
        else
          raise "Unsupported Javascript Framework: #{framework_name}"
        end
      end

      def window_script(expression)
        "selenium.browserbot.getCurrentWindow().#{expression};"
      end

      def quote_escaped(a_string)
        a_string.gsub(/\\/, "\\\\\\").gsub(/'/, %q<\\\'>)
      end
    end
  end
end