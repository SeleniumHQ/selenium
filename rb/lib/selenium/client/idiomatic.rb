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
      #
      def text(locator)
        string_command "getText", [locator,]
      end
      alias :text_content :text

      # Return the title of the current HTML page.
      def title
        string_command "getTitle"
      end

      # Returns the absolute URL of the current page.
      def location
        string_command "getLocation"
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
        remote_control_command "waitForPageToLoad",
            [actual_timeout_in_milliseconds(timeout_in_seconds),]
      end
      alias_method :wait_for_page_to_load, :wait_for_page

      # Waits for a popup window to appear and load up.
      #
      # window_id is the JavaScript window "name" of the window that will appear (not the text of the title bar)
      # timeout_in_seconds is a timeout in seconds, after which the action will return with an error
      def wait_for_popup(window_id, timeout_in_seconds=nil)
        remote_control_command "waitForPopUp",
            [window_id, actual_timeout_in_milliseconds(timeout_in_seconds) ,]
      end

      # Flexible wait semantics. ait is happening browser side. Useful for testing AJAX application.
      #
      # * wait :wait_for => :page                                                      # will wait for a new page to load
      # * wait :wait_for => :popup, :window => 'a window id'                           # will wait for a new popup window to appear. Also selects the popup window for you provide `:select => true`
      # * wait :wait_for => :ajax                                                      # will wait for all ajax requests to be completed using semantics of default javascript framework
      # * wait :wait_for => :ajax, :javascript_framework => :jquery                    # will wait for all ajax requests to be completed overriding default javascript framework
      # * wait :wait_for => :effects                                                   # will wait for all javascript effects to be rendered using semantics of default javascript framework
      # * wait :wait_for => :effects, :javascript_framework => :prototype              # will wait for all javascript effects to be rendered overriding default javascript framework
      # * wait :wait_for => :element, :element => 'new_element_id'                     # will wait for an element to be present/appear
      # * wait :wait_for => :no_element, :element => 'new_element_id'                  # will wait for an element to be not be present/disappear
      # * wait :wait_for => :text, :text => 'some text'                                # will wait for some text to be present/appear
      # * wait :wait_for => :text, :text => /A Regexp/                                 # will wait for some text to be present/appear
      # * wait :wait_for => :text, :element => 'a_locator', :text => 'some text'       # will wait for the content of 'a_locator' to be 'some text'
      # * wait :wait_for => :no_text, :text => 'some text'                             # will wait for the text to be not be present/disappear
      # * wait :wait_for => :no_text, :text => /A Regexp/                              # will wait for the text to be not be present/disappear
      # * wait :wait_for => :no_text, :element => 'a_locator', :text => 'some text'    # will wait for the content of 'a_locator' to not be 'some text'
      # * wait :wait_for => :value, :element => 'a_locator', :value => 'some value'    # will wait for the field value of 'a_locator' to be 'some value'
      # * wait :wait_for => :no_value, :element => 'a_locator', :value => 'some value' # will wait for the field value of 'a_locator' to not be 'some value'
      # * wait :wait_for => :visible, :element => 'a_locator'                          # will wait for element to be visible
      # * wait :wait_for => :not_visible, :element => 'a_locator'                      # will wait for element to not be visible
      # * wait :wait_for => :condition, :javascript => 'some expression'               # will wait for the javascript expression to be true
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def wait_for(options)
        if options[:wait_for] == :page
          wait_for_page options[:timeout_in_seconds]
	      elsif options[:wait_for] == :ajax
	          wait_for_ajax options
	      elsif options[:wait_for] == :element
	          wait_for_element options[:element], options
	      elsif options[:wait_for] == :no_element
	          wait_for_no_element options[:element], options
	      elsif options[:wait_for] == :text
	          wait_for_text options[:text], options
	      elsif options[:wait_for] == :no_text
          wait_for_no_text options[:text], options
	      elsif options[:wait_for] == :effects
	          wait_for_effects options
        elsif options[:wait_for] == :popup
            wait_for_popup options[:window], options[:timeout_in_seconds]
            select_window options[:window] if options[:select]
        elsif options[:wait_for] == :value
            wait_for_field_value options[:element], options[:value], options
        elsif options[:wait_for] == :no_value
            wait_for_no_field_value options[:element], options[:value], options
        elsif options[:wait_for] == :visible
            wait_for_visible options[:element], options
        elsif options[:wait_for] == :not_visible
            wait_for_not_visible options[:element], options
	      elsif options[:wait_for] == :condition
	          wait_for_condition options[:javascript], options[:timeout_in_seconds]
        end
      end

      # Gets the entire text of the page.
      def body_text
        string_command "getBodyText"
      end

      # Clicks on a link, button, checkbox or radio button.
      #
      # 'locator' is an element locator
      #
      # Using 'options' you can automatically wait for an event to happen after the
      # click. e.g.
      #
      # * click "a_locator", :wait_for => :page                                                      # will wait for a new page to load
      # * click "a_locator", :wait_for => :popup, :window => 'a window id'                           # will wait for a new popup window to appear. Also selects the popup window for you provide `:select => true`
      # * click "a_locator", :wait_for => :ajax                                                      # will wait for all ajax requests to be completed using semantics of default javascript framework
      # * click "a_locator", :wait_for => :ajax, :javascript_framework => :jquery                    # will wait for all ajax requests to be completed overriding default javascript framework
      # * click "a_locator", :wait_for => :effects                                                   # will wait for all javascript effects to be rendered using semantics of default javascript framework
      # * click "a_locator", :wait_for => :effects, :javascript_framework => :prototype              # will wait for all javascript effects to be rendered overriding default javascript framework
      # * click "a_locator", :wait_for => :element, :element => 'new_element_id'                     # will wait for an element to be present/appear
      # * click "a_locator", :wait_for => :no_element, :element => 'new_element_id'                  # will wait for an element to be not be present/disappear
      # * click "a_locator", :wait_for => :text, :text => 'some text'                                # will wait for some text to be present/appear
      # * click "a_locator", :wait_for => :text, :text => /A Regexp/                                 # will wait for some text to be present/appear
      # * click "a_locator", :wait_for => :text, :element => 'a_locator', :text => 'some text'       # will wait for the content of 'a_locator' to be 'some text'
      # * click "a_locator", :wait_for => :no_text, :text => 'some text'                             # will wait for the text to be not be present/disappear
      # * click "a_locator", :wait_for => :no_text, :text => /A Regexp/                              # will wait for the text to be not be present/disappear
      # * click "a_locator", :wait_for => :no_text, :element => 'a_locator', :text => 'some text'    # will wait for the content of 'a_locator' to not be 'some text'
      # * click "a_locator", :wait_for => :value, :element => 'a_locator', :value => 'some value'    # will wait for the field value of 'a_locator' to be 'some value'
      # * click "a_locator", :wait_for => :no_value, :element => 'a_locator', :value => 'some value' # will wait for the field value of 'a_locator' to not be 'some value'
      # * click "a_locator", :wait_for => :visible, :element => 'a_locator'                          # will wait for element to be visible
      # * click "a_locator", :wait_for => :not_visible, :element => 'a_locator'                      # will wait for element to not be visible
      # * click "a_locator", :wait_for => :condition, :javascript => 'some expression'               # will wait for the javascript expression to be true
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def click(locator, options={})
        remote_control_command "click", [locator,]
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

      # Determines if the specified element is visible. An
      # element can be rendered invisible by setting the CSS "visibility"
      # property to "hidden", or the "display" property to "none", either for the
      # element itself or one if its ancestors.  This method will fail if
      # the element is not present.
      #
      # 'locator' is an element locator
      def visible?(locator)
         boolean_command "isVisible", [locator,]
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
        string_command "getAlert"
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
        string_command "getConfirmation"
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
        string_command "getPrompt"
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
        string_command "getEval", [script,]
      end

      # Set the Remote Control timeout (as opposed to the client side driver timeout).
      # This timout specifies the amount of time that Selenium Core will wait for actions to complete.
      #
      # The default timeout is 30 seconds.
      # 'timeout' is a timeout in seconds, after which the action will return with an error
      #
      # Actions that require waiting include "open" and the "waitFor*" actions.
      def remote_control_timeout_in_seconds=(timeout_in_seconds)
        remote_control_command "setTimeout", [actual_timeout_in_milliseconds(timeout_in_seconds),]
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
        remote_control_command "waitForCondition",
            [script, actual_timeout_in_milliseconds(timeout_in_seconds),]
      end

      # Simulates the user clicking the "back" button on their browser.
      # Using 'options' you can automatically wait for an event to happen after the
      # click. e.g.
      #
      # * go_back :wait_for => :page                                                      # will wait for a new page to load
      # * go_back :wait_for => :popup, :window => 'a window id'                           # will wait for a new popup window to appear. Also selects the popup window for you provide `:select => true`
      # * go_back :wait_for => :ajax                                                      # will wait for all ajax requests to be completed using semantics of default javascript framework
      # * go_back :wait_for => :ajax, :javascript_framework => :jquery                    # will wait for all ajax requests to be completed overriding default javascript framework
      # * go_back :wait_for => :effects                                                   # will wait for all javascript effects to be rendered using semantics of default javascript framework
      # * go_back :wait_for => :effects, :javascript_framework => :prototype              # will wait for all javascript effects to be rendered overriding default javascript framework
      # * go_back :wait_for => :element, :element => 'new_element_id'                     # will wait for an element to be present/appear
      # * go_back :wait_for => :no_element, :element => 'new_element_id'                  # will wait for an element to be not be present/disappear
      # * go_back :wait_for => :text, :text => 'some text'                                # will wait for some text to be present/appear
      # * go_back "a_locator", :wait_for => :text, :text => /A Regexp/                    # will wait for some text to be present/appear
      # * go_back :wait_for => :text, :element => 'a_locator', :text => 'some text'       # will wait for the content of 'a_locator' to be 'some text'
      # * go_back :wait_for => :no_text, :text => 'some text'                             # will wait for the text to be not be present/disappear
      # * go_back "a_locator", :wait_for => :no_text, :text => /A Regexp/                 # will wait for the text to be not be present/disappear
      # * go_back :wait_for => :no_text, :element => 'a_locator', :text => 'some text'    # will wait for the content of 'a_locator' to not be 'some text'
      # * go_back :wait_for => :condition, :javascript => 'some expression'               # will wait for the javascript expression to be true
      # * go_back :wait_for => :value, :element => 'a_locator', :value => 'some value'    # will wait for the field value of 'a_locator' to be 'some value'
      # * go_back :wait_for => :visible, :element => 'a_locator'                          # will wait for element to be visible
      # * go_back :wait_for => :not_visible, :element => 'a_locator'                      # will wait for element to not be visible
      # * go_back :wait_for => :no_value, :element => 'a_locator', :value => 'some value' # will wait for the field value of 'a_locator' to not be 'some value'
      #
      # Using options you can also define an explicit timeout (:timeout_in_seconds key). Otherwise the default driver timeout
      # is used.
      def go_back(options={})
        remote_control_command "goBack"
        wait_for options
      end

      # Return all cookies for the current page under test.
      def cookies
        string_command "getCookie"
      end

      # Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
      #
      # 'name' is the name of the cookie
      def cookie(name)
        string_command "getCookieByName", [name,]
      end

      # Returns true if a cookie with the specified name is present, or false otherwise.
      #
      # 'name' is the name of the cookie
      def cookie?(name)
        boolean_command "isCookiePresent", [name,]
      end

      # Create a new cookie whose path and domain are same with those of current page
      # under test, unless you specified a path for this cookie explicitly.
      #
      # 'nameValuePair' is name and value of the cookie in a format "name=value"
      # 'optionsString' is options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.
      # the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will      usually fail.
      def create_cookie(name_value_pair, options="")
        if options.kind_of? Hash
		      options = options.keys.collect {|key| "#{key}=#{options[key]}" }.sort.join(", ")
        end
        remote_control_command "createCookie", [name_value_pair,options,]
      end

      # Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
      # need to delete it using the exact same path and domain that were used to create the cookie.
      # If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
      # note that specifying a domain that isn't a subset of the current domain will usually fail.
      #
      # Since there's no way to discover at runtime the original path and domain of a given cookie,
      # we've added an option called 'recurse' to try all sub-domains of the current domain with
      # all paths that are a subset of the current path.  Beware; this option can be slow.  In
      # big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
      # name and m is the number of slashes in the path.
      #
      # 'name' is the name of the cookie to be deleted
      # 'optionsString' is options for the cookie. Currently supported options include 'path', 'domain'      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".      The order of options are irrelevant. Note that specifying a domain that isn't a subset of      the current domain will usually fail.
      def delete_cookie(name, options="")
        if options.kind_of? Hash
		      ordered_keys = options.keys.sort {|a,b| a.to_s <=> b.to_s }
		      options = ordered_keys.collect {|key| "#{key}=#{options[key]}" }.join(", ")
        end
        remote_control_command "deleteCookie", [name,options,]
      end

      # Returns the IDs of all windows that the browser knows about.
      def all_window_ids
        string_array_command "getAllWindowIds"
      end


      # Returns the names of all windows that the browser knows about.
      def all_window_names
        string_array_command "getAllWindowNames"
      end


      # Returns the titles of all windows that the browser knows about.
      def all_window_titles
        string_array_command "getAllWindowTitles"
      end

      # Returns a string representation of the network traffic seen by the
      # browser, including headers, AJAX requests, status codes, and timings.
      # When this function is called, the traffic log is cleared, so the
      # returned content is only the traffic seen since the last call.
      #
      # The network traffic is returned in the format it was requested. Valid
      # values are: :json, :xml, or :plain.
      #
      # Warning: For browser_network_traffic to work you need to start your
      # browser session with the option "captureNetworkTraffic=true", which
      # will force ALL traffic to go to the Remote Control proxy even for
      # more efficient browser modes like `*firefox` and `*safari`.
      def browser_network_traffic(format = :plain)
        raise "format must be :plain, :json, or :xml"   \
            unless [:plain, :json, :xml].include?(format)

        remote_control_command "captureNetworkTraffic", [format.to_s]
      end

      # Allows choice of a specific XPath libraries for Xpath evualuation
      # in the browser (e.g. to resolve XPath locators).
      #
      # `library_name' can be:
      #     * :ajaxslt          : Google's library
      #     * :javascript-xpath : Cybozu Labs' faster library
      #     * :default          : Selenium default library.
      def browser_xpath_library=(library_name)
        raise "library name must be :ajaxslt, :javascript-xpath, or :default"   \
            unless [:ajaxslt, :'javascript-xpath', :default].include?(library_name)
        remote_control_command "useXpathLibrary", [library_name.to_s]
      end

      #
      # Turn on/off the automatic hightlighting of the element driven or
      # inspected by Selenium core. Useful when recording videos
      #
      def highlight_located_element=(enabled)
        boolean = (true == enabled)
        js_eval "selenium.browserbot.shouldHighlightLocatedElement = #{boolean}"
      end

      # Get execution delay in milliseconds, i.e. a pause delay following
      # each selenium operation. By default, there is no such delay
      # (value is 0).
      def execution_delay
        string_command "getSpeed"
      end

      # Set the execution delay in milliseconds, i.e. a pause delay following
      # each selenium operation. By default, there is no such delay.
      #
      # Setting an execution can be useful to troubleshoot or capture videos
      def execution_delay=(delay_in_milliseconds)
        remote_control_command "setSpeed", [delay_in_milliseconds]
      end

      def actual_timeout_in_milliseconds(timeout_in_seconds)
        actual_timeout = (timeout_in_seconds ||
                          default_timeout_in_seconds).to_i
        actual_timeout * 1000
      end
    end

  end
end
