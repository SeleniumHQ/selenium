# encoding: utf-8
#
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
    module Remote

      #
      # Low level bridge to the remote server, through which the rest of the API works.
      #
      # @api private
      #

      class W3CBridge
        include BridgeHelper

        COMMANDS = {}

        #
        # Defines a wrapper method for a command, which ultimately calls #execute.
        #
        # @param name [Symbol]
        #   name of the resulting method
        # @param verb [Symbol]
        #   the appropriate http verb, such as :get, :post, or :delete
        # @param url [String]
        #   a URL template, which can include some arguments, much like the definitions on the server.
        #   the :session_id parameter is implicitly handled, but the remainder will become required method arguments.
        #

        def self.command(name, verb, url)
          COMMANDS[name] = [verb, url.freeze]
        end

        attr_accessor :context, :http, :file_detector
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
          desired_capabilities = opts.delete(:desired_capabilities) { W3CCapabilities.firefox }
          url                  = opts.delete(:url) { "http://#{Platform.localhost}:4444/wd/hub" }

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          if desired_capabilities.kind_of?(Symbol)
            unless W3CCapabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end

            desired_capabilities = W3CCapabilities.send(desired_capabilities)
          end

          uri = url.kind_of?(URI) ? url : URI.parse(url)
          uri.path += "/" unless uri.path =~ /\/$/

          http_client.server_url = uri

          @http          = http_client
          @capabilities  = create_session(desired_capabilities)

          @file_detector = nil
        end

        def browser
          @browser ||= (
            name = @capabilities.browser_name
            name ? name.gsub(" ", "_").to_sym : 'unknown'
          )
        end

        def driver_extensions
          [
            DriverExtensions::HasInputDevices,
            DriverExtensions::UploadsFiles,
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasSessionId,
            DriverExtensions::Rotatable,
            DriverExtensions::HasTouchScreen,
            DriverExtensions::HasLocation,
            DriverExtensions::HasNetworkConnection,
            DriverExtensions::HasRemoteStatus
          ]
        end

        #
        # Returns the current session ID.
        #

        def session_id
          @session_id || raise(Error::WebDriverError, "no current session exists")
        end

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, :desiredCapabilities => desired_capabilities
          @session_id = resp['sessionId'] or raise Error::WebDriverError, 'no sessionId in returned payload'

          W3CCapabilities.json_create resp['value']
        end

        def status
          execute :status
        end

        def get(url)
          execute :get, {}, :url => url
        end

        def getCapabilities
          W3CCapabilities.json_create execute(:getCapabilities)
        end

        def setImplicitWaitTimeout(milliseconds)
          setTimeout('implicit', milliseconds)
        end

        def setScriptTimeout(milliseconds)
          setTimeout('script', milliseconds)
        end

        def setTimeout(type, milliseconds)
          execute :setTimeout, {}, :type => type, :ms => milliseconds
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
          execute :sendAlertText, {}, {:handler => 'prompt', :message => keys}
        end

        def getAlertText
          execute :getAlertText
        end

        #
        # navigation
        #

        def goBack
          execute :back
        end

        def goForward
          execute :forward
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
          execute :switchToWindow, {}, :handle => name
        end

        def switchToFrame(id)
          locator  = case id
                     when String
                       find_element_by('id', id)
                     when Hash
                       find_element_by(id.keys.first.to_s, id.values.first)
                     else
                       id
                     end

          execute :switchToFrame, {}, :id => locator
        end

        def switchToParentFrame
          execute :switchToParentFrame
        end

        def switchToDefaultContent
          switchToFrame nil
        end

        QUIT_ERRORS = [IOError]

        def quit
          execute :deleteSession
          http.close
        rescue *QUIT_ERRORS
        end

        def close
          execute :closeWindow
        end

        def refresh
          execute :refresh
        end

        #
        # window handling
        #

        def getWindowHandles
          execute :getWindowHandles
        end

        def getCurrentWindowHandle
          execute :getWindowHandle
        end

        # TODO - These Commands might require checking for being
        # current window before performing
        def setWindowSize(width, height, handle = :current)
          execute :setWindowSize, {}, {:width  => width,
                                   :height => height}
        end

        def maximizeWindow(handle = :current)
          execute :maximizeWindow
        end

        def getWindowSize(handle = :current)
          data = execute :getWindowSize

          Dimension.new data['width'], data['height']
        end

        def setWindowPosition(x, y, handle = :current)
          execute :setWindowPosition, :x => x, :y => y
        end

        def getWindowPosition(handle = :current)
          data = execute :getWindowPosition

          Point.new data['x'], data['y']
        end

        def getScreenshot
          execute :takeScreenshot
        end

        #
        # HTML 5
        #

        def getLocalStorageItem(key)
          execute :getLocalStorageItem, :key => key
        end

        def removeLocalStorageItem(key)
          execute :removeLocalStorageItem, :key => key
        end

        def getLocalStorageKeys
          execute :getLocalStorageKeys
        end

        def setLocalStorageItem(key, value)
          execute :setLocalStorageItem, {}, :key => key, :value => value
        end

        def clearLocalStorage
          execute :clearLocalStorage
        end

        def getLocalStorageSize
          execute :getLocalStorageSize
        end

        def getSessionStorageItem(key)
          execute :getSessionStorageItem, :key => key
        end

        def removeSessionStorageItem(key)
          execute :removeSessionStorageItem, :key => key
        end

        def getSessionStorageKeys
          execute :getSessionStorageKeys
        end

        def setSessionStorageItem(key, value)
          execute :setSessionStorageItem, {}, :key => key, :value => value
        end

        def clearSessionStorage
          execute :clearSessionStorage
        end

        def getSessionStorageSize
          execute :getSessionStorageSize
        end

        def getLocation
          obj = execute(:getLocation) || {} # android returns null
          Location.new obj['latitude'], obj['longitude'], obj['altitude']
        end

        def setLocation(lat, lon, alt)
          loc = {:latitude => lat, :longitude => lon, :altitude => alt}
          execute :setLocation, {}, :location => loc
        end

        def getNetworkConnection
          execute :getNetworkConnection
        end

        def setNetworkConnection(type)
          execute :setNetworkConnection, {}, :parameters => {:type => type}
        end

        #
        # javascript execution
        #

        def executeScript(script, *args)
          result = execute :executeScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        def executeAsyncScript(script, *args)
          result = execute :executeAsyncScript, {}, :script => script, :args => args
          unwrap_script_result result
        end

        #
        # cookies
        #

        def addCookie(cookie)
          execute :addCookie, {}, cookie
        end

        def deleteCookie(name)
          execute :deleteCookie, :name => name
        end

        # TODO - write specs
        def getCookie(name)
          execute :getCookie, :name => name
        end

        def getAllCookies
          execute :getAllCookies
        end

        def deleteAllCookies
          getAllCookies.each { |cookie| deleteCookie(cookie['name'])}
        end

        #
        # actions
        #

        def clickElement(element)
          execute :elementClick, :id => element
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
            params.merge! :xoffset => x, :yoffset => y
          end

          execute :mouseMoveTo, {}, params
        end

        def sendKeysToActiveElement(keys)
          sendKeysToElement(getActiveElement, keys)
        end

        def sendKeysToElement(element, keys)
          execute :elementSendKeys, {:id => element}, {:value => keys.join('').split(//)}
        end

        def upload(local_file)
          unless File.file?(local_file)
            raise Error::WebDriverError, "you may only upload files: #{local_file.inspect}"
          end

          execute :uploadFile, {}, :file => Zipper.zip_file(local_file)
        end

        def clearElement(element)
          execute :elementClear, :id => element
        end


        def submitElement(element)
          executeScript("var e = arguments[0].ownerDocument.createEvent('Event');" +
                            "e.initEvent('submit', true, true);" +
                            "if (arguments[0].dispatchEvent(e)) { arguments[0].submit() }", element)
        end

        def dragElement(element, right_by, down_by)
          execute :dragElement, {:id => element}, :x => right_by, :y => down_by
        end

        def touchSingleTap(element)
          execute :touchSingleTap, {}, :element => element
        end

        def touchDoubleTap(element)
          execute :touchDoubleTap, {}, :element => element
        end

        def touchLongPress(element)
          execute :touchLongPress, {}, :element => element
        end

        def touchDown(x, y)
          execute :touchDown, {}, :x => x, :y => y
        end

        def touchUp(x, y)
          execute :touchUp, {}, :x => x, :y => y
        end

        def touchMove(x, y)
          execute :touchMove, {}, :x => x, :y => y
        end

        def touchScroll(element, x, y)
          if element
            execute :touchScroll, {}, :element => element,
                                      :xoffset => x,
                                      :yoffset => y
          else
            execute :touchScroll, {}, :xoffset => x, :yoffset => y
          end
        end

        def touchFlick(xspeed, yspeed)
          execute :touchFlick, {}, :xspeed => xspeed, :yspeed => yspeed
        end

        def touchElementFlick(element, right_by, down_by, speed)
          execute :touchFlick, {}, :element => element,
                                   :xoffset => right_by,
                                   :yoffset => down_by,
                                   :speed   => speed

        end

        def setScreenOrientation(orientation)
          execute :setScreenOrientation, {}, :orientation => orientation
        end

        def getScreenOrientation
          execute :getScreenOrientation
        end

        #
        # element properties
        #

        def getElementTagName(element)
          execute :getElementTagName, :id => element
        end

        def getElementAttribute(element, name)
          execute :getElementAttribute, :id => element, :name => name
        end

        def getElementValue(element)
          execute :getElementProperty, :id => element, :name => 'value'
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

        def isElementEnabled(element)
          execute :isElementEnabled, :id => element
        end

        def isElementSelected(element)
          execute :isElementSelected, :id => element
        end

        def isElementDisplayed(element)
          execute :isElementDisplayed, :id => element
        end
        def getElementValueOfCssProperty(element, prop)
          execute :getElementCssValue, :id => element, :property_name => prop
        end

        def elementEquals(element, other)
          element.ref == other.ref
        end

        #
        # finding elements
        #

        def getActiveElement
          Element.new self, element_id_from(execute(:getActiveElement))
        end
        alias_method :switchToActiveElement, :getActiveElement

        def find_element_by(how, what, parent = nil)
          how, what = convert_locators(how, what)

          if parent
            id = execute :findChildElement, {:id => parent}, {:using => how, :value => what}
          else
            id = execute :findElement, {}, {:using => how, :value => what}
          end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          how, what = convert_locators(how, what)

          if parent
            ids = execute :findChildElements, {:id => parent}, {:using => how, :value => what}
          else
            ids = execute :findElements, {}, {:using => how, :value => what}
          end

          ids.map { |id| Element.new self, element_id_from(id) }
        end

        private

        def convert_locators(how, what)
          case how
          when 'class name'
            how = 'css selector'
            what = ".#{what}"
          when 'id'
            how = 'css selector'
            what = "##{what}"
          when 'name'
            how = 'css selector'
            what = "*[name='#{what}']"
          when 'tag name'
            how = 'css selector'
          end
          return how, what
        end

        #
        # executes a command on the remote server.
        #
        #
        # Returns the 'value' of the returned payload
        #

        def execute(*args)
          result = raw_execute(*args)
          result.payload.key?('value') ? result['value'] : result
        end

        #
        # executes a command on the remote server.
        #
        # @return [WebDriver::Remote::Response]
        #

        def raw_execute(command, opts = {}, command_hash = nil)
          verb, path = COMMANDS[command] || raise(ArgumentError, "unknown command: #{command.inspect}")
          path       = path.dup

          path[':session_id'] = @session_id if path.include?(":session_id")

          begin
            opts.each { |key, value|
              path[key.inspect] = escaper.escape(value.to_s)
            }
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          puts "-> #{verb.to_s.upcase} #{path}" if $DEBUG
          http.call verb, path, command_hash
        end

        def escaper
          @escaper ||= defined?(URI::Parser) ? URI::Parser.new : URI
        end

      end # W3CBridge
    end # Remote
  end # WebDriver
end # Selenium
