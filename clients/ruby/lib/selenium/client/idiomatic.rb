module Selenium
  module Client
    
		# Provide a more idiomatic API than the generated Ruby driver.
		#
		# Work in progress...
    module Idiomatic

      # Return the text content of an HTML element (rendered text shown to
      # the user). Works for any HTML element that contains text.
      # 
      #
      # This command uses either the textContent (Mozilla-like browsers)
      # or the innerText (IE-like browsers) of the element, which is the
      # rendered text shown to the user.
      #
      # * 'locator' is an Selenium element locator
      def text_content(locator)
        string_command"getText", [locator,]
      end
      
      # Return the title of the current HTML page.
      def title
        string_command"getTitle"
      end

      # Returns the absolute URL of the current page.
      def location
        string_command"getLocation"
      end

      # Waits for a new page to load.
      # 
      # Selenium constantly keeps track of new pages loading, and sets a 
      # "newPageLoaded" flag when it first notices a page load. Running 
      # any other Selenium command after turns the flag to false. Hence, 
      # if you want to wait for a page to load, you must wait immediately 
      # after a Selenium command that caused a page-load.
      # 
      # * 'timeout_in_seconds' is a timeout in seconds, after which this 
      #   command will return with an error
      def wait_for_page(timeout_in_seconds=nil)
          actual_timeout = timeout_in_seconds || default_timeout_in_seconds
        remote_control_command "waitForPageToLoad", [actual_timeout * 1000,]
      end

      # Flexible wait semantics. ait is happening browser side. Useful for testing AJAX application.
      #
      # * wait :wait_for => :page                                       # will wait for a new page to load
      # * wait :wait_for => :ajax                                       # will wait for all ajax requests to be completed (Prototype only)
      # * wait :wait_for => :effects                                    # will wait for all Prototype effects to be rendered
      # * wait :wait_for => :element, :element => 'new_element_id'      # will wait for an element to be present/appear
      # * wait :wait_for => :no_element, :element => 'new_element_id'   # will wait for an element to be not be present/disappear
      # * wait :wait_for => :text, :text => 'some text'                 # will wait for some text to be present/appear
      # * wait :wait_for => :no_text, :text => 'some text'              # will wait for the text to be not be present/disappear
      # * wait :wait_for => :condition, :javascript => 'some expression' # will wait for the javascript expression to be true
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def wait_for(options)
        if options[:wait_for] == :page
          wait_for_page options[:timeout_in_seconds]
	      elsif options[:wait_for] == :ajax
	          wait_for_ajax options[:timeout_in_seconds]
	      elsif options[:wait_for] == :element
	          wait_for_element options[:element], options[:timeout_in_seconds]
	      elsif options[:wait_for] == :no_element
	          wait_for_no_element options[:element], options[:timeout_in_seconds]
	      elsif options[:wait_for] == :text
	          wait_for_text options[:text], options[:timeout_in_seconds]
	      elsif options[:wait_for] == :no_text
	          wait_for_no_text options[:text], options[:timeout_in_seconds]
	      elsif options[:wait_for] == :effects
	          wait_for_effects options[:timeout_in_seconds]
	      elsif options[:wait_for] == :condition
	          wait_for_condition options[:javascript], options[:timeout_in_seconds]
        end
      end
	
      # Gets the entire text of the page.
      def body_text
        string_command"getBodyText"
      end

      # Clicks on a link, button, checkbox or radio button.
      #
      # 'locator' is an element locator      
      # 
      # Using 'options' you can automatically wait for an event to happen after the 
      # click. e.g.
      #
      # * click 'some_id', :wait_for => :page                                        # will wait for a new page to load
      # * click 'some_id', :wait_for => :ajax                                        # will wait for all ajax requests to be completed (Prototype only)
      # * click 'some_id', :wait_for => :effects                                     # will wait for all Prototype effects to be rendered
      # * click 'some_id', :wait_for => :element, :element => 'new_element_id'       # will wait for an element to be present/appear
      # * click 'some_id', :wait_for => :no_element, :element => 'new_element_id'    # will wait for an element to be not be present/disappear
      # * click :wait_for => :text, :text => 'some text'                             # will wait for some text to be present/appear
      # * click :wait_for => :no_text, :text => 'some text'                          # will wait for the text to be not be present/disappear
      # * click 'some_id', :wait_for => :condition, :javascript => 'some expression' # will wait for the javascript expression to be true
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def click(locator, options={})
        remote_control_command("click", [locator,])        
        wait_for options
      end

      # Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
      #
      # * 'pattern' is a pattern to match with the text of the page
      def text?(pattern)
        boolean_command "isTextPresent", [pattern,]
      end

      # Verifies that the specified element is somewhere on the page.
      #
      # * 'locator' is an element locator
      def element?(locator)
        boolean_command "isElementPresent", [locator,]
      end

      # Gets the (whitespace-trimmed) value of an input field 
      # (or anything else with a value parameter).
      # For checkbox/radio elements, the value will be "on" or "off" 
      # depending on whether the element is checked or not.
      #
      # * 'locator' is an element locator
      def field(locator)
        string_command "getValue", [locator,]
      end

      # Alias for +field+ 
      def value(locator)
	      field locator
      end

      # Returns whether a toggle-button (checkbox/radio) is checked. 
      # Fails if the specified element doesn't exist or isn't a toggle-button.
      #
      # * 'locator' is an element locator pointing to a checkbox or radio button
      def checked?(locator)
        boolean_command "isChecked", [locator,]
      end

      # Whether an alert occurred
      def alert?
        boolean_command "isAlertPresent"
      end

      # Retrieves the message of a JavaScript alert generated during the previous action, 
      # or fail if there were no alerts.
      # 
      # Getting an alert has the same effect as manually clicking OK. If an
      # alert is generated but you do not consume it with getAlert, the next Selenium action
      # will fail.
      #
      # Under Selenium, JavaScript alerts will NOT pop up a visible alert
      # dialog.
      #
      # Selenium does NOT support JavaScript alerts that are generated in a
      # page's onload() event handler. In this case a visible dialog WILL be
      # generated and Selenium will hang until someone manually clicks OK.
      # 
      def alert
        string_command"getAlert"
      end
      
      # Whether a confirmation has been auto-acknoledged (i.e. confirm() been called)
      def confirmation?
        boolean_command "isConfirmationPresent"
      end

      # Retrieves the message of a JavaScript confirmation dialog generated during
      # the previous action.
      # 
      # By default, the confirm function will return true, having the same effect
      # as manually clicking OK. This can be changed by prior execution of the
      # chooseCancelOnNextConfirmation command. 
      # 
      # If an confirmation is generated but you do not consume it with getConfirmation,
      # the next Selenium action will fail.
      # 
      # NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
      # dialog.
      # 
      # NOTE: Selenium does NOT support JavaScript confirmations that are
      # generated in a page's onload() event handler. In this case a visible
      # dialog WILL be generated and Selenium will hang until you manually click
      # OK.
      def confirmation
        string_command"getConfirmation"
      end

      # Whether a prompt occurred
      def prompt?
        boolean_command "isPromptPresent"
      end

      # Retrieves the message of a JavaScript question prompt dialog generated during
      # the previous action.
      # 
      # Successful handling of the prompt requires prior execution of the
      # answerOnNextPrompt command. If a prompt is generated but you
      # do not get/verify it, the next Selenium action will fail.
      #
      # NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
      # dialog.
      #
      # NOTE: Selenium does NOT support JavaScript prompts that are generated in a
      # page's onload() event handler. In this case a visible dialog WILL be
      # generated and Selenium will hang until someone manually clicks OK.
      def prompt
        string_command"getPrompt"
      end

      # Returns the result of evaluating the specified JavaScript snippet whithin the browser.
      #  The snippet may have multiple lines, but only the result of the last line will be returned.
      # 
      # Note that, by default, the snippet will run in the context of the "selenium"
      # object itself, so <tt>this</tt> will refer to the Selenium object.  Use <tt>window</tt> to
      # refer to the window of your application, e.g. <tt>window.document.getElementById('foo')</tt>
      # If you need to use
      # a locator to refer to a single element in your application page, you can
      # use <tt>this.browserbot.findElement("id=foo")</tt> where "id=foo" is your locator.
      # 
      # * 'script' is the JavaScript snippet to run
      def js_eval(script)
        string_command"getEval", [script,]
      end

      # Set the Remote Control timeout (as opposed to the client side driver timeout).
      # This timout specifies the amount of time that Selenium Core will wait for actions to complete.
      # 
      # The default timeout is 30 seconds.
      # 'timeout' is a timeout in seconds, after which the action will return with an error
      #
      # Actions that require waiting include "open" and the "waitFor*" actions.
      def remote_control_timeout_in_seconds=(timeout_in_seconds)
          remote_control_command "setTimeout", [timeout_in_seconds * 1000,]
      end

      # Returns the text from a cell of a table. The cellAddress syntax
      # tableLocator.row.column, where row and column start at 0.
      #
      # * 'tableCellAddress' is a cell address, e.g. "foo.1.4"
      def table_cell_text(tableCellAddress)
        string_command "getTable", [tableCellAddress,]
      end

      # Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
      # The snippet may have multiple lines, but only the result of the last line
      # will be considered.
      # 
      # Note that, by default, the snippet will be run in the runner's test window, not in the window
      # of your application.  To get the window of your application, you can use
      # the JavaScript snippet <tt>selenium.browserbot.getCurrentWindow()</tt>, and then
      # run your JavaScript in there
      # 
      #
      # * 'script' is the JavaScript snippet to run
      # * 'timeout_in_seconds' is a timeout in seconds, after which this command will return with an error
      def wait_for_condition(script, timeout_in_seconds = nil)
        remote_control_command "waitForCondition", [script, (timeout_in_seconds || default_timeout_in_seconds) * 1000,]
      end

      # Simulates the user clicking the "back" button on their browser.
      # Using 'options' you can automatically wait for an event to happen after the 
      # click. e.g.
      #
      # * go_back :wait_for => :page                                        # will wait for a new page to load
      # * go_back :wait_for => :ajax                                        # will wait for all ajax requests to be completed (Prototype only)
      # * go_back :wait_for => :effects                                     # will wait for all Prototype effects to be rendered
      # * go_back :wait_for => :element, :element => 'new_element_id'       # will wait for an element to be present/appear
      # * go_back :wait_for => :no_element, :element => 'new_element_id'    # will wait for an element to be not be present/disappear
      # * go_back :wait_for => :text, :text => 'some text'                  # will wait for some text to be present/appear
      # * go_back :wait_for => :no_text, :text => 'some text'               # will wait for the text to be not be present/disappear
      # * go_back :wait_for => :condition, :javascript => 'some expression' # will wait for the javascript expression to be true
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def go_back(options={})
        remote_control_command "goBack"
        wait_for options
      end

    end
  
  end
end
