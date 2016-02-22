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

      class << self
        def path=(path)
          Platform.assert_executable(path)
          @path = path
        end

        def path
          @path ||= (
            path = case Platform.os
                   when :windows
                     Platform.find_in_program_files("Safari\\Safari.exe")
                   when :macosx
                     "/Applications/Safari.app/Contents/MacOS/Safari"
                   else
                     Platform.find_binary("Safari")
                   end

            unless File.file?(path) && File.executable?(path)
              raise Error::WebDriverError, "unable to find the Safari executable, please set Selenium::WebDriver::Safari.path= or add it to your PATH."
            end

            path
          )
        end

        def resource_path
          @resource_path ||= Pathname.new(File.expand_path("../safari/resources", __FILE__))
        end
      end

    end # Safari
  end # WebDriver
end # Selenium

require 'selenium/webdriver/safari/browser'
require 'selenium/webdriver/safari/server'
require 'selenium/webdriver/safari/options'
require 'selenium/webdriver/safari/bridge'

