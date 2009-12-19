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
        # @param browser [Symbol]
        #   the driver type to use
        # @param *rest
        #   arguments passed to the Bridge.new
        #
        # @return [Driver]
        #

        def for(browser, *args)
          bridge = case browser
                   when :ie, :internet_explorer
                     WebDriver::IE::Bridge.new(*args)
                   when :remote
                     WebDriver::Remote::Bridge.new(*args)
                   when :chrome
                     WebDriver::Chrome::Bridge.new(*args)
                   when :firefox, :ff
                     WebDriver::Firefox::Bridge.new(*args)
                   else
                     raise ArgumentError, "unknown driver: #{browser.inspect}"
                   end

           driver = new(bridge)

           unless bridge.driver_extensions.empty?
             driver.extend(*bridge.driver_extensions)
           end

           driver
        end
      end

      #
      # A new Driver instance
      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
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

      # Get the first element matching the given id.
      #
      # @param [String] id
      # @return [WebDriver::Element]
      #
      #   driver['someElementId'] #=> #<WebDriver::Element:0x1011c3b88>
      #

      def [](id)
        find_element :id, id
      end


      #
      # for Find
      #
      # @api private
      #

      def ref
        nil
      end

    end # Driver
  end # WebDriver
end # Selenium