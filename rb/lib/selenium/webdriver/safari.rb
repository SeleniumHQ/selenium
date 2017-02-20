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
        def technology_preview
          "/Applications/Safari\ Technology\ Preview.app/Contents/MacOS/safaridriver"
        end

        def technology_preview!
          raise Error::WebDriverError, "Install Safari Technology Preview on MacOS Sierra" unless File.exist?(technology_preview)
          self.driver_path = technology_preview
        end

        def driver_path=(path)
          Platform.assert_executable path
          @driver_path = path
        end

        def driver_path
          @driver_path ||= nil
        end
      end
    end # Safari
  end # WebDriver
end # Selenium

require 'selenium/webdriver/safari/bridge'
require 'selenium/webdriver/safari/service'
