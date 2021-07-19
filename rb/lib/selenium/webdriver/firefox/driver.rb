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
    module Firefox

      #
      # Driver implementation for Firefox using GeckoDriver.
      # @api private
      #

      class Driver < WebDriver::Driver
        EXTENSIONS = [DriverExtensions::HasAddons,
                      DriverExtensions::FullPageScreenshot,
                      DriverExtensions::HasDevTools,
                      DriverExtensions::HasLogEvents,
                      DriverExtensions::HasNetworkInterception,
                      DriverExtensions::HasWebStorage,
                      DriverExtensions::PrintsPage].freeze

        def browser
          :firefox
        end

        private

        def devtools_url
          uri = URI("http://#{capabilities['moz:debuggerAddress']}")
          response = Net::HTTP.get(uri.hostname, '/json/version', uri.port)

          JSON.parse(response)['webSocketDebuggerUrl']
        end

        def devtools_version
          Firefox::DEVTOOLS_VERSION
        end
      end # Driver
    end # Firefox
  end # WebDriver
end # Selenium
