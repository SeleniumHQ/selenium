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

module Selenium
  module WebDriver
    class DriverFinder
      def self.path(options, klass)
        path = klass.driver_path
        path = path.call if path.is_a?(Proc)
        path ||= Platform.find_binary(klass::EXECUTABLE)

        path ||= begin
          SeleniumManager.driver_path(options)
        rescue StandardError => e
          WebDriver.logger.debug("Unable obtain driver using Selenium Manager\n #{e.message}")
          nil
        end
        msg = "Unable to locate the #{klass::EXECUTABLE} executable; for more information on how to install drivers, " \
              'see https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/'
        raise Error::WebDriverError, msg unless path

        Platform.assert_executable path
        path
      end
    end
  end
end
