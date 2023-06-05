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
      class << self
        attr_writer :bin_path

        def bin_path
          @bin_path ||= '../../../../../bin'
        end

        # @param [Options] options browser options.
        # @return [String] the path to the correct driver.
        def driver_path(options)
          message = 'applicable driver not found; attempting to install with Selenium Manager (Beta)'
          WebDriver.logger.info(message, id: :selenium_manager)

          unless options.is_a?(Options)
            raise ArgumentError, "SeleniumManager requires a WebDriver::Options instance, not #{options.inspect}"
          end

          command = generate_command(binary, options)

          location = run(*command)
          WebDriver.logger.debug("Driver found at #{location}", id: :selenium_manager)
          Platform.assert_executable location

          location
        end

        private

        def generate_command(binary, options)
          command = [binary, '--browser', options.browser_name, '--output', 'json']
          if options.browser_version
            command << '--browser-version'
            command << options.browser_version
          end
          if options.respond_to?(:binary) && !options.binary.nil?
            command << '--browser-path'
            command << options.binary.gsub('\\', '\\\\\\')
          end
          if options.proxy
            command << '--proxy'
            (command << options.proxy.ssl) || options.proxy.http
          end
          command << '--debug' if WebDriver.logger.debug?
          command
        end

        # @return [String] the path to the correct selenium manager
        def binary
          @binary ||= begin
            path = File.expand_path(bin_path, __FILE__)
            path << if Platform.windows?
                      '/windows/selenium-manager.exe'
                    elsif Platform.mac?
                      '/macos/selenium-manager'
                    elsif Platform.linux?
                      '/linux/selenium-manager'
                    end
            location = File.expand_path(path, __FILE__)
            unless location.is_a?(String) && File.exist?(location) && File.executable?(location)
              raise Error::WebDriverError, 'Unable to obtain Selenium Manager'
            end

            WebDriver.logger.debug("Selenium Manager found at #{location}", id: :selenium_manager)
            location
          end
        end

        def run(*command)
          WebDriver.logger.debug("Executing Process #{command}", id: :selenium_manager)

          begin
            stdout, stderr, status = Open3.capture3(*command)
            json_output = stdout.empty? ? nil : JSON.parse(stdout)
            result = json_output&.dig('result', 'message')
          rescue StandardError => e
            raise Error::WebDriverError, "Unsuccessful command executed: #{command}", e.message
          end

          (json_output&.fetch('logs') || []).each do |log|
            WebDriver.logger.send(log['level'].downcase, log['message'], id: :selenium_manager)
          end

          if status.exitstatus.positive?
            raise Error::WebDriverError, "Unsuccessful command executed: #{command}\n#{result}#{stderr}"
          end

          result
        end
      end
    end # SeleniumManager
  end # WebDriver
end # Selenium
