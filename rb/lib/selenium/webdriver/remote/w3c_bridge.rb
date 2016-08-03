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

require 'json'

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

        # TODO: constant shouldn't be modified in class
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
          edge_check(opts)

          opts = opts.dup

          http_client = opts.delete(:http_client) { Http::Default.new }
          desired_capabilities = opts.delete(:desired_capabilities) { W3CCapabilities.firefox }
          url = opts.delete(:url) { "http://#{Platform.localhost}:4444/wd/hub" }

          desired_capabilities = W3CCapabilities.send(desired_capabilities) if desired_capabilities.is_a? Symbol

          desired_capabilities[:marionette] = opts.delete(:marionette) unless opts[:marionette].nil?

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
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

        def edge_check(opts)
          caps = opts[:desired_capabilities]
          return unless caps && caps[:browser_name] && caps[:browser_name] == 'MicrosoftEdge'
          require_relative '../edge/legacy_support'
          extend Edge::LegacySupport
        end

        def driver_extensions
          [
            DriverExtensions::HasInputDevices,
            DriverExtensions::UploadsFiles,
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasSessionId,
            DriverExtensions::Rotatable,
            DriverExtensions::HasTouchScreen,
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
          # TODO - Remove this when Mozilla fixes bug
          desired_capabilities[:browser_name] = 'firefox' if desired_capabilities[:browser_name] == 'Firefox'

          resp = raw_execute :newSession, {}, {desiredCapabilities: desired_capabilities}
          @session_id = resp['sessionId']
          return W3CCapabilities.json_create resp['value'] if @session_id

          raise Error::WebDriverError, 'no sessionId in returned payload'
        end

        def status
          jwp = Selenium::WebDriver::Remote::Bridge::COMMANDS[:status]
          self.class.command(:status, jwp.first, jwp.last)
          execute :status
        end

        def get(url)
          execute :get, {}, {url: url}
        end

        def implicit_wait_timeout=(milliseconds)
          timeout('implicit', milliseconds)
        end

        def script_timeout=(milliseconds)
          timeout('script', milliseconds)
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
          execute :sendAlertText, {}, {handler: 'prompt', text: keys}
        end

        def alert_text
          execute :getAlertText
        end

        #
        # navigation
        #

        def go_back
          execute :back
        end

        def go_forward
          execute :forward
        end

        def url
          execute :getCurrentUrl
        end

        def title
          execute :getTitle
        end

        def page_source
          execute_script('var source = document.documentElement.outerHTML;' \
                            'if (!source) { source = new XMLSerializer().serializeToString(document); }' \
                            'return source;')
        end

        def switch_to_window(name)
          execute :switchToWindow, {}, {handle: name}
        end

        def switch_to_frame(id)
          id = find_element_by('id', id) if id.is_a? String
          execute :switchToFrame, {}, {id: id}
        end

        def switch_to_parent_frame
          execute :switchToParentFrame
        end

        def switch_to_default_content
          switch_to_frame nil
        end

        QUIT_ERRORS = [IOError].freeze

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

        def window_handles
          execute :getWindowHandles
        end

        def window_handle
          execute :getWindowHandle
        end

        def resize_window(width, height, handle = :current)
          unless handle == :current
            raise Error::WebDriverError, 'Switch to desired window before changing its size'
          end
          execute :setWindowSize, {}, {width: width,
                                       height: height}
        end

        def maximize_window(handle = :current)
          unless handle == :current
            raise Error::UnsupportedOperationError, 'Switch to desired window before changing its size'
          end
          execute :maximizeWindow
        end

        def full_screen_window
          execute :fullscreenWindow
        end

        def window_size(handle = :current)
          unless handle == :current
            raise Error::UnsupportedOperationError, 'Switch to desired window before getting its size'
          end
          data = execute :getWindowSize

          Dimension.new data['width'], data['height']
        end

        def reposition_window(_x, _y, _handle = nil)
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support setting the Window Position'
        end

        def window_position(_handle = nil)
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support getting the Window Position'
        end

        def screenshot
          execute :takeScreenshot
        end

        #
        # HTML 5
        #

        def local_storage_item(key, value = nil)
          if value
            execute_script("localStorage.setItem('#{key}', '#{value}')")
          else
            execute_script("return localStorage.getItem('#{key}')")
          end
        end

        def remove_local_storage_item(key)
          execute_script("localStorage.removeItem('#{key}')")
        end

        def local_storage_keys
          execute_script('return Object.keys(localStorage)')
        end

        def clear_local_storage
          execute_script('localStorage.clear()')
        end

        def local_storage_size
          execute_script('return localStorage.length')
        end

        def session_storage_item(key, value = nil)
          if value
            execute_script("sessionStorage.setItem('#{key}', '#{value}')")
          else
            execute_script("return sessionStorage.getItem('#{key}')")
          end
        end

        def remove_session_storage_item(key)
          execute_script("sessionStorage.removeItem('#{key}')")
        end

        def session_storage_keys
          execute_script('return Object.keys(sessionStorage)')
        end

        def clear_session_storage
          execute_script('sessionStorage.clear()')
        end

        def session_storage_size
          execute_script('return sessionStorage.length')
        end

        def location
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support getting location'
        end

        def set_location(_lat, _lon, _alt)
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support setting location'
        end

        def network_connection
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support getting network connection'
        end

        def network_connection=(_type)
          raise Error::UnsupportedOperationError, 'The W3C standard does not currently support setting network connection'
        end

        #
        # javascript execution
        #

        def execute_script(script, *args)
          result = execute :executeScript, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def execute_async_script(script, *args)
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

        # TODO: - write specs
        def cookie(name)
          execute :getCookie, name: name
        end

        def cookies
          execute :getAllCookies
        end

        def delete_all_cookies
          cookies.each { |cookie| delete_cookie(cookie['name']) }
        end

        #
        # actions
        #

        def click_element(element)
          execute :elementClick, id: element.values.first
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

        def send_keys_to_active_element(keys)
          send_keys_to_element(active_element, keys)
        end

        # TODO: - Implement file verification
        def send_keys_to_element(element, keys)
          execute :elementSendKeys, {id: element.values.first}, {value: keys.join('').split(//)}
        end

        def clear_element(element)
          execute :elementClear, id: element.values.first
        end

        def submit_element(element)
          form = find_element_by('xpath', "./ancestor-or-self::form", element)
          execute_script("var e = arguments[0].ownerDocument.createEvent('Event');" \
                            "e.initEvent('submit', true, true);" \
                            'if (arguments[0].dispatchEvent(e)) { arguments[0].submit() }', form.as_json)
        end

        def drag_element(element, right_by, down_by)
          execute :dragElement, {id: element.values.first}, {x: right_by, y: down_by}
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
        # element properties
        #

        def element_tag_name(element)
          execute :getElementTagName, id: element.values.first
        end

        def element_attribute(element, name)
          execute :getElementAttribute, id: element.values.first, name: name
        end

        def element_value(element)
          execute :getElementProperty, id: element.values.first, name: 'value'
        end

        def element_text(element)
          execute :getElementText, id: element.values.first
        end

        def element_location(element)
          data = execute :getElementRect, id: element.values.first

          Point.new data['x'], data['y']
        end

        def element_location_once_scrolled_into_view(element)
          send_keys_to_element(element, [''])
          element_location(element)
        end

        def element_size(element)
          data = execute :getElementRect, id: element.values.first

          Dimension.new data['width'], data['height']
        end

        def element_enabled?(element)
          execute :isElementEnabled, id: element.values.first
        end

        def element_selected?(element)
          execute :isElementSelected, id: element.values.first
        end

        def element_displayed?(element)
          jwp = Selenium::WebDriver::Remote::Bridge::COMMANDS[:isElementDisplayed]
          self.class.command(:isElementDisplayed, jwp.first, jwp.last)
          execute :isElementDisplayed, id: element.values.first
        end

        def element_value_of_css_property(element, prop)
          execute :getElementCssValue, id: element.values.first, property_name: prop
        end

        #
        # finding elements
        #

        def active_element
          Element.new self, execute(:getActiveElement)
        end

        alias_method :switch_to_active_element, :active_element

        def find_element_by(how, what, parent = nil)
          how, what = convert_locators(how, what)

          id = if parent
                 execute :findChildElement, {id: parent.values.first}, {using: how, value: what}
               else
                 execute :findElement, {}, {using: how, value: what}
               end
          Element.new self, id
        end

        def find_elements_by(how, what, parent = nil)
          how, what = convert_locators(how, what)

          ids = if parent
                  execute :findChildElements, {id: parent.values.first}, {using: how, value: what}
                else
                  execute :findElements, {}, {using: how, value: what}
                end

          ids.map { |id| Element.new self, id }
        end

        private

        def convert_locators(how, what)
          case how
          when 'class name'
            how = 'css selector'
            what = ".#{escape_css(what)}"
          when 'id'
            how = 'css selector'
            what = "##{escape_css(what)}"
          when 'name'
            how = 'css selector'
            what = "*[name='#{escape_css(what)}']"
          when 'tag name'
            how = 'css selector'
          end
          [how, what]
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
          path = path.dup

          path[':session_id'] = @session_id if path.include?(':session_id')

          begin
            opts.each do |key, value|
              path[key.inspect] = escaper.escape(value.to_s)
            end
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          puts "-> #{verb.to_s.upcase} #{path}" if $DEBUG
          http.call verb, path, command_hash
        end

        def escaper
          @escaper ||= defined?(URI::Parser) ? URI::Parser.new : URI
        end

        ESCAPE_CSS_REGEXP = /(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\[\]\(\)])/
        UNICODE_CODE_POINT = 30

        # Escapes invalid characters in CSS selector.
        # @see https://mathiasbynens.be/notes/css-escapes
        def escape_css(string)
          string = string.gsub(ESCAPE_CSS_REGEXP) { |match| "\\#{match}" }
          if !string.empty? && string[0] =~ /[[:digit:]]/
            string = "\\#{UNICODE_CODE_POINT + Integer(string[0])} #{string[1..-1]}"
          end

          string
        end
      end # W3CBridge
    end # Remote
  end # WebDriver
end # Selenium
