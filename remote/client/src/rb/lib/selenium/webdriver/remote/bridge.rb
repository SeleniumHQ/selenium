module Selenium
  module WebDriver
    module Remote

      COMMANDS = {}

      #
      # Low level bridge to the remote server, through which the rest of the API works.
      #
      # @private
      #

      class Bridge
        include Find
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
        # @param http_client [Class] an HTTP client class that implements the same interface as DefaultHttpClient
        # @param desired_capabilities [Capabilities] an instance of Remote::Capabilities describing the capabilities you want
        #

        def initialize(opts = {})
          opts                 = default_options.merge(opts)
          http_client_class    = opts.delete(:http_client)
          desired_capabilities = opts.delete(:desired_capabilities)
          url                  = opts.delete(:url)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          if desired_capabilities.kind_of?(Symbol)
            unless Capabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end

            desired_capabilities = Capabilities.send(desired_capabilities)
          end

          uri = URI.parse(url)
          uri.path += "/" unless uri.path =~ /\/$/

          @http         = http_client_class.new uri
          @capabilities = create_session(desired_capabilities)
        end

        def browser
          @browser ||= @capabilities.browser_name.gsub(" ", "_").to_sym
        end

        def driver_extensions
          []
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

        def setSpeed(value)
          execute :setSpeed, {}, :speed => value
        end

        def getSpeed
          execute :getSpeed
        end

        def executeScript(script, *args)
          unless capabilities.javascript?
            raise Error::UnsupportedOperationError, "underlying webdriver instance does not support javascript"
          end

          result = execute :executeScript, {}, :script => script, :args => args
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

        def findElementByClassName(parent, class_name)
          find_element_by 'class name', class_name, parent
        end

        def findElementsByClassName(parent, class_name)
          find_elements_by 'class name', class_name, parent
        end

        def findElementById(parent, id)
          find_element_by 'id', id, parent
        end

        def findElementsById(parent, id)
          find_elements_by 'id', id, parent
        end

        def findElementByLinkText(parent, link_text)
          find_element_by 'link text', link_text, parent
        end

        def findElementsByLinkText(parent, link_text)
          find_elements_by 'link text', link_text, parent
        end

        def findElementByPartialLinkText(parent, link_text)
          find_element_by 'partial link text', link_text, parent
        end

        def findElementsByPartialLinkText(parent, link_text)
          find_elements_by 'partial link text', link_text, parent
        end

        def findElementByName(parent, name)
          find_element_by 'name', name, parent
        end

        def findElementsByName(parent, name)
          find_elements_by 'name', name, parent
        end

        def findElementByTagName(parent, tag_name)
          find_element_by 'tag name', tag_name, parent
        end

        def findElementsByTagName(parent, tag_name)
          find_elements_by 'tag name', tag_name, parent
        end

        def findElementByXpath(parent, xpath)
          find_element_by 'xpath', xpath, parent
        end

        def findElementsByXpath(parent, xpath)
          find_elements_by 'xpath', xpath, parent
        end


        #
        # Element functions
        #

        def clickElement(element)
          execute :clickElement, :id => element
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

        def getElementSize(element)
          data = execute :getElementSize, :id => element

          Dimension.new data['width'], data['height']
        end

        def sendKeysToElement(element, string)
          execute :sendKeysToElement, {:id => element}, {:value => string.split(//u)}
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

        def toggleElement(element)
          execute :toggleElement, :id => element
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

        def hoverOverElement(element)
          execute :hoverOverElement, :id => element
        end

        def dragElement(element, rigth_by, down_by)
          execute :dragElement, {:id => element}, :x => rigth_by, :y => down_by
        end

        def elementEquals(element, other)
          execute :elementEquals, :id => element.ref, :other => other.ref
        end

        private

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
        # Returns a WebDriver::Remote::Response instance
        #

        def raw_execute(command, opts = {}, command_hash = nil)
          verb, path = COMMANDS[command] || raise("unknown command #{command.inspect}")
          path       = path.dup

          path[':session_id'] = @session_id if path.include?(":session_id")

          begin
            opts.each { |key, value| path[key.inspect] = URI.escape(value.to_s)}
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          puts "-> #{verb.to_s.upcase} #{path}" if $DEBUG
          http.call verb, path, command_hash
        end

        def default_options
          {
            :url                  => "http://localhost:4444/wd/hub",
            :http_client          => Http::Default,
            :desired_capabilities => Capabilities.firefox
          }
        end

      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
