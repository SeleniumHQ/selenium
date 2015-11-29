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
      class W3CBridge < Remote::W3CBridge

        def initialize(opts = {})
          http_client = opts.delete(:http_client)

          opts.delete(:marionette)
          caps = opts.delete(:desired_capabilities) { Remote::W3CCapabilities.firefox }

          if opts.has_key?(:url)
            url = opts.delete(:url)
          else
            Binary.path = caps[:firefox_binary] if caps[:firefox_binary]
            if Firefox::Binary.version < 43
              raise ArgumentError, "Firefox Version #{Firefox::Binary.version} does not support Marionette; Set firefox_binary in Capabilities to point to a supported binary"
            end

            @service = Service.default_service(*extract_service_args(opts))

            if @service.instance_variable_get("@host") == "127.0.0.1"
              @service.instance_variable_set("@host", 'localhost')
            end

            @service.start

            url = @service.uri
          end

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          remote_opts = {
            :url                  => url,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client
          super(remote_opts)
        end

        def browser
          :firefox
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage
          ]
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def extract_service_args(opts)
          args = []

          if opts.has_key?(:service_log_path)
            args << "--log-path=#{opts.delete(:service_log_path)}"
          end

          args
        end

      end # W3CBridge
    end # Firefox
  end # WebDriver
end # Selenium
