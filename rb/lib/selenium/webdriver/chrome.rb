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

require 'selenium/webdriver/chrome/service'
require 'selenium/webdriver/chrome/bridge'
require 'selenium/webdriver/chrome/profile'

module Selenium
  module WebDriver
    module Chrome
      def self.driver_path=(path)
        warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
          [DEPRECATION] `driver_path=` is deprecated. Pass the driver path as an option instead.
          e.g. Selenium::WebDriver.for :chrome, driver_path: '/path'
        DEPRECATE

        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path(warning = true)
        if warning
          warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
            [DEPRECATION] `driver_path` is deprecated. Pass the driver path as an option instead.
            e.g. Selenium::WebDriver.for :chrome, driver_path: '/path'
          DEPRECATE
        end

        @driver_path ||= nil
      end

      def self.path=(path)
        Platform.assert_executable path
        @path = path
      end

      def self.path
        @path ||= nil
      end
    end # Chrome
  end # WebDriver
end # Selenium
