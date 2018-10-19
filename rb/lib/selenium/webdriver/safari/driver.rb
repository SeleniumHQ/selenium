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
    module Safari

      #
      # Driver implementation for Safari.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::HasDebugger
        include DriverExtensions::HasPermissions
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          opts[:desired_capabilities] = create_capabilities(opts)

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || Safari.driver_path
            driver_opts = opts.delete(:driver_opts) || {}
            port = opts.delete(:port) || Service::DEFAULT_PORT

            @service = Service.new(driver_path, port, driver_opts)
            @service.start
            opts[:url] = @service.uri
          end

          listener = opts.delete(:listener)
          @bridge = Remote::Bridge.handshake(opts)
          @bridge.extend Bridge

          super(@bridge, listener: listener)
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def create_capabilities(opts = {})
          caps = opts.delete(:desired_capabilities) { Remote::Capabilities.safari }
          options = opts.delete(:options) { Options.new }
          caps.merge!(options.as_json)
          caps
        end

      end # Driver
    end # Safari
  end # WebDriver
end # Selenium
