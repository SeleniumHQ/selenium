module Selenium
  module WebDriver
    module Remote

      COMMANDS = {}

      #
      # Low level bridge to the remote server, through which the rest of the API works.
      #
      # @api private
      #

      class Bridge
        include BridgeHelper

        #
        # Defines a wrapper method for a command, which ultimately calls #execute.
        #
        # @param name [Symbol]
        #   name of the resulting method
        # @param url [String]
        #   a URL template, which can include some arguments, much like the definitions on the server.
        #   the :session_id parameter is implicitly handled, but the remainder will become required method arguments.
        # @param verb [Symbol]
        #   the appropriate http verb, such as :get, :post, or :delete
        #

        def self.command(name, verb, url)
          COMMANDS[name] = [verb, url.freeze]
        end

        attr_accessor :context, :http
        attr_reader :capabilities

        #
        # Initializes the bridge with the given server URL.
        #
        # @param url         [String] url for the remote server
        # @param http_client [Object] an HTTP client instance that implements the same protocol as Http::Default
        # @param desired_capabilities [Capabilities] an instance of Remote::Capabilities describing the capabilities you want
        #

        def initialize(opts = {})
          opts = opts.dup

          http_client          = opts.delete(:http_client) { Http::Default.new }
          desired_capabilities = opts.delete(:desired_capabilities) { Capabilities.firefox }
          url                  = opts.delete(:url) { "http://#{Platform.localhost}:4444/wd/hub" }

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          if desired_capabilities.kind_of?(Symbol)
            unless Capabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end

            desired_capabilities = Capabilities.send(desired_capabilities)
          end

          uri = url.kind_of?(URI) ? url : URI.parse(url)
          uri.path += "/" unless uri.path =~ /\/$/

          http_client.server_url = uri

          @http         = http_client
          @capabilities = create_session(desired_capabilities)
        end

        def browser
          @browser ||= @capabilities.browser_name.gsub(" ", "_").to_sym
        end

        def driver_extensions
          [DriverExtensions::HasInputDevices, DriverExtensions::TakesScreenshot]
        end

        #
        # Returns the current session ID.
        #

        def session_id
          @session_id || raise(Error::WebDriverError, "no current session exists")
        end

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, :desiredCapabilities => desired_capabilities
          @session_id = resp['sessionId'] || raise(Error::WebDriverError, 'no sessionId in returned payload')

          Capabilities.json_create resp['value']
        end

        def get(url)
          execute :get, {}, :url => url
        end

        def getCapabilities
          Capabilities.json_create execute(:getCapabilities)
        end

        def setImplicitWaitTimeout(milliseconds)
          execute :setImplicitWaitTimeout, {}, :ms => milliseconds
        end

        def setScriptTimeout(milliseconds)
          execute :setScriptTimeout, {}, :ms => milliseconds
        end

        #
        # alerts
        #
        
        def getAlert
          execute :getAlert
        end

        def acceptAlert
          execute :acceptAlert
        end

        def dismissAlert
          execute :dismissAlert
        end

        def setAlertValue(keys)
          execute :setAlertValue, {}, :text => keys.to_s
        end

        def getAlertText
          execute :getAlertText
        end

        #
        # navigation
        #

        def goBack
          execute :goBack
        end

        def goForward
          execute :goForward
        end

        def getCurrentUrl
          execute :getCurrentUrl
        end

        def getTitle
          execute :getTitle
        end

        def getPageSource
          execute :getPageSource
        end

        def getVisible
          execute :getVisible
        end

        def setVisible(bool)
          execute :setVisible, {}, bool
        end

        def switchToWindow(name)
          execute :switchToWindow, {}, :name => name
        end

        def switchToFrame(id)
          execute :switchToFrame, {}, :id => id
        end

        def switchToDefaultContent
          execute :switchToFrame, {}, :id => nil
        end

        QUIT_ERRORS = [IOError]

        def quit
          execute :quit
        rescue *QUIT_ERRORS
        end

        def close
          execute :close
        end

        def refresh
          execute :refresh
        end

        def getWindowHandles
          execute :getWindowHandles
        end

        def getCurrentWindowHandle
          execute :getCurrentWindowHandle
        end

        def getScreenshot
          execute :screenshot
        end

        def executeScript(script, *args)
          assert_javascript_enabled

          result = execute :executeScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        def executeAsyncScript(script, *args)
          assert_javascript_enabled

          result = execute :executeAsyncScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        def addCookie(cookie)
          execute :addCookie, {}, :cookie => cookie
        end

        def deleteCookie(name)
          execute :deleteCookieNamed, :name => name
        end

        def getAllCookies
          execute :getAllCookies
        end

        def deleteAllCookies
          execute :deleteAllCookies
        end

        def clickElement(element)
          execute :clickElement, :id => element
        end

        def click
          execute :click, {}, :button => 0
        end

        def doubleClick
          execute :doubleClick
        end

        def contextClick
          execute :click, {}, :button => 2
        end

        def mouseDown
          execute :mouseDown
        end

        def mouseUp
          execute :mouseUp
        end

        def mouseMoveTo(element, x = nil, y = nil)
          params = { :element => element }

          if x && y
            params.merge!(:xoffset => x, :yoffset => y)
          end

          execute :mouseMoveTo, {}, params
        end

        def sendModifierKeyToActiveElement(key, down)
          execute :sendModifierKeyToActiveElement, {}, :value => key, :isdown => down
        end

        def getElementTagName(element)
          execute :getElementTagName, :id => element
        end

        def getElementAttribute(element, name)
          execute :getElementAttribute, :id => element, :name => name
        end

        def getElementValue(element)
          execute :getElementValue, :id => element
        end

        def getElementText(element)
          execute :getElementText, :id => element
        end

        def getElementLocation(element)
          data = execute :getElementLocation, :id => element

          Point.new data['x'], data['y']
        end

        def getElementLocationOnceScrolledIntoView(element)
          data = execute :getElementLocationOnceScrolledIntoView, :id => element

          Point.new data['x'], data['y']
        end

        def getElementSize(element)
          data = execute :getElementSize, :id => element

          Dimension.new data['width'], data['height']
        end

        def sendKeysToElement(element, keys)
          execute :sendKeysToElement, {:id => element}, {:value => keys}
        end

        def clearElement(element)
          execute :clearElement, :id => element
        end

        def isElementEnabled(element)
          execute :isElementEnabled, :id => element
        end

        def isElementSelected(element)
          execute :isElementSelected, :id => element
        end

        def isElementDisplayed(element)
          execute :isElementDisplayed, :id => element
        end

        def submitElement(element)
          execute :submitElement, :id => element
        end

        def setElementSelected(element)
          execute :setElementSelected, :id => element
        end

        def getElementValueOfCssProperty(element, prop)
          execute :getElementValueOfCssProperty, :id => element, :property_name => prop
        end

        def getActiveElement
          Element.new self, element_id_from(execute(:getActiveElement))
        end
        alias_method :switchToActiveElement, :getActiveElement

        def dragElement(element, right_by, down_by)
          execute :dragElement, {:id => element}, :x => right_by, :y => down_by
        end

        def elementEquals(element, other)
          execute :elementEquals, :id => element.ref, :other => other.ref
        end

        def find_element_by(how, what, parent = nil)
          if parent
            id = execute :findChildElement, {:id => parent}, {:using => how, :value => what}
          else
            id = execute :findElement, {}, {:using => how, :value => what}
          end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          if parent
            ids = execute :findChildElements, {:id => parent}, {:using => how, :value => what}
          else
            ids = execute :findElements, {}, {:using => how, :value => what}
          end

          ids.map { |id| Element.new self, element_id_from(id) }
        end

        private

        def assert_javascript_enabled
          unless capabilities.javascript_enabled?
            raise Error::UnsupportedOperationError, "underlying webdriver instance does not support javascript"
          end
        end

        #
        # executes a command on the remote server via the REST / JSON API.
        #
        #
        # Returns the 'value' of the returned payload
        #

        def execute(*args)
          raw_execute(*args)['value']
        end

        #
        # executes a command on the remote server via the REST / JSON API.
        #
        # @return [WebDriver::Remote::Response]
        #

        def raw_execute(command, opts = {}, command_hash = nil)
          verb, path = COMMANDS[command] || raise("unknown command #{command.inspect}")
          path       = path.dup

          path[':session_id'] = @session_id if path.include?(":session_id")

          begin
            opts.each { |key, value| path[key.inspect] = escaper.escape(value.to_s)}
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          puts "-> #{verb.to_s.upcase} #{path}" if $DEBUG
          http.call verb, path, command_hash
        end

        def escaper
          @escaper ||= defined?(URI::Parser) ? URI::Parser.new : URI
        end

      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
