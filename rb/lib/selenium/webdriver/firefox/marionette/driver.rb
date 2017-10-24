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
    module Firefox
      module Marionette

        #
        # Driver implementation for Firefox using GeckoDriver.
        # @api private
        #

        class Driver < WebDriver::Driver
          include DriverExtensions::HasAddons
          include DriverExtensions::HasWebStorage
          include DriverExtensions::TakesScreenshot

          def initialize(opts = {})
            opts[:desired_capabilities] = create_capabilities(opts)

            unless opts.key?(:url)
              driver_path = opts.delete(:driver_path) || Firefox.driver_path
              port = opts.delete(:port) || Service::DEFAULT_PORT

              opts[:driver_opts] ||= {}
              if opts.key? :service_args
                WebDriver.logger.deprecate ':service_args', "driver_opts: {args: #{opts[:service_args]}}"
                opts[:driver_opts][:args] = opts.delete(:service_args)
              end

              @service = Service.new(driver_path, port, opts.delete(:driver_opts))
              @service.start
              opts[:url] = @service.uri
            end

            listener = opts.delete(:listener)
            WebDriver.logger.info 'Skipping handshake as we know it is W3C.'
            desired_capabilities = opts.delete(:desired_capabilities)
            bridge = Remote::Bridge.new(opts)
            capabilities = bridge.create_session(desired_capabilities)
            @bridge = Remote::W3C::Bridge.new(capabilities, bridge.session_id, opts)
            @bridge.extend Marionette::Bridge

            super(@bridge, listener: listener)
          end

          def browser
            :firefox
          end

          def quit
            super
          ensure
            @service.stop if @service
          end

          private

          def create_capabilities(opts)
            caps = opts.delete(:desired_capabilities) { Remote::W3C::Capabilities.firefox }
            options = opts.delete(:options) { Options.new }

            firefox_options = opts.delete(:firefox_options)
            if firefox_options
              WebDriver.logger.deprecate ':firefox_options', 'Selenium::WebDriver::Firefox::Options'
              firefox_options.each do |key, value|
                options.add_option(key, value)
              end
            end

            profile = opts.delete(:profile)
            if profile
              WebDriver.logger.deprecate ':profile', 'Selenium::WebDriver::Firefox::Options#profile='
              options.profile = profile
            end

            options = options.as_json
            caps.merge!(options) unless options.empty?

            caps
          end
        end # Driver
      end # Marionette
    end # Firefox
  end # WebDriver
end # Selenium
