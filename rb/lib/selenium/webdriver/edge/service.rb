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
    module Edge

      #
      # @api private
      #

      class Service
        DEFAULT_PORT        = 17556
        MISSING_TEXT        = "Unable to find MicrosoftWebDriver. Please download the server from https://www.microsoft.com/en-us/download/details.aspx?id=48212. More info at https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver."

        def self.executable_path
          @executable_path ||= (
            path = Platform.find_binary "MicrosoftWebDriver"
            path or raise Error::WebDriverError, MISSING_TEXT
            Platform.assert_executable path

            path
          )
        end

        def self.default_service(*extra_args)
          new executable_path, DEFAULT_PORT, *extra_args
        end

        private

        def stop_server
          connect_to_server { |http| http.head("/shutdown") }
        end

        def start_process
          server_command = [@executable_path, "--port=#{@port}", *@extra_args]
          @process       = ChildProcess.build(*server_command)

          @process.io.inherit! if $DEBUG == true
          @process.start
        end

        def cannot_connect_error_text
          "unable to connect to MicrosoftWebDriver #{@host}:#{@port}"
        end

      end # Service
    end # Edge
  end # WebDriver
end # Service
