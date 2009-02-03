module Selenium
  module Client

    # Convenience methods not explicitely part of the protocol
    module Extensions
	
	    # These for all Ajax request to finish (Only works if you are using prototype, the wait in happenning browser side)
	    #
	    # See http://davidvollbracht.com/2008/6/4/30-days-of-tech-day-3-waitforajax for
	    # more background.
      def wait_for_ajax(timeout_in_seconds=nil)
	      wait_for_condition "selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0", timeout_in_seconds
	    end
	
	    # Wait for all Prototype effects to be processed (the wait in happenning browser side).
	    #
	    # Credits to http://github.com/brynary/webrat/tree/master
			def wait_for_effects(timeout_in_seconds=nil)
			  wait_for_condition "window.Effect.Queue.size() == 0", timeout_in_seconds
			end
			
			# Wait for an element to be present (the wait in happenning browser side).
		  def wait_for_element(locator, timeout_in_seconds=nil)
		    script = <<-EOS
		    var element;
		    try {
		      element = selenium.browserbot.findElement('#{locator}');
		    } catch(e) {
		      element = null;
		    }
		    element != null;
		    EOS

		    wait_for_condition script, timeout_in_seconds
		  end

			# Wait for an element to NOT be present (the wait in happenning browser side).
		  def wait_for_no_element(locator, timeout_in_seconds=nil)
		    script = <<-EOS
		    var element;
		    try {
		      element = selenium.browserbot.findElement('#{locator}');
		    } catch(e) {
		      element = null;
		    }
		    element == null;
		    EOS

		    wait_for_condition script, timeout_in_seconds
		  end

			# Wait for some text to be present (the wait in happenning browser side).
			#
			# If locator is nil or no locator is provided, the text will be
			# detected anywhere in the page.
			#
			# If a non nil locator is provided, the text will be
			# detected within the innerHTML of the element identified by the locator.			
		  def wait_for_text(text, locator=nil, timeout_in_seconds=nil)
		    script = case locator
		    when nil:
  		    <<-EOS
              var text;
              try {
                text = selenium.browserbot.getCurrentWindow().find('#{text}');
              } catch(e) {
                text = null;
              }
              text != null;
          EOS
        else
  		    <<-EOS
  		        var element;
                try {
                  element = selenium.browserbot.getCurrentWindow().findElement('#{locator}');
                } catch(e) {
                  element = null;
                }
                element != null && element.innerHTML == '#{text}'";
          EOS
        end          

		    wait_for_condition script, timeout_in_seconds
		  end

			# Wait for some text to NOT be present (the wait in happenning browser side).
			#
			# If locator is nil or no locator is provided, the text will be
			# detected anywhere in the page.
			#
			# If a non nil locator is provided, the text will be
			# detected within the innerHTML of the element identified by the locator.			
		  def wait_for_no_text(original_text, locator=nil, timeout_in_seconds=nil)
		    script = case locator
		    when nil:
		      <<-EOS
              var text;
              try {
                text = selenium.browserbot.getCurrentWindow().find('#{original_text}');
              } catch(e) {
                text = false;
              }
              text == false;
		      EOS
		    else
          <<-EOS
              var element;
              
              try {
                element = selenium.browserbot.findElement('#{locator}');
              } catch(e) {
                element = null;
              }
              alert(element);
              element != null && element.innerHTML != '#{original_text}'";
           EOS
		    end
        wait_for_condition script, timeout_in_seconds
		  end

			# Wait for a field to get a specific value (the wait in happenning browser side).
		  def wait_for_field_value(locator, expected_value, timeout_in_seconds=nil)
		    script = "var element;
		              try {
		                element = selenium.browserbot.findElement('#{locator}');
		              } catch(e) {
		                element = null;
		              }
		              element != null && element.value == '#{expected_value}'";

		    wait_for_condition script, timeout_in_seconds
		  end

    end
  end
end