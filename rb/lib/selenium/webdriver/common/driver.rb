module Selenium
  module WebDriver

    #
    # The main class through which you control the browser.
    #
    # @see SearchContext
    # @see Navigation
    # @see TargetLocator
    # @see Options
    #

    class Driver
      include SearchContext

      class << self

        #
        # @api private
        #
        # @see Selenium::WebDriver.for
        #
        # @return [Driver]
        #

        def for(browser, opts = {})
          listener = opts.delete(:listener)

          bridge = case browser
                   when :firefox, :ff
                     Firefox::Bridge.new(opts)
                   when :remote
                     Remote::Bridge.new(opts)
                   when :ie, :internet_explorer
                     IE::Bridge.new(opts)
                   when :chrome
                     Chrome::Bridge.new(opts)
                   when :android
                     Android::Bridge.new(opts)
                   when :iphone
                     IPhone::Bridge.new(opts)
                   when :opera
                     Opera::Bridge.new(opts)
                   when :safari
                     Safari::Bridge.new(opts)
                   else
                     raise ArgumentError, "unknown driver: #{browser.inspect}"
                   end

          bridge = Support::EventFiringBridge.new(bridge, listener) if listener

          new(bridge)
        end
      end

      #
      # A new Driver instance with the given bridge.
      # End users should use Selenium::WebDriver.for instead of using this directly.
      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge

        # TODO: refactor this away
        unless bridge.driver_extensions.empty?
          extend(*bridge.driver_extensions)
        end
      end

      def inspect
        '#<%s:0x%x browser=%s>' % [self.class, hash*2, bridge.browser.inspect]
      end

      #
      # @return [Navigation]
      # @see Navigation
      #

      def navigate
        @navigate ||= WebDriver::Navigation.new(bridge)
      end

      #
      # @return [TargetLocator]
      # @see TargetLocator
      #

      def switch_to
        @switch_to ||= WebDriver::TargetLocator.new(bridge)
      end

      #
      # @return [Options]
      # @see Options
      #

      def manage
        @manage ||= WebDriver::Options.new(bridge)
      end

      #
      # Opens the specified URL in the browser.
      #

      def get(url)
        navigate.to(url)
      end

      #
      # Get the URL of the current page
      #
      # @return [String]
      #

      def current_url
        bridge.getCurrentUrl
      end

      #
      # Get the title of the current page
      #
      # @return [String]
      #

      def title
        bridge.getTitle
      end

      #
      # Get the source of the current page
      #
      # @return [String]
      #

      def page_source
        bridge.getPageSource
      end

      #
      # Get the visibility of the browser. Not applicable for all browsers.
      #
      # @return [Boolean]
      #

      def visible?
        bridge.getBrowserVisible
      end

      #
      # Set the visibility of the browser. Not applicable for all browsers.
      #
      # @param [Boolean]
      #

      def visible=(bool)
        bridge.setBrowserVisible bool
      end

      #
      # Quit the browser
      #

      def quit
        bridge.quit
      end

      #
      # Close the current window, or the browser if no windows are left.
      #

      def close
        bridge.close
      end

      #
      # Get the window handles of open browser windows.
      #
      # @return [Array]
      # @see TargetLocator#window
      #

      def window_handles
        bridge.getWindowHandles
      end

      #
      # Get the current window handle
      #
      # @return [String]
      #

      def window_handle
        bridge.getCurrentWindowHandle
      end

      #
      # Execute the given JavaScript
      #
      # @param [String] script
      #   JavaScript source to execute
      # @param [WebDriver::Element,Integer, Float, Boolean, NilClass, String, Array] *args
      #   Arguments will be available in the given script in the 'arguments' pseudo-array.
      #
      # @return [WebDriver::Element,Integer,Float,Boolean,NilClass,String,Array]
      #   The value returned from the script.
      #

      def execute_script(script, *args)
        bridge.executeScript(script, *args)
      end

      # Execute an asynchronous piece of JavaScript in the context of the
      # currently selected frame or window. Unlike executing
      # execute_script (synchronous JavaScript), scripts
      # executed with this method must explicitly signal they are finished by
      # invoking the provided callback. This callback is always injected into the
      # executed function as the last argument.
      #
      # @param [String] script
      #   JavaSCript source to execute
      # @param [WebDriver::Element,Integer, Float, Boolean, NilClass, String, Array] *args
      #   Arguments to the script. May be empty.
      #
      # @return [WebDriver::Element,Integer,Float,Boolean,NilClass,String,Array]
      #

      def execute_async_script(script, *args)
        bridge.executeAsyncScript(script, *args)
      end


      #-------------------------------- sugar  --------------------------------

      #
      #   driver.first(:id, 'foo')
      #

      alias_method :first, :find_element

      #
      #   driver.all(:class, 'bar') #=> [#<WebDriver::Element:0x1011c3b88, ...]
      #

      alias_method :all, :find_elements

      #
      #   driver.script('function() { ... };')
      #

      alias_method :script, :execute_script

      # Get the first element matching the given selector. If given a
      # String or Symbol, it will be used as the id of the element.
      #
      # @param  [String,Hash] id or selector
      # @return [WebDriver::Element]
      #
      # Examples:
      #
      #   driver['someElementId']    #=> #<WebDriver::Element:0x1011c3b88>
      #   driver[:tag_name => 'div'] #=> #<WebDriver::Element:0x1011c3b88>
      #

      def [](sel)
        if sel.kind_of?(String) || sel.kind_of?(Symbol)
          sel = { :id => sel }
        end

        find_element sel
      end

      def browser
        bridge.browser
      end

      def capabilities
        bridge.capabilities
      end

      #
      # @api private
      # @see SearchContext
      #

      def ref
        nil
      end

      private

      def bridge
        @bridge
      end

    end # Driver
  end # WebDriver
end # Selenium
