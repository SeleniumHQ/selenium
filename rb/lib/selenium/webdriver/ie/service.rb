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
    module IE
      class Service < WebDriver::Service
        DEFAULT_PORT = 5555
        EXECUTABLE = 'IEDriverServer'
        MISSING_TEXT = <<~ERROR
          Unable to find IEDriverServer. Please download the server from
          https://www.selenium.dev/downloads/ and place it somewhere on your PATH.
          More info at https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver.
        ERROR
        SHUTDOWN_SUPPORTED = true

        private

        # NOTE: This processing is deprecated
        def extract_service_args(driver_opts)
          driver_args = super
          driver_opts = driver_opts.dup
          driver_args << "--log-level=#{driver_opts[:log_level].to_s.upcase}" if driver_opts.key?(:log_level)
          driver_args << "--log-file=#{driver_opts[:log_file]}" if driver_opts.key?(:log_file)
          if driver_opts.key?(:implementation)
            driver_args << "--implementation=#{driver_opts[:implementation].to_s.upcase}"
          end
          driver_args << "--host=#{driver_opts[:host]}" if driver_opts.key?(:host)
          driver_args << "--extract_path=#{driver_opts[:extract_path]}" if driver_opts.key?(:extract_path)
          driver_args << "--silent" if driver_opts[:silent] == true
          driver_args
        end
      end # Server
    end # IE
  end # WebDriver
end # Selenium
