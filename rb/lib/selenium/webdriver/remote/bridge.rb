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
    module Remote
      class Bridge
        include Atoms

        PORT = 4444

        attr_accessor :http, :file_detector
        attr_reader :capabilities

        #
        # Initializes the bridge with the given server URL
        # @param [String, URI] url url for the remote server
        # @param [Object] http_client an HTTP client instance that implements the same protocol as Http::Default
        # @api private
        #

        def initialize(url:, http_client: nil)
          uri = url.is_a?(URI) ? url : URI.parse(url)
          uri.path += '/' unless uri.path.end_with?('/')

          @http = http_client || Http::Default.new
          @http.server_url = uri
          @file_detector = nil
        end

        #
        # Creates session.
        #

        def create_session(capabilities)
          response = execute(:new_session, {}, prepare_capabilities_payload(capabilities))

          @session_id = response['sessionId']
          capabilities = response['capabilities']

          raise Error::WebDriverError, 'no sessionId in returned payload' unless @session_id

          @capabilities = Capabilities.json_create(capabilities)

          case @capabilities[:browser_name]
          when 'chrome'
            extend(WebDriver::Chrome::Features)
          when 'firefox'
            extend(WebDriver::Firefox::Features)
          when 'msedge'
            extend(WebDriver::Edge::Features)
          when 'Safari', 'Safari Technology Preview'
            extend(WebDriver::Safari::Features)
          end
        end

        #
        # Returns the current session ID.
        #

        def session_id
          @session_id || raise(Error::WebDriverError, 'no current session exists')
        end

        def browser
          @browser ||= begin
            name = @capabilities.browser_name
            name ? name.tr(' ', '_').downcase.to_sym : 'unknown'
          end
        end

        def status
          execute :status
        end

        def get(url)
          execute :get, {}, {url: url}
        end

        #
        # timeouts
        #

        def timeouts
          execute :get_timeouts, {}
        end

        def timeouts=(timeouts)
          execute :set_timeout, {}, timeouts
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
          execute :send_alert_text, {}, {value: keys.chars, text: keys}
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
          execute :get_page_source
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
          nil
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
          unless handle == :current
            raise Error::UnsupportedOperationError,
                  'Switch to desired window before getting its size'
          end

          data = execute :get_window_rect
          Dimension.new data['width'], data['height']
        end

        def minimize_window
          execute :minimize_window
        end

        def maximize_window(handle = :current)
          unless handle == :current
            raise Error::UnsupportedOperationError,
                  'Switch to desired window before changing its size'
          end

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

        def element_screenshot(element)
          execute :take_element_screenshot, id: element
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
          @manage ||= WebDriver::Manager.new(self)
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

        def action(async: false, devices: [], duration: 250)
          ActionBuilder.new self, async: async, devices: devices, duration: duration
        end
        alias actions action

        def send_actions(data)
          execute :actions, {}, {actions: data}
        end

        def release_actions
          execute :release_actions
        end

        def print_page(options = {})
          execute :print_page, {}, {options: options}
        end

        def click_element(element)
          execute :element_click, id: element
        end

        def send_keys_to_element(element, keys)
          # TODO: rework file detectors before Selenium 4.0
          if @file_detector
            local_files = keys.first&.split("\n")&.map { |key| @file_detector.call(Array(key)) }&.compact
            if local_files&.any?
              keys = local_files.map { |local_file| upload(local_file) }
              keys = Array(keys.join("\n"))
            end
          end

          # Keep .split(//) for backward compatibility for now
          text = keys.join
          execute :element_send_keys, {id: element}, {value: text.chars, text: text}
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
          script = "/* submitForm */ var form = arguments[0];\n" \
                   "while (form.nodeName != \"FORM\" && form.parentNode) {\n  " \
                   "form = form.parentNode;\n" \
                   "}\n" \
                   "if (!form) { throw Error('Unable to find containing form element'); }\n" \
                   "if (!form.ownerDocument) { throw Error('Unable to find owning document'); }\n" \
                   "var e = form.ownerDocument.createEvent('Event');\n" \
                   "e.initEvent('submit', true, true);\n" \
                   "if (form.dispatchEvent(e)) { HTMLFormElement.prototype.submit.call(form) }\n"

          execute_script(script, Element::ELEMENT_KEY => element)
        rescue Error::JavascriptError
          raise Error::UnsupportedOperationError, 'To submit an element, it must be nested inside a form element'
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

        def element_dom_attribute(element, name)
          execute :get_element_attribute, id: element, name: name
        end

        def element_property(element, name)
          execute :get_element_property, id: element, name: name
        end

        def element_aria_role(element)
          execute :get_element_aria_role, id: element
        end

        def element_aria_label(element)
          execute :get_element_aria_label, id: element
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

        alias switch_to_active_element active_element

        def find_element_by(how, what, parent_ref = [])
          how, what = convert_locator(how, what)

          return execute_atom(:findElements, Support::RelativeLocator.new(what).as_json).first if how == 'relative'

          parent_type, parent_id = parent_ref
          id = case parent_type
               when :element
                 execute :find_child_element, {id: parent_id}, {using: how, value: what.to_s}
               when :shadow_root
                 execute :find_shadow_child_element, {id: parent_id}, {using: how, value: what.to_s}
               else
                 execute :find_element, {}, {using: how, value: what.to_s}
               end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent_ref = [])
          how, what = convert_locator(how, what)

          return execute_atom :findElements, Support::RelativeLocator.new(what).as_json if how == 'relative'

          parent_type, parent_id = parent_ref
          ids = case parent_type
                when :element
                  execute :find_child_elements, {id: parent_id}, {using: how, value: what.to_s}
                when :shadow_root
                  execute :find_shadow_child_elements, {id: parent_id}, {using: how, value: what.to_s}
                else
                  execute :find_elements, {}, {using: how, value: what.to_s}
                end

          ids.map { |id| Element.new self, element_id_from(id) }
        end

        def shadow_root(element)
          id = execute :get_element_shadow_root, id: element
          ShadowRoot.new self, shadow_root_id_from(id)
        end

        #
        # virtual-authenticator
        #

        def add_virtual_authenticator(options)
          authenticator_id = execute :add_virtual_authenticator, {}, options.as_json
          VirtualAuthenticator.new(self, authenticator_id, options)
        end

        def remove_virtual_authenticator(id)
          execute :remove_virtual_authenticator, {authenticatorId: id}
        end

        def add_credential(credential, id)
          execute :add_credential, {authenticatorId: id}, credential
        end

        def credentials(authenticator_id)
          execute :get_credentials, {authenticatorId: authenticator_id}
        end

        def remove_credential(credential_id, authenticator_id)
          execute :remove_credential, {credentialId: credential_id, authenticatorId: authenticator_id}
        end

        def remove_all_credentials(authenticator_id)
          execute :remove_all_credentials, {authenticatorId: authenticator_id}
        end

        def user_verified(verified, authenticator_id)
          execute :set_user_verified, {authenticatorId: authenticator_id}, {isUserVerified: verified}
        end

        private

        #
        # executes a command on the remote server.
        #
        # @return [WebDriver::Remote::Response]
        #

        def execute(command, opts = {}, command_hash = nil)
          verb, path = commands(command) || raise(ArgumentError, "unknown command: #{command.inspect}")
          path = path.dup

          path[':session_id'] = session_id if path.include?(':session_id')

          begin
            opts.each { |key, value| path[key.inspect] = escaper.escape(value.to_s) }
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          WebDriver.logger.info("-> #{verb.to_s.upcase} #{path}")
          http.call(verb, path, command_hash)['value']
        end

        def escaper
          @escaper ||= defined?(URI::Parser) ? URI::DEFAULT_PARSER : URI
        end

        def commands(command)
          COMMANDS[command]
        end

        def unwrap_script_result(arg)
          case arg
          when Array
            arg.map { |e| unwrap_script_result(e) }
          when Hash
            element_id = element_id_from(arg)
            return Element.new(self, element_id) if element_id

            shadow_root_id = shadow_root_id_from(arg)
            return ShadowRoot.new self, shadow_root_id if shadow_root_id

            arg.each { |k, v| arg[k] = unwrap_script_result(v) }
          else
            arg
          end
        end

        def element_id_from(id)
          id['ELEMENT'] || id[Element::ELEMENT_KEY]
        end

        def shadow_root_id_from(id)
          id[ShadowRoot::ROOT_KEY]
        end

        def prepare_capabilities_payload(capabilities)
          capabilities = {alwaysMatch: capabilities} if !capabilities['alwaysMatch'] && !capabilities['firstMatch']
          {capabilities: capabilities}
        end

        def convert_locator(how, what)
          how = SearchContext::FINDERS[how.to_sym] || how

          case how
          when 'class name'
            how = 'css selector'
            what = ".#{escape_css(what.to_s)}"
          when 'id'
            how = 'css selector'
            what = "##{escape_css(what.to_s)}"
          when 'name'
            how = 'css selector'
            what = "*[name='#{escape_css(what.to_s)}']"
          end

          if what.is_a?(Hash)
            what = what.each_with_object({}) do |(h, w), hash|
              h, w = convert_locator(h.to_s, w)
              hash[h] = w
            end
          end

          [how, what]
        end

        ESCAPE_CSS_REGEXP = /(['"\\#.:;,!?+<>=~*^$|%&@`{}\-\[\]()])/.freeze
        UNICODE_CODE_POINT = 30

        # Escapes invalid characters in CSS selector.
        # @see https://mathiasbynens.be/notes/css-escapes
        def escape_css(string)
          string = string.gsub(ESCAPE_CSS_REGEXP) { |match| "\\#{match}" }
          string = "\\#{UNICODE_CODE_POINT + Integer(string[0])} #{string[1..]}" if string[0]&.match?(/[[:digit:]]/)

          string
        end
      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
