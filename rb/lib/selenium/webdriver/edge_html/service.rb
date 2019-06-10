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
    module EdgeHtml
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 17556
        EXECUTABLE = 'MicrosoftWebDriver'
        MISSING_TEXT = <<~ERROR
          Unable to find MicrosoftWebDriver. Please install it following instructions
          at https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/.
        ERROR
        SHUTDOWN_SUPPORTED = false

        private

        # Note: This processing is deprecated
        def extract_service_args(driver_opts)
          driver_args = super
          driver_opts = driver_opts.dup
          driver_args << "--host=#{driver_opts[:host]}" if driver_opts.key? :host
          driver_args << "--package=#{driver_opts[:package]}" if driver_opts.key? :package
          driver_args << "--silent" if driver_opts[:silent] == true
          driver_args << "--verbose" if driver_opts[:verbose] == true
          driver_args
        end
      end # Service
    end # Edge
  end # WebDriver
end # Service
