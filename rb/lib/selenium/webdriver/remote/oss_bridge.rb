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

      class OSSBridge < Bridge
        #
        # Initializes the bridge with the given server URL.
        #
        # @param url         [String] url for the remote server
        # @param http_client [Object] an HTTP client instance that implements the same protocol as Http::Default
        # @param desired_capabilities [Capabilities] an instance of Remote::Capabilities describing the capabilities you want
        #

        def initialize(opts = {})
          opts = opts.dup
          process_deprecations(opts)
          super(opts)
        end

        def driver_extensions
          super + [DriverExtensions::HasLocation, DriverExtensions::HasNetworkConnection]
        end

        def commands(command)
          COMMANDS[command]
        end

        def implicit_wait_timeout=(milliseconds)
          execute :implicitly_wait, {}, {ms: milliseconds}
        end

        def script_timeout=(milliseconds)
          execute :set_script_timeout, {}, {ms: milliseconds}
        end

        #
        # alerts
        #

        def alert=(keys)
          execute :set_alert_value, {}, {text: keys.to_s}
        end

        def authentication(credentials)
          execute :set_authentication, {}, credentials
        end

        #
        # navigation
        #

        def go_back
          execute :go_back
        end

        def go_forward
          execute :go_forward
        end

        def page_source
          execute :get_page_source
        end

        def switch_to_window(name)
          execute :switch_to_window, {}, {name: name}
        end

        def switch_to_frame(id)
          execute :switch_to_frame, {}, {id: id}
        end

        def quit
          execute :quit
          http.close
        rescue *http.quit_errors
        ensure
          @service.stop if @service
        end

        def close
          execute :close
        end

        #
        # window handling
        #

        def window_handle
          execute :get_current_window_handle
        end

        def resize_window(width, height, handle = :current)
          execute :set_window_size, {window_handle: handle},
                  {width: width,
                   height: height}
        end

        def maximize_window(handle = :current)
          execute :maximize_window, window_handle: handle
        end

        def window_size(handle = :current)
          data = execute :get_window_size, window_handle: handle

          Dimension.new data['width'], data['height']
        end

        def reposition_window(x, y, handle = :current)
          execute :set_window_position, {window_handle: handle}, {x: x, y: y}
        end

        def window_position(handle = :current)
          data = execute :get_window_position, window_handle: handle
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
            execute :set_local_storage_item, {}, {key: key, value: value}
          else
            execute :get_local_storage_item, key: key
          end
        end

        def remove_local_storage_item(key)
          execute :remove_local_storage_item, key: key
        end

        def local_storage_keys
          execute :get_local_storage_keys
        end

        def clear_local_storage
          execute :clear_local_storage
        end

        def local_storage_size
          execute :get_local_storage_size
        end

        def session_storage_item(key, value = nil)
          if value
            execute :set_session_storage_item, {}, {key: key, value: value}
          else
            execute :get_session_storage_item, key: key
          end
        end

        def remove_session_storage_item(key)
          execute :remove_session_storage_item, key: key
        end

        def session_storage_keys
          execute :get_session_storage_keys
        end

        def clear_session_storage
          execute :clear_session_storage
        end

        def session_storage_size
          execute :get_session_storage_size
        end

        def location
          obj = execute(:get_location) || {}
          Location.new obj['latitude'], obj['longitude'], obj['altitude']
        end

        def set_location(lat, lon, alt)
          loc = {latitude: lat, longitude: lon, altitude: alt}
          execute :set_location, {}, {location: loc}
        end

        def network_connection
          execute :get_network_connection
        end

        def network_connection=(type)
          execute :set_network_connection, {}, {parameters: {type: type}}
        end

        #
        # javascript execution
        #

        def execute_script(script, *args)
          assert_javascript_enabled
          super
        end

        def execute_async_script(script, *args)
          assert_javascript_enabled
          super
        end

        #
        # cookies
        #

        def options
          @options ||= WebDriver::Options.new(self)
        end

        def cookies
          execute :get_cookies
        end

        #
        # actions
        #

        def click_element(element)
          execute :click_element, id: element
        end

        def send_keys_to_active_element(key)
          execute :send_keys_to_active_element, {}, {value: key}
        end

        def send_keys_to_element(element, keys)
          if @file_detector
            local_file = @file_detector.call(keys)
            keys = upload(local_file) if local_file
          end

          execute :send_keys_to_element, {id: element}, {value: Array(keys)}
        end

        def upload(local_file)
          unless File.file?(local_file)
            raise Error::WebDriverError, "you may only upload files: #{local_file.inspect}"
          end

          execute :upload_file, {}, {file: Zipper.zip_file(local_file)}
        end

        def clear_element(element)
          execute :clear_element, id: element
        end

        def submit_element(element)
          execute :submit_element, id: element
        end

        #
        # logs
        #

        def available_log_types
          types = execute :get_available_log_types
          Array(types).map(&:to_sym)
        end

        def log(type)
          data = execute :get_log, {}, {type: type.to_s}

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

        def element_attribute(element, name)
          execute :get_element_attribute, id: element.ref, name: name
        end

        # Backwards compatibility for w3c
        def element_property(element, name)
          execute_script 'return arguments[0][arguments[1]]', element, name
        end

        def element_value(element)
          execute :get_element_value, id: element
        end

        def element_location(element)
          data = execute :get_element_location, id: element

          Point.new data['x'], data['y']
        end

        def element_location_once_scrolled_into_view(element)
          data = execute :get_element_location_once_scrolled_into_view, id: element

          Point.new data['x'], data['y']
        end

        def element_size(element)
          data = execute :get_element_size, id: element

          Dimension.new data['width'], data['height']
        end

        def element_value_of_css_property(element, prop)
          execute :get_element_value_of_css_property, id: element, property_name: prop
        end

        #
        # finding elements
        #

        def active_element
          Element.new self, element_id_from(execute(:get_active_element))
        end

        def find_element_by(how, what, parent = nil)
          id = if parent
                 execute :find_child_element, {id: parent}, {using: how, value: what}
               else
                 execute :find_element, {}, {using: how, value: what}
               end

          Element.new self, element_id_from(id)
        end

        def find_elements_by(how, what, parent = nil)
          ids = if parent
                  execute :find_child_elements, {id: parent}, {using: how, value: what}
                else
                  execute :find_elements, {}, {using: how, value: what}
                end

          ids.map { |id| Element.new self, element_id_from(id) }
        end

        protected

        def capabilities_class
          Capabilities
        end

        def default_capabilities
          capabilities_class.chrome
        end

        private

        def process_deprecations(opts)
          if bridge_module == Module.nesting[1] && opts.key?(:port)
            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
                    [DEPRECATION] Using `:port` directly is deprecated.  
                    Use `{url: "http://localhost:\#{port}/wd/hub"}`, instead.
            DEPRECATE
            opts[:url] ||= "http://localhost:#{opts.delete(:port)}/wd/hub"
          end

          [:proxy, 'proxy'].each do |method|
            next unless opts.key? method
            opts[:desired_capabilities] ||= default_capabilities

            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
              [DEPRECATION] Using `#{method}` directly is deprecated.  
              Use `desired_capabilities[#{method}] = value`, instead.
            DEPRECATE

            opts[:desired_capabilities][method] = opts.delete method
          end

          if opts.delete :required_capabilities
            warn '`required_capabilities` is not yet implemented'
          end
        end

        def bridge_module
          Module.nesting[1]
        end

        def process_service_args(service_args)
          service_args || []
        end

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
      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
