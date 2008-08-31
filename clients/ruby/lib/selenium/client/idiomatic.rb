#
# Provide a more idiomatic API than the generated Ruby driver.
#
# Work on progress...
#
module Selenium
  module Client
    
    module Idiomatic

      # Return the text content of an HTML element (rendered text shown to
      # the user). Works for any HTML element that contains text.
      # 
      #
      # This command uses either the textContent (Mozilla-like browsers)
      # or the innerText (IE-like browsers) of the element, which is the
      # rendered text shown to the user.
      #
      # 'locator' is an Selenium element locator
      def text_content(locator)
        get_text locator
      end
      
      # Return the title of the current HTML page.
      def title
        get_string("getTitle", [])        
      end

      # Waits for a new page to load.
      # 
      # Selenium constantly keeps track of new pages loading, and sets a 
      # "newPageLoaded" flag when it first notices a page load. Running 
      # any other Selenium command after turns the flag to false. Hence, 
      # if you want to wait for a page to load, you must wait immediately 
      # after a Selenium command that caused a page-load.
      # 
      # 'timeout_in_seconds' is a timeout in seconds, after which this 
      # command will return with an error
      def wait_for_page(timeout_in_seconds=nil)
          actual_timeout = timeout_in_seconds || default_timeout_in_seconds
        do_command("waitForPageToLoad", [actual_timeout * 1000,])
      end

      # Clicks on a link, button, checkbox or radio button. If the click action
      # causes a new page to load (like a link usually does), call
      # waitForPageToLoad.
      #
      # 'locator' is an element locator      
      def click(locator, options={})
        do_command("click", [locator,])        
        if options[:wait_for] == :page
          wait_for_page options[:timeout_in_seconds]
        end
      end

      # Gets the (whitespace-trimmed) value of an input field 
      # (or anything else with a value parameter).
      # For checkbox/radio elements, the value will be "on" or "off" 
      # depending on whether the element is checked or not.
      #
      # 'locator' is an element locator
      def value(locator)
        get_string("getValue", [locator,])
      end

      # Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
      #
      # 'pattern' is a pattern to match with the text of the page
      def text_present?(pattern)
        get_boolean("isTextPresent", [pattern,])
      end

      # Verifies that the specified element is somewhere on the page.
      #
      # 'locator' is an element locator
      def element_present?(locator)
        get_boolean("isElementPresent", [locator,])
      end

      # Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
      # 
      # Getting an alert has the same effect as manually clicking OK. If an
      # alert is generated but you do not consume it with getAlert, the next Selenium action
      # will fail.
      # Under Selenium, JavaScript alerts will NOT pop up a visible alert
      # dialog.
      # Selenium does NOT support JavaScript alerts that are generated in a
      # page's onload() event handler. In this case a visible dialog WILL be
      # generated and Selenium will hang until someone manually clicks OK.
      # 
      def alert()
        get_string("getAlert", [])
      end
      
    end
  
  end
end
