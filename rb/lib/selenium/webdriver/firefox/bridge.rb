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

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          port        = opts.delete(:port) || DEFAULT_PORT
          profile     = opts.delete(:profile)
          http_client = opts.delete(:http_client)
          proxy       = opts.delete(:proxy)

          caps = opts.delete(:desired_capabilities) { Remote::Capabilities.firefox }

          Binary.path = caps[:firefox_binary] if caps[:firefox_binary]

          @launcher = create_launcher(port, profile)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @launcher.launch

          caps.proxy = proxy if proxy

          remote_opts = {
            :url                  => @launcher.url,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          begin
            super(remote_opts)
          rescue
            @launcher.quit
            raise
          end
        end

        def browser
          :firefox
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def quit
          super
          nil
        ensure
          @launcher.quit
        end

        private

        def create_launcher(port, profile)
          Launcher.new Binary.new, port, profile
        end

      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
