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
    module Firefox
      module Legacy

        #
        # Driver implementation for Firefox using legacy extension.
        # @api private
        #

        class Driver < WebDriver::Driver
          include DriverExtensions::TakesScreenshot

          def initialize(opts = {})
            opts[:desired_capabilities] ||= Remote::Capabilities.firefox

            if opts.key? :proxy
              WebDriver.logger.deprecate ':proxy', "Selenium::WebDriver::Remote::Capabilities.firefox(proxy: #{opts[:proxy]})"
              opts[:desired_capabilities].proxy = opts.delete(:proxy)
            end

            unless opts.key?(:url)
              port = opts.delete(:port) || DEFAULT_PORT
              profile = opts.delete(:profile)

              Binary.path = opts[:desired_capabilities][:firefox_binary] if opts[:desired_capabilities][:firefox_binary]
              @launcher = Launcher.new Binary.new, port, profile
              @launcher.launch
              opts[:url] = @launcher.url
            end

            listener = opts.delete(:listener)
            WebDriver.logger.info 'Skipping handshake as we know it is OSS.'
            desired_capabilities = opts.delete(:desired_capabilities)
            bridge = Remote::Bridge.new(opts)
            capabilities = bridge.create_session(desired_capabilities)
            @bridge = Remote::OSS::Bridge.new(capabilities, bridge.session_id, opts)

            begin
              super(@bridge, listener: listener)
            rescue
              @launcher.quit if @launcher
              raise
            end
          end

          def browser
            :firefox
          end

          def quit
            super
            nil
          ensure
            @launcher.quit
          end

        end # Driver
      end # Legacy
    end # Firefox
  end # WebDriver
end # Selenium
