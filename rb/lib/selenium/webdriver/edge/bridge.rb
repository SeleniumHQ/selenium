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
    module Edge
      #
      # @api private
      #

      class Bridge < Remote::W3CBridge
        def initialize(opts = {})
          port = opts.delete(:port) || Service::DEFAULT_PORT
          service_args = opts.delete(:service_args) || {}

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || Edge.driver_path(false)
            @service = Service.new(driver_path, port, *extract_service_args(service_args))
            @service.host = 'localhost' if @service.host == '127.0.0.1'
            @service.start
            opts[:url] = @service.uri
          end

          opts[:desired_capabilities] ||= Remote::W3CCapabilities.edge

          super(opts)
        end

        def browser
          :edge
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def commands(command)
          unsupported = %i[execute_script execute_async_script submit_element double_click
           mouse_down mouse_up mouse_move_to click
           send_keys_to_active_element get_window_handles get_current_window_handle
           get_window_size set_window_size get_window_position set_window_position
           maximize_window get_alert_text accept_alert dismiss_alert]
          if unsupported.include? command
            Remote::Bridge::COMMANDS[command]
          else
            super
          end

        end

        def capabilities
          @capabilities ||= Remote::Capabilities.edge
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        def execute_script(script, *args)
          result = execute :execute_script, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def execute_async_script(script, *args)
          result = execute :execute_async_script, {}, {script: script, args: args}
          unwrap_script_result result
        end

        def submit_element(element)
          execute :submit_element, id: element['ELEMENT']
        end

        def double_click
          execute :double_click
        end

        def click
          execute :click, {}, {button: 0}
        end

        def context_click
          execute :click, {}, {button: 2}
        end

        def mouse_down
          execute :mouse_down
        end

        def mouse_up
          execute :mouse_up
        end

        def mouse_move_to(element, x = nil, y = nil)
          element_id = element['ELEMENT'] if element
          params = {element: element_id}

          if x && y
            params[:xoffset] = x
            params[:yoffset] = y
          end

          execute :mouse_move_to, {}, params
        end

        def send_keys_to_active_element(key)
          execute :send_keys_to_active_element, {}, {value: key}
        end

        def window_handle
          execute :get_current_window_handle
        end

        def window_size(handle = :current)
          data = execute :get_window_size, window_handle: handle

          Dimension.new data['width'], data['height']
        end

        def resize_window(width, height, handle = :current)
          execute :set_window_size, {window_handle: handle},
                  {width: width,
                   height: height}
        end

        def window_position(handle = :current)
          data = execute :get_window_position, window_handle: handle

          Point.new data['x'], data['y']
        end

        def reposition_window(x, y, handle = :current)
          execute :set_window_position, {window_handle: handle},
                  {x: x, y: y}
        end

        def maximize_window(handle = :current)
          execute :maximize_window, window_handle: handle
        end

        private

        def extract_service_args(args = {})
          service_args = []
          service_args << "–host=#{args[:host]}" if args.key? :host
          service_args << "–package=#{args[:package]}" if args.key? :package
          service_args << "-verbose" if args[:verbose] == true
          service_args
        end
      end # Bridge
    end # Edge
  end # WebDriver
end # Selenium
