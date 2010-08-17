module Selenium
  module WebDriver

    #
    # The main class through which you control the browser.
    #
    # @see Find
    # @see Navigation
    # @see TargetLocator
    # @see Options
    #

    class Driver
      include Find

      attr_reader :bridge

      class << self

        #
        # Create a new Driver instance with the correct bridge for the given browser
        #
        # @param browser [:ie, :internet_explorer, :remote, :chrome, :firefox, :ff]
        #   the driver type to use
        # @param *rest
        #   arguments passed to Bridge.new
        #
        # @return [Driver]
        #
        # @example
        #
        #   Driver.for :firefox, :profile => "some-profile"
        #   Driver.for :firefox, :profile => Profile.new
        #   Driver.for :remote,  :url => "http://localhost:4444/wd/hub", :desired_capabilities => caps
        #

        def for(browser, *args)
          bridge = case browser
                   when :ie, :internet_explorer
                     IE::Bridge.new(*args)
                   when :remote
                     Remote::Bridge.new(*args)
                   when :chrome
                     Chrome::Bridge.new(*args)
                   when :firefox, :ff
                     Firefox::Bridge.new(*args)
                   else
                     raise ArgumentError, "unknown driver: #{browser.inspect}"
                   end

           new(bridge)
        end
      end

      #
      # A new Driver instance with the given bridge
      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge

        # TODO: refactor this away
        unless @bridge.driver_extensions.empty?
          extend(*@bridge.driver_extensions)
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
        @navigate ||= WebDriver::Navigation.new(self)
      end

      #
      # @return [TargetLocator]
      # @see TargetLocator
      #

      def switch_to
        @switch_to ||= WebDriver::TargetLocator.new(self)
      end

      #
      # @return [Options]
      # @see Options
      #

      def manage
        @manage ||= WebDriver::Options.new(self)
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
      #   Arguments will be available in the given script as the 'arguments' array.
      #
      # @return [WebDriver::Element,Integer,Float,Boolean,NilClass,String,Array]
      #   The value returned from the script.
      #

      def execute_script(script, *args)
        bridge.executeScript(script, *args)
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
      #   driver['someElementId']    #=> #<WebDriver::Element:0x1011c3b88>
      #   driver[:tag_name => 'div'] #=> #<WebDriver::Element:0x1011c3b88>
      #

      def [](sel)
        if sel.kind_of?(String) || sel.kind_of?(Symbol)
          sel = { :id => sel }
        end

        find_element sel
      end


      #
      # for Find
      #
      # @private
      #

      def ref
        nil
      end

    end # Driver
  end # WebDriver
end # Selenium
