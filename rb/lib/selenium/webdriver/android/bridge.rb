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
    module Android

      #
      # @api private
      #

      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://#{Platform.localhost}:8080/wd/hub/"

        def initialize(opts = {})
          warn 'The Android driver is deprecated - please use either http://selendroid.io or http://appium.io instead.'

          remote_opts = {
            :url                  => opts.fetch(:url, DEFAULT_URL),
            :desired_capabilities => opts.fetch(:desired_capabilities, capabilities),
          }

          remote_opts[:http_client] = opts[:http_client] if opts.has_key?(:http_client)

          super remote_opts
        end

        def browser
          :android
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::Rotatable,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage,
            DriverExtensions::HasLocation,
            DriverExtensions::HasNetworkConnection,
            DriverExtensions::HasTouchScreen
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.android
        end

      end # Bridge
    end # Android
  end # WebDriver
end # Selenium
