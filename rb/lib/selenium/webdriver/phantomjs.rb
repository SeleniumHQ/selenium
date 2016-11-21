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

require 'selenium/webdriver/phantomjs/service'
require 'selenium/webdriver/phantomjs/bridge'

module Selenium
  module WebDriver
    module PhantomJS
      def self.path=(path)
        warn <<-DEPRECATE.tr("\n", '').freeze
          [DEPRECATION] `path=` is deprecated. Pass the driver path as an option instead.
          e.g. Selenium::WebDriver.for :phantomjs, driver_path: '/path'
        DEPRECATE

        Platform.assert_executable path
        @path = path
      end

      def self.path
        warn <<-DEPRECATE.tr("\n", '').freeze
          [DEPRECATION] `path` is deprecated. Pass the driver path as an option instead.
          e.g. Selenium::WebDriver.for :phantomjs, driver_path: '/path'
        DEPRECATE

        @path ||= begin
          path = Platform.find_binary(Service.executable)
          raise Error::WebDriverError, Service.missing_text unless path
          Platform.assert_executable path

          path
        end
      end
    end # PhantomJS
  end # WebDriver
end # Selenium
