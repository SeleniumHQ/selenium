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
      # @api private
      #

      class Service < WebDriver::Service
        @default_port = 4444
        @executable = 'geckodriver'
        @missing_text = <<~ERROR
          Unable to find Mozilla geckodriver. Please download the server from
          https://github.com/mozilla/geckodriver/releases and place it somewhere on your PATH.
          More info at https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver.
        ERROR
        @shutdown_supported = false

        private

        # Note: This processing is deprecated
        def extract_service_args(driver_opts)
          driver_args = super
          driver_opts = driver_opts.dup
          driver_args << "--binary=#{driver_opts[:binary]}" if driver_opts.key?(:binary)
          driver_args << "--log=#{driver_opts[:log]}" if driver_opts.key?(:log)
          driver_args << "--marionette-port=#{driver_opts[:marionette_port]}" if driver_opts.key?(:marionette_port)
          driver_args << "--host=#{driver_opts[:host]}" if driver_opts.key?(:host)
          driver_args
        end
      end # Service
    end # Firefox
  end # WebDriver
end # Selenium
