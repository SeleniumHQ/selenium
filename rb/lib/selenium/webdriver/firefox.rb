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

require 'timeout'
require 'socket'
require 'rexml/document'

require 'selenium/webdriver/firefox/driver'

require 'selenium/webdriver/firefox/util'
require 'selenium/webdriver/firefox/extension'
require 'selenium/webdriver/firefox/binary'
require 'selenium/webdriver/firefox/profiles_ini'
require 'selenium/webdriver/firefox/profile'
require 'selenium/webdriver/firefox/launcher'
require 'selenium/webdriver/firefox/legacy/driver'

require 'selenium/webdriver/firefox/marionette/bridge'
require 'selenium/webdriver/firefox/marionette/driver'
require 'selenium/webdriver/firefox/options'
require 'selenium/webdriver/firefox/service'

module Selenium
  module WebDriver
    module Firefox
      DEFAULT_PORT = 7055
      DEFAULT_ENABLE_NATIVE_EVENTS = Platform.os == :windows
      DEFAULT_SECURE_SSL = false
      DEFAULT_ASSUME_UNTRUSTED_ISSUER = true
      DEFAULT_LOAD_NO_FOCUS_LIB = false

      def self.driver_path=(path)
        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path
        @driver_path ||= nil
      end

      def self.path=(path)
        Binary.path = path
      end
    end # Firefox
  end # WebDriver
end # Selenium
