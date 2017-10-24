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

require 'selenium/webdriver/edge/bridge'
require 'selenium/webdriver/edge/driver'
require 'selenium/webdriver/edge/service'

module Selenium
  module WebDriver
    module Edge
      def self.driver_path=(path)
        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path(warning = true)
        @driver_path ||= nil
      end
    end # Edge
  end # WebDriver
end # Selenium
