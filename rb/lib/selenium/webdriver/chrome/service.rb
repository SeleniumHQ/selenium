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

require 'selenium/webdriver/chromium/service'

module Selenium
  module WebDriver
    module Chrome
      class Service < Chromium::Service
        DEFAULT_PORT = 9515
        EXECUTABLE = 'chromedriver'
        MISSING_TEXT = <<~ERROR
          Unable to find chromedriver. Please download the server from
          https://chromedriver.storage.googleapis.com/index.html and place it somewhere on your PATH.
          More info at https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/?language=ruby.
        ERROR
        SHUTDOWN_SUPPORTED = true
      end # Service
    end # Chrome
  end # WebDriver
end # Selenium
