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
    module IPhone
      #
      # @api private
      #

      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://#{Platform.localhost}:3001/wd/hub/"

        def initialize(opts = {})
          warn 'The iPhone driver is deprecated - please use either http://appium.io/ or http://ios-driver.github.io/ios-driver/ instead'

          remote_opts = {
            :url                  => opts.fetch(:url, DEFAULT_URL),
            :desired_capabilities => opts.fetch(:desired_capabilities, capabilities),
          }

          remote_opts[:http_client] = opts[:http_client] if opts.has_key?(:http_client)

          super remote_opts
        end

        def browser
          :iphone
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage,
            DriverExtensions::HasLocation
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.iphone
        end

      end # Bridge
    end # IPhone
  end # WebDriver
end # Selenium