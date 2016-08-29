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

      class Bridge
        include BridgeHelper

        # TODO: constant shouldn't be modified in class
        COMMANDS = {}

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

          http_client = opts.delete(:http_client) { Http::Default.new }
          desired_capabilities = opts.delete(:desired_capabilities) { Capabilities.firefox }
          url = opts.delete(:url) { "http://#{Platform.localhost}:4444/wd/hub" }

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          if desired_capabilities.is_a?(Symbol)
            unless Capabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end

            desired_capabilities = Capabilities.send(desired_capabilities)
          end

          uri = url.is_a?(URI) ? url : URI.parse(url)
          uri.path += '/' unless uri.path =~ %r{\/$}

          http_client.server_url = uri

          @http = http_client
          @capabilities = create_session(desired_capabilities)

          @file_detector = nil
        end

        def browser
          @browser ||= (
            name = @capabilities.browser_name
            name ? name.tr(' ', '_').to_sym : 'unknown'
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
            DriverExtensions::HasRemoteStatus,
            DriverExtensions::HasWebStorage
          ]
        end

        #
        # Returns the current session ID.
        #

        def session_id
          @session_id || raise(Error::WebDriverError, 'no current session exists')
        end

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, {desiredCapabilities: desired_capabilities}
          @session_id = resp['sessionId']
          return Capabilities.json_create resp['value'] if @session_id

          raise Error::WebDriverError, 'no sessionId in returned payload'
        end

        def status
          execute :status
        end

        def get(url)
          execute :get, {}, {url: url}
        end

        def session_capabilities
          Capabilities.json_create execute(:getCapabilities)
        end

        def implicit_wait_timeout=(milliseconds)
          execute :implicitlyWait, {}, {ms: milliseconds}
        end

        def script_timeout=(milliseconds)
          execute :setScriptTimeout, {}, {ms: milliseconds}
        end

        def timeout(type, milliseconds)
          execute :setTimeout, {}, {type: type, ms: milliseconds}
        end

        #
        # alerts
        #

        def accept_alert
          execute :acceptAlert
        end

        def dismiss_alert
          execute :dismissAlert
        end

        def alert=(keys)
          execute :setAlertValue, {}, {text: keys.to_s}
        end

        def alert_text
          execute :getAlertText
        end

        def authentication(credentials)
          execute :setAuthentication, {}, credentials
        end

        #
        # navigation
        #

        def go_back
          execute :goBack
        end

        def go_forward
          execute :goForward
        end

        def url
          execute :getCurrentUrl
        end

        def title
          execute :getTitle
        end

        def page_source
          execute :getPageSource
        end

        def switch_to_window(name)
          execute :switchToWindow, {}, {name: name}
        end

        def switch_to_frame(id)
          execute :switchToFrame, {}, {id: id}
        end

        def switch_to_parent_frame
          execute :switchToParentFrame
        end

        def switch_to_default_content
          switch_to_frame(nil)
        end

        QUIT_ERRORS = [IOError].freeze

        def quit
          execute :quit
          http.close
        rescue *QUIT_ERRORS
        end

        def close
          execute :close
        end

        def refresh
          execute :refresh
        end

        #
        # window handling
        #

        def window_handles
          execute :getWindowHandles
        end

        def window_handle
          execute :getCurrentWindowHandle
        end

        def resize_window(width, height, handle = :current)
          execute :setWindowSize, {window_handle: handle},
                  {width: width,
                   height: height}
        end

        def maximize_window(handle = :current)
          execute :maximizeWindow, window_handle: handle
        end

        def window_size(handle = :current)
          data = execute :getWindowSize, window_handle: handle

          Dimension.new data['width'], data['height']
        end

        def reposition_window(x, y, handle = :current)
          execute :setWindowPosition, {window_handle: handle},
                  {x: x, y: y}
        end

        def window_position(handle = :current)
          data = execute :getWindowPosition, window_handle: handle

          Point.new data['x'], data['y']
        end

        def screenshot
          execute :screenshot
        end

        #
        # HTML 5
        #

        def local_storage_item(key, value = nil)
          if value
            execute :setLocalStorageItem, {}, {key: key, value: value}
          else
            execute :getLocalStorageItem, key: key
          end
        end

        def remove_local_storage_item(key)
          execute :removeLocalStorageItem, key: key
        end

        def local_storage_keys
          execute :getLocalStorageKeys
        end

        def clear_local_storage
          execute :clearLocalStorage
        end

        def local_storage_size
          execute :getLocalStorageSize
        end

        def session_storage_item(key, value = nil)
          if value
            execute :setSessionStorageItem, {}, {key: key, value: value}
          else
            execute :getSessionStorageItem, key: key
          end
        end

        def remove_session_storage_item(key)
          execute :removeSessionStorageItem, key: key
        end

        def session_storage_keys
          execute :getSessionStorageKeys
        end

        def clear_session_storage
          execute :clearSessionStorage
        end

        def session_storage_size
          execute :getSessionStorageSize
        end

        def location
          obj = execute(:getLocation) || {}
          Location.new obj['latitude'], obj['longitude'], obj['altitude']
        end

        def set_location(lat, lon, alt)
          loc = {latitude: lat, longitude: lon, altitude: alt}
          execute :setLocation, {}, {location: loc}
        end

        def network_connection
          execute :getNetworkConnection
        end

        def network_connection=(type)
          execute :setNetworkConnection, {}, {parameters: {type: type}}
        end

        #
        # javascript execution
        #

        def execute_script(script, *args)
          assert_javascript_enabled

          result = execute :executeScript, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def execute_async_script(script, *args)
          assert_javascript_enabled

          result = execute :executeAsyncScript, {}, {script: script, args: args}
          unwrap_script_result result
        end

        #
        # cookies
        #

        def add_cookie(cookie)
          execute :addCookie, {}, {cookie: cookie}
        end

        def delete_cookie(name)
          execute :deleteCookie, name: name
        end

        def cookies
          execute :getCookies
        end

        def delete_all_cookies
          execute :deleteAllCookies
        end

        #
        # actions
        #

        def click_element(element)
          execute :clickElement, id: element
        end

        def click
          execute :click, {}, {button: 0}
        end

        def double_click
          execute :doubleClick
        end

        def context_click
          execute :click, {}, {button: 2}
        end

        def mouse_down
          execute :mouseDown
        end

        def mouse_up
          execute :mouseUp
        end

        def mouse_move_to(element, x = nil, y = nil)
          params = {element: element}

          if x && y
            params[:xoffset] = x
            params[:yoffset] = y
          end

          execute :mouseMoveTo, {}, params
        end

        def send_keys_to_active_element(key)
          execute :sendKeysToActiveElement, {}, {value: key}
        end

        def send_keys_to_element(element, keys)
          if @file_detector
            local_file = @file_detector.call(keys)
            keys = upload(local_file) if local_file
          end

          execute :sendKeysToElement, {id: element}, {value: Array(keys)}
        end

        def upload(local_file)
          unless File.file?(local_file)
            raise Error::WebDriverError, "you may only upload files: #{local_file.inspect}"
          end

          execute :uploadFile, {}, {file: Zipper.zip_file(local_file)}
        end

        def clear_element(element)
          execute :clearElement, id: element
        end

        def submit_element(element)
          execute :submitElement, id: element
        end

        def drag_element(element, right_by, down_by)
          execute :dragElement, {id: element}, {x: right_by, y: down_by}
        end

        def touch_single_tap(element)
          execute :touchSingleTap, {}, {element: element}
        end

        def touch_double_tap(element)
          execute :touchDoubleTap, {}, {element: element}
        end

        def touch_long_press(element)
          execute :touchLongPress, {}, {element: element}
        end

        def touch_down(x, y)
          execute :touchDown, {}, {x: x, y: y}
        end

        def touch_up(x, y)
          execute :touchUp, {}, {x: x, y: y}
        end

        def touch_move(x, y)
          execute :touchMove, {}, {x: x, y: y}
        end

        def touch_scroll(element, x, y)
          if element
            execute :touchScroll, {}, {element: element,
                                       xoffset: x,
                                       yoffset: y}
          else
            execute :touchScroll, {}, {xoffset: x, yoffset: y}
          end
        end

        def touch_flick(xspeed, yspeed)
          execute :touchFlick, {}, {xspeed: xspeed, yspeed: yspeed}
        end

        def touch_element_flick(element, right_by, down_by, speed)
          execute :touchFlick, {}, {element: element,
                                    xoffset: right_by,
                                    yoffset: down_by,
                                    speed: speed}
        end

        def screen_orientation=(orientation)
          execute :setScreenOrientation, {}, {orientation: orientation}
        end

        def screen_orientation
          execute :getScreenOrientation
        end

        #
        # logs
        #

        def available_log_types
          types = execute :getAvailableLogTypes
          Array(types).map(&:to_sym)
        end

        def log(type)
          data = execute :getLog, {}, {type: type.to_s}

          Array(data).map do |l|
            begin
              LogEntry.new l.fetch('level', 'UNKNOWN'), l.fetch('timestamp'), l.fetch('message')
            rescue KeyError
              next
            end
          end
        end

        #
        # element properties
        #

        def element_tag_name(element)
          execute :getElementTagName, id: element
        end

        def element_attribute(element, name)
          execute :getElementAttribute, id: element, name: name
        end

        def element_value(element)
          execute :getElementValue, id: element
        end

        def element_text(element)
          execute :getElementText, id: element
        end

        def element_location(element)
          data = execute :getElementLocation, id: element

          Point.new data['x'], data['y']
        end

        def element_location_once_scrolled_into_view(element)
          data = execute :getElementLocationOnceScrolledIntoView, id: element

          Point.new data['x'], data['y']
        end

        def element_size(element)
          data = execute :getElementSize, id: element

          Dimension.new data['width'], data['height']
        end

        def element_enabled?(element)
          execute :isElementEnabled, id: element
        end

        def element_selected?(element)
          execute :isElementSelected, id: element
        end

        def element_displayed?(element)
          execute :isElementDisplayed, id: element
        end

        def element_value_of_css_property(element, prop)
          execute :getElementValueOfCssProperty, id: element, property_name: prop
        end

        #
        # finding elements
        #

        def active_element
          Element.new self, element_id_from(execute(:getActiveElement))
        end

        alias_method :switch_to_active_element, :active_element

        def find_element_by(how, what, parent = nil)
          id = if parent
                 execute :findChildElement, {id: parent}, {using: how, value: what}
               else
                 execute :findElement, {}, {using: how, value: what}
               end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          ids = if parent
                  execute :findChildElements, {id: parent}, {using: how, value: what}
                else
                  execute :findElements, {}, {using: how, value: what}
                end

          ids.map { |id| Element.new self, element_id_from(id) }
        end

        private

        def assert_javascript_enabled
          return if capabilities.javascript_enabled?
          raise Error::UnsupportedOperationError, 'underlying webdriver instance does not support javascript'
        end

        #
        # executes a command on the remote server.
        #
        #
        # Returns the 'value' of the returned payload
        #

        def execute(*args)
          raw_execute(*args)['value']
        end

        #
        # executes a command on the remote server.
        #
        # @return [WebDriver::Remote::Response]
        #

        def raw_execute(command, opts = {}, command_hash = nil)
          verb, path = COMMANDS[command] || raise(ArgumentError, "unknown command: #{command.inspect}")
          path = path.dup

          path[':session_id'] = @session_id if path.include?(':session_id')

          begin
            opts.each { |key, value| path[key.inspect] = escaper.escape(value.to_s) }
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
