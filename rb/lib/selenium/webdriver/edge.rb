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

require 'net/http'

require 'selenium/webdriver/edge/service'
require 'selenium/webdriver/edge/bridge'

module Selenium
  module WebDriver
    module Edge
      MISSING_TEXT = <<-ERROR.tr("\n", '').freeze
        Unable to find MicrosoftWebDriver. Please download the server from
        https://www.microsoft.com/en-us/download/details.aspx?id=48212 and place it
        somewhere on your PATH. More info at https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver.
      ERROR

      def self.driver_path=(path)
        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path
        @driver_path ||= begin
          path = Platform.find_binary('MicrosoftWebDriver')
          raise Error::WebDriverError, MISSING_TEXT unless path
          Platform.assert_executable path

          path
        end
      end

      def self.path=(path)
        Platform.assert_executable path
        @path = path
      end

      def self.path
        @path ||= nil
      end
    end # Edge
  end # WebDriver
end # Selenium
