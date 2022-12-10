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

require 'open3'

module Selenium
  module WebDriver
    #
    # Wrapper for getting information from the Selenium Manager binaries.
    # This implementation is still in beta, and may change.
    # @api private
    #
    class SeleniumManager
      BIN_PATH = "../../../../../bin"

      class << self
        # @param [String] driver_name which driver to use.
        # @return [String] the path to the correct driver.
        def driver_path(driver_name)
          @driver_path ||= begin
            unless %w[chromedriver geckodriver msedgedriver IEDriverServer].include?(driver_name)
              msg = "Unable to locate driver with name: #{driver_name}"
              raise Error::WebDriverError, msg
            end

            location = run("#{binary} --driver #{driver_name}")
            WebDriver.logger.debug("Driver found at #{location}")
            Platform.assert_executable location

            location
          end
        end

        private

        # @return [String] the path to the correct selenium manager
        def binary
          @binary ||= begin
            path = File.expand_path(BIN_PATH, __FILE__)
            path << if Platform.windows?
                      '/windows/selenium-manager.exe'
                    elsif Platform.mac?
                      '/macos/selenium-manager'
                    elsif Platform.linux?
                      '/linux/selenium-manager'
                    end
            location = File.expand_path(path, __FILE__)
            unless location.is_a?(String) && File.exist?(location) && File.executable?(location)
              raise Error::WebDriverError, "Unable to obtain Selenium Manager"
            end

            WebDriver.logger.debug("Selenium Manager found at #{location}")
            location
          end
        end

        def run(command)
          WebDriver.logger.debug("Executing Process #{command}")

          begin
            stdout, stderr, status = Open3.capture3(command)
          rescue StandardError => e
            raise Error::WebDriverError, "Unsuccessful command executed: #{command}", e.message
          end

          if status.exitstatus.positive?
            raise Error::WebDriverError, "Unsuccessful command executed: #{command}\n#{stdout}#{stderr}"
          end

          stdout.gsub("INFO\t", '').strip
        end
      end
    end # SeleniumManager
  end # WebDriver
end # Selenium
