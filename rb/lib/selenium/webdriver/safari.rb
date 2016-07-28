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

require 'websocket'
require 'pathname'

module Selenium
  module WebDriver
    module Safari
      MISSING_TEXT = <<-ERROR.tr("\n", '').freeze
        Unable to find safari extension. Please download the file from
        http://www.seleniumhq.org/download/ and place it
        somewhere on your PATH. More info at https://github.com/SeleniumHQ/selenium/wiki/SafariDriver.
      ERROR

      class << self
        def path=(path)
          Platform.assert_executable(path)
          @path = path
        end

        def path
          @path ||= (
            path = case Platform.os
                   when :windows
                     Platform.find_in_program_files('Safari\\Safari.exe')
                   when :macosx
                     '/Applications/Safari.app/Contents/MacOS/Safari'
                   else
                     Platform.find_binary('Safari')
                   end

            unless File.file?(path) && File.executable?(path)
              raise Error::WebDriverError, MISSING_TEXT
            end

            path
          )
        end

        def resource_path
          @resource_path ||= Pathname.new(File.expand_path('../safari/resources', __FILE__))
        end

        def driver_path=(path)
          Platform.assert_executable path
          @driver_path = path
        end

        def driver_path
          @driver_path || '/usr/bin/safaridriver'
        end
      end
    end # Safari
  end # WebDriver
end # Selenium

require 'selenium/webdriver/safari/browser'
require 'selenium/webdriver/safari/server'
require 'selenium/webdriver/safari/options'
require 'selenium/webdriver/safari/legacy_bridge'
require 'selenium/webdriver/safari/apple_bridge'
require 'selenium/webdriver/safari/service'

Selenium::WebDriver::Safari::Bridge = Selenium::WebDriver::Safari::LegacyBridge
