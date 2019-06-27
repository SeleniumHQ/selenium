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
    module Safari

      #
      # Driver implementation for Safari.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::HasDebugger
        include DriverExtensions::HasPermissions
        include DriverExtensions::HasWebStorage
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          opts[:desired_capabilities] ||= Remote::Capabilities.safari

          opts[:url] ||= service_url(opts)

          listener = opts.delete(:listener)
          desired_capabilities = opts.delete(:desired_capabilities)
          options = opts.delete(:options)

          @bridge = Remote::Bridge.new(opts)
          @bridge.extend Bridge
          @bridge.create_session(desired_capabilities, options)

          super(@bridge, listener: listener)
        end

        def browser
          :safari
        end
      end # Driver
    end # Safari
  end # WebDriver
end # Selenium
