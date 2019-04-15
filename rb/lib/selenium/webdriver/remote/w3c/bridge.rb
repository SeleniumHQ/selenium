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

require 'json'

module Selenium
  module WebDriver
    module Remote
      module W3C

        #
        # Low level bridge to the remote server implementing JSON wire
        # protocol (W3C dialect), through which the rest of the API works.
        # @api private
        #

        class Bridge < Remote::Bridge

          def initialize(capabilities, session_id, **opts)
            @capabilities = capabilities
            @session_id = session_id
            super(opts)
          end

          def dialect
            :w3c
          end

          def commands(command)
            case command
            when :status
              Remote::OSS::Bridge::COMMANDS[command]
            else
              COMMANDS[command]
            end
          end

          def status
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
            type = 'pageLoad' if type == 'page load'
            execute :set_timeout, {}, {type => milliseconds}
          end

          #
          # alerts
          #

          def accept_alert
            execute :accept_alert
          end

          def dismiss_alert
            execute :dismiss_alert
          end

          def alert=(keys)
            execute :send_alert_text, {}, {value: keys.split(//), text: keys}
          end

          def alert_text
            execute :get_alert_text
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
            execute :get_current_url
          end

          def title
            execute :get_title
          end

          def page_source
            execute_script('var source = document.documentElement.outerHTML;' \
                              'if (!source) { source = new XMLSerializer().serializeToString(document); }' \
                              'return source;')
          end

          #
          # Create a new top-level browsing context
          # https://w3c.github.io/webdriver/#new-window
          # @param type [String] Supports two values: 'tab' and 'window'.
          #  Use 'tab' if you'd like the new window to share an OS-level window
          #  with the current browsing context.
          #  Use 'window' otherwise
          # @return [Hash] Containing 'handle' with the value of the window handle
          #  and 'type' with the value of the created window type
          #
          def new_window(type)
            execute :new_window, {}, {type: type}
          end

          def switch_to_window(name)
            execute :switch_to_window, {}, {handle: name}
          end

          def switch_to_frame(id)
            id = find_element_by('id', id) if id.is_a? String
            execute :switch_to_frame, {}, {id: id}
          end

          def switch_to_parent_frame
            execute :switch_to_parent_frame
          end

          def switch_to_default_content
            switch_to_frame nil
          end

          QUIT_ERRORS = [IOError].freeze

          def quit
            execute :delete_session
            http.close
          rescue *QUIT_ERRORS
          end

          def close
            execute :close_window
          end

          def refresh
            execute :refresh
          end

          #
          # window handling
          #

          def window_handles
            execute :get_window_handles
          end

          def window_handle
            execute :get_window_handle
          end

          def resize_window(width, height, handle = :current)
            raise Error::WebDriverError, 'Switch to desired window before changing its size' unless handle == :current

            set_window_rect(width: width, height: height)
          end

          def window_size(handle = :current)
            raise Error::UnsupportedOperationError, 'Switch to desired window before getting its size' unless handle == :current

            data = execute :get_window_rect

            Dimension.new data['width'], data['height']
          end

          def minimize_window
            execute :minimize_window
          end

          def maximize_window(handle = :current)
            raise Error::UnsupportedOperationError, 'Switch to desired window before changing its size' unless handle == :current

            execute :maximize_window
          end

          def full_screen_window
            execute :fullscreen_window
          end

          def reposition_window(x, y)
            set_window_rect(x: x, y: y)
          end

          def window_position
            data = execute :get_window_rect
            Point.new data['x'], data['y']
          end

          def set_window_rect(x: nil, y: nil, width: nil, height: nil)
            params = {x: x, y: y, width: width, height: height}
            params.update(params) { |_k, v| Integer(v) unless v.nil? }
            execute :set_window_rect, {}, params
          end

          def window_rect
            data = execute :get_window_rect
            Rectangle.new data['x'], data['y'], data['width'], data['height']
          end

          def screenshot
            execute :take_screenshot
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
            result = execute :execute_script, {}, {script: script, args: args}
            unwrap_script_result result
          end

          def execute_async_script(script, *args)
            result = execute :execute_async_script, {}, {script: script, args: args}
            unwrap_script_result result
          end

          #
          # cookies
          #

          def manage
            @manage ||= WebDriver::W3CManager.new(self)
          end

          def add_cookie(cookie)
            execute :add_cookie, {}, {cookie: cookie}
          end

          def delete_cookie(name)
            execute :delete_cookie, name: name
          end

          def cookie(name)
            execute :get_cookie, name: name
          end

          def cookies
            execute :get_all_cookies
          end

          def delete_all_cookies
            execute :delete_all_cookies
          end

          #
          # actions
          #

          def action(async = false)
            W3CActionBuilder.new self,
                                 Interactions.pointer(:mouse, name: 'mouse'),
                                 Interactions.key('keyboard'),
                                 async
          end
          alias_method :actions, :action

          def mouse
            raise Error::UnsupportedOperationError, '#mouse is no longer supported, use #action instead'
          end

          def keyboard
            raise Error::UnsupportedOperationError, '#keyboard is no longer supported, use #action instead'
          end

          def send_actions(data)
            execute :actions, {}, {actions: data}
          end

          def release_actions
            execute :release_actions
          end

          def click_element(element)
            execute :element_click, id: element
          end

          def send_keys_to_element(element, keys)
            # TODO: rework file detectors before Selenium 4.0
            if @file_detector
              local_files = keys.first.split("\n").map { |key| @file_detector.call(Array(key)) }.compact
              if local_files.any?
                keys = local_files.map { |local_file| upload(local_file) }
                keys = Array(keys.join("\n"))
              end
            end

            # Keep .split(//) for backward compatibility for now
            text = keys.join('')
            execute :element_send_keys, {id: element}, {value: text.split(//), text: text}
          end

          def upload(local_file)
            unless File.file?(local_file)
              WebDriver.logger.debug("File detector only works with files. #{local_file.inspect} isn`t a file!")
              raise Error::WebDriverError, "You are trying to work with something that isn't a file."
            end

            execute :upload_file, {}, {file: Zipper.zip_file(local_file)}
          end

          def clear_element(element)
            execute :element_clear, id: element
          end

          def submit_element(element)
            form = find_element_by('xpath', "./ancestor-or-self::form", element)
            execute_script("var e = arguments[0].ownerDocument.createEvent('Event');" \
                              "e.initEvent('submit', true, true);" \
                              'if (arguments[0].dispatchEvent(e)) { arguments[0].submit() }', form.as_json)
          end

          def drag_element(element, right_by, down_by)
            execute :drag_element, {id: element}, {x: right_by, y: down_by}
          end

          def touch_single_tap(element)
            execute :touch_single_tap, {}, {element: element}
          end

          def touch_double_tap(element)
            execute :touch_double_tap, {}, {element: element}
          end

          def touch_long_press(element)
            execute :touch_long_press, {}, {element: element}
          end

          def touch_down(x, y)
            execute :touch_down, {}, {x: x, y: y}
          end

          def touch_up(x, y)
            execute :touch_up, {}, {x: x, y: y}
          end

          def touch_move(x, y)
            execute :touch_move, {}, {x: x, y: y}
          end

          def touch_scroll(element, x, y)
            if element
              execute :touch_scroll, {}, {element: element,
                                          xoffset: x,
                                          yoffset: y}
            else
              execute :touch_scroll, {}, {xoffset: x, yoffset: y}
            end
          end

          def touch_flick(xspeed, yspeed)
            execute :touch_flick, {}, {xspeed: xspeed, yspeed: yspeed}
          end

          def touch_element_flick(element, right_by, down_by, speed)
            execute :touch_flick, {}, {element: element,
                                       xoffset: right_by,
                                       yoffset: down_by,
                                       speed: speed}
          end

          def screen_orientation=(orientation)
            execute :set_screen_orientation, {}, {orientation: orientation}
          end

          def screen_orientation
            execute :get_screen_orientation
          end

          #
          # element properties
          #

          def element_tag_name(element)
            execute :get_element_tag_name, id: element
          end

          def element_attribute(element, name)
            WebDriver.logger.info "Using script for :getAttribute of #{name}"
            execute_atom :getAttribute, element, name
          end

          def element_property(element, name)
            execute :get_element_property, id: element.ref, name: name
          end

          def element_value(element)
            element_property element, 'value'
          end

          def element_text(element)
            execute :get_element_text, id: element
          end

          def element_location(element)
            data = execute :get_element_rect, id: element

            Point.new data['x'], data['y']
          end

          def element_rect(element)
            data = execute :get_element_rect, id: element

            Rectangle.new data['x'], data['y'], data['width'], data['height']
          end

          def element_location_once_scrolled_into_view(element)
            send_keys_to_element(element, [''])
            element_location(element)
          end

          def element_size(element)
            data = execute :get_element_rect, id: element

            Dimension.new data['width'], data['height']
          end

          def element_enabled?(element)
            execute :is_element_enabled, id: element
          end

          def element_selected?(element)
            execute :is_element_selected, id: element
          end

          def element_displayed?(element)
            WebDriver.logger.info 'Using script for :isDisplayed'
            execute_atom :isDisplayed, element
          end

          def element_value_of_css_property(element, prop)
            execute :get_element_css_value, id: element, property_name: prop
          end

          #
          # finding elements
          #

          def active_element
            Element.new self, element_id_from(execute(:get_active_element))
          end

          alias_method :switch_to_active_element, :active_element

          def find_element_by(how, what, parent = nil)
            how, what = convert_locators(how, what)

            id = if parent
                   execute :find_child_element, {id: parent}, {using: how, value: what}
                 else
                   execute :find_element, {}, {using: how, value: what}
                 end
            Element.new self, element_id_from(id)
          end

          def find_elements_by(how, what, parent = nil)
            how, what = convert_locators(how, what)

            ids = if parent
                    execute :find_child_elements, {id: parent}, {using: how, value: what}
                  else
                    execute :find_elements, {}, {using: how, value: what}
                  end

            ids.map { |id| Element.new self, element_id_from(id) }
          end

          private

          def execute(*)
            super['value']
          end

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

          ESCAPE_CSS_REGEXP = /(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\[\]\(\)])/.freeze
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

        end # Bridge
      end # W3C
    end # Remote
  end # WebDriver
end # Selenium
