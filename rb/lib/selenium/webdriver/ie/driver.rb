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
    module IE

      #
      # Driver implementation for Internet Explorer supporting
      # both OSS and W3C dialects of JSON wire protocol.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::HasWebStorage
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          opts[:desired_capabilities] = create_capabilities(opts)

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || IE.driver_path
            driver_opts = opts.delete(:driver_opts) || {}
            port = opts.delete(:port) || Service::DEFAULT_PORT

            @service = Service.new(driver_path, port, driver_opts)
            @service.start
            opts[:url] = @service.uri
          end

          listener = opts.delete(:listener)
          @bridge = Remote::Bridge.handshake(opts)
          super(@bridge, listener: listener)
        end

        def browser
          :internet_explorer
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def create_capabilities(opts)
          caps = opts.delete(:desired_capabilities) { Remote::Capabilities.internet_explorer }
          options = opts.delete(:options) { Options.new }

          if opts.delete(:introduce_flakiness_by_ignoring_security_domains)
            WebDriver.logger.deprecate ':introduce_flakiness_by_ignoring_security_domains',
                                       'Selenium::WebDriver::IE::Options#ignore_protected_mode_settings='
            options.ignore_protected_mode_settings = true
          end

          native_events = opts.delete(:native_events)
          unless native_events.nil?
            WebDriver.logger.deprecate ':native_events', 'Selenium::WebDriver::IE::Options#native_events='
            options.native_events = native_events
          end

          # Backward compatibility with older IEDriverServer versions
          caps[:ignore_protected_mode_settings] = options.ignore_protected_mode_settings
          caps[:native_events] = options.native_events

          options = options.as_json
          caps.merge!(options) unless options.empty?

          caps
        end

      end # Driver
    end # IE
  end # WebDriver
end # Selenium
