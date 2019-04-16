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
    module Chrome
      #
      # @api private
      #

      class Service < WebDriver::Service
        @default_port = 9515
        @executable = 'chromedriver'
        @missing_text = <<~ERROR
          Unable to find chromedriver. Please download the server from
          https://chromedriver.storage.googleapis.com/index.html and place it somewhere on your PATH.
          More info at https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver.
        ERROR
        @shutdown_supported = true

        def self.driver_path=(path)
          Platform.assert_executable path if path.is_a?(String)
          @driver_path = path
        end

        private

        # Note: This processing is deprecated
        def extract_service_args(driver_opts)
          driver_args = super
          driver_opts = driver_opts.dup
          driver_args << "--log-path=#{driver_opts.delete(:log_path)}" if driver_opts.key?(:log_path)
          driver_args << "--url-base=#{driver_opts.delete(:url_base)}" if driver_opts.key?(:url_base)
          driver_args << "--port-server=#{driver_opts.delete(:port_server)}" if driver_opts.key?(:port_server)
          driver_args << "--whitelisted-ips=#{driver_opts.delete(:whitelisted_ips)}" if driver_opts.key?(:whitelisted_ips)
          driver_args << "--verbose" if driver_opts.key?(:verbose)
          driver_args << "--silent" if driver_opts.key?(:silent)
          driver_args
        end
      end # Service
    end # Chrome
  end # WebDriver
end # Selenium
