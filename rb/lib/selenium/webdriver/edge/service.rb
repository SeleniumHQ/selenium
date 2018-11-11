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
    module Edge
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 17556
        @executable = 'MicrosoftWebDriver'.freeze
        @missing_text = <<-ERROR.gsub(/\n +| {2,}/, ' ').freeze
          Unable to find MicrosoftWebDriver. Please download the server from
          https://www.microsoft.com/en-us/download/details.aspx?id=48212 and place it somewhere on your PATH.
          More info at https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver.
        ERROR

        private

        def start_process
          @process = build_process(@executable_path, "--port=#{@port}", *@extra_args)
          @process.start
        end

        def cannot_connect_error_text
          "unable to connect to MicrosoftWebDriver #{@host}:#{@port}"
        end

        def extract_service_args(driver_opts)
          driver_args = super
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
