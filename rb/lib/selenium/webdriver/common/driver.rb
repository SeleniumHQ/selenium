# frozen_string_literal: true

# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

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
          case browser
          when :chrome
            Chrome::Driver.new(opts)
          when :internet_explorer, :ie
            IE::Driver.new(opts)
          when :safari
            Safari::Driver.new(opts)
          when :firefox, :ff
            Firefox::Driver.new(opts)
          when :edge
            Edge::Driver.new(opts)
          when :edge_chrome
            EdgeChrome::Driver.new(opts)
          when :edge_html
            EdgeHtml::Driver.new(opts)
          when :remote
            Remote::Driver.new(opts)
          else
            raise ArgumentError, "unknown driver: #{browser.inspect}"
          end
        end
      end

      #
      # A new Driver instance with the given bridge.
      # End users should use Selenium::WebDriver.for instead of using this directly.
      #
      # @api private
      #

      def initialize(bridge, listener: nil)
        @service = nil
        @bridge = bridge
        @bridge = Support::EventFiringBridge.new(bridge, listener) if listener
      end

      def inspect
        format '#<%<class>s:0x%<hash>x browser=%<browser>s>', class: self.class, hash: hash * 2, browser: bridge.browser.inspect
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
      # @return [Manager]
      # @see Manager
      #

      def manage
        bridge.manage
      end

      #
      # @return [ActionBuilder]
      # @see ActionBuilder
      #

      def action
        bridge.action
      end

      def mouse
        bridge.mouse
      end

      def keyboard
        bridge.keyboard
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
        bridge.url
      end

      #
      # Get the title of the current page
      #
      # @return [String]
      #

      def title
        bridge.title
      end

      #
      # Get the source of the current page
      #
      # @return [String]
      #

      def page_source
        bridge.page_source
      end

      #
      # Quit the browser
      #

      def quit
        bridge.quit
      ensure
        @service&.stop
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
        bridge.window_handles
      end

      #
      # Get the current window handle
      #
      # @return [String]
      #

      def window_handle
        bridge.window_handle
      end

      #
      # Execute the given JavaScript
      #
      # @param [String] script
      #   JavaScript source to execute
      # @param [WebDriver::Element, Integer, Float, Boolean, NilClass, String, Array] args
      #   Arguments will be available in the given script in the 'arguments' pseudo-array.
      #
      # @return [WebDriver::Element,Integer,Float,Boolean,NilClass,String,Array]
      #   The value returned from the script.
      #

      def execute_script(script, *args)
        bridge.execute_script(script, *args)
      end

      # Execute an asynchronous piece of JavaScript in the context of the
      # currently selected frame or window. Unlike executing
      # execute_script (synchronous JavaScript), scripts
      # executed with this method must explicitly signal they are finished by
      # invoking the provided callback. This callback is always injected into the
      # executed function as the last argument.
      #
      # @param [String] script
      #   JavaScript source to execute
      # @param [WebDriver::Element,Integer, Float, Boolean, NilClass, String, Array] args
      #   Arguments to the script. May be empty.
      #
      # @return [WebDriver::Element,Integer,Float,Boolean,NilClass,String,Array]
      #

      def execute_async_script(script, *args)
        bridge.execute_async_script(script, *args)
      end

      #-------------------------------- sugar  --------------------------------

      #
      #   driver.first(id: 'foo')
      #

      alias_method :first, :find_element

      #
      #   driver.all(class: 'bar') #=> [#<WebDriver::Element:0x1011c3b88, ...]
      #

      alias_method :all, :find_elements

      #
      #   driver.script('function() { ... };')
      #

      alias_method :script, :execute_script

      # Get the first element matching the given selector. If given a
      # String or Symbol, it will be used as the id of the element.
      #
      # @param  [String,Hash] sel id or selector
      # @return [WebDriver::Element]
      #
      # Examples:
      #
      #   driver['someElementId']    #=> #<WebDriver::Element:0x1011c3b88>
      #   driver[:tag_name => 'div'] #=> #<WebDriver::Element:0x1011c3b88>
      #

      def [](sel)
        sel = {id: sel} if sel.is_a?(String) || sel.is_a?(Symbol)

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

      def ref; end

      private

      attr_reader :bridge

      def service_url(opts)
        @service = opts.delete(:service)
        %i[driver_opts driver_path port].each do |key|
          next unless opts.key? key

          WebDriver.logger.deprecate(":#{key}", ':service with an instance of Selenium::WebDriver::Service')
        end
        @service ||= Service.send(browser,
                                  args: opts.delete(:driver_opts),
                                  path: opts.delete(:driver_path),
                                  port: opts.delete(:port))
        @service.start
        @service.uri
      end
    end # Driver
  end # WebDriver
end # Selenium
