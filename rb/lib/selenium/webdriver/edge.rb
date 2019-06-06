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

require 'net/http'

require 'selenium/webdriver/edge_html/driver'
require 'selenium/webdriver/edge_html/options'
require 'selenium/webdriver/edge_chrome/bridge'
require 'selenium/webdriver/edge_chrome/driver'
require 'selenium/webdriver/edge_chrome/profile'
require 'selenium/webdriver/edge_chrome/options'

module Selenium
  module WebDriver
    module EdgeHtml
      def self.driver_path=(path)
        WebDriver.logger.deprecate 'Selenium::WebDriver::Edge#driver_path=',
                                   'Selenium::WebDriver::Edge::Service#driver_path='
        Selenium::WebDriver::Edge::Service.driver_path = path
      end

      def self.driver_path
        WebDriver.logger.deprecate 'Selenium::WebDriver::Edge#driver_path',
                                   'Selenium::WebDriver::Edge::Service#driver_path'
        Selenium::WebDriver::Edge::Service.driver_path
      end
    end # EdgeHtml

    module EdgeChrome
      def self.path=(path)
        Platform.assert_executable path
        @path = path
      end

      def self.path
        @path ||= nil
      end
    end # EdgeChrome

    Edge = EdgeHtml # Alias EdgeHtml as Edge for now
  end # WebDriver
end # Selenium

require 'selenium/webdriver/edge_html/service'
require 'selenium/webdriver/edge_chrome/service'
