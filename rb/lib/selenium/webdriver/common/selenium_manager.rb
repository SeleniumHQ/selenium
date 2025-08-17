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

        # @param [Array] arguments what gets sent to to Selenium Manager binary.
        # @return [Hash] paths to the requested assets.
        def binary_paths(*arguments)
          arguments += %w[--language-binding ruby]
          arguments += %w[--output json]
          arguments << '--debug' if WebDriver.logger.debug?

          run(binary, *arguments)
        end

        private

        # @return [String] the path to the correct selenium manager
        def binary
          @binary ||= begin
            if (location = ENV.fetch('SE_MANAGER_PATH', nil))
              WebDriver.logger.debug("Selenium Manager set by ENV['SE_MANAGER_PATH']: #{location}")
            end
            location ||= platform_location

            Platform.assert_executable(location)
            WebDriver.logger.debug("Selenium Manager binary found at #{location}", id: :selenium_manager)
            location
          end
        end

        def run(*command)
          stdout, stderr, status = execute_command(*command)
          result = parse_result_and_log(stdout)

          validate_command_result(command, status, result, stderr)

          result
        end

        def platform_location
          directory = File.expand_path(bin_path, __FILE__)
          if Platform.windows?
            "#{directory}/windows/selenium-manager.exe"
          elsif Platform.mac?
            "#{directory}/macos/selenium-manager"
          elsif Platform.linux?
            "#{directory}/linux/selenium-manager"
          elsif Platform.unix?
            WebDriver.logger.warn('Selenium Manager binary may not be compatible with Unix',
                                  id: %i[selenium_manager unix_binary])
            "#{directory}/linux/selenium-manager"
          else
            raise Error::WebDriverError, "unsupported platform: #{Platform.os}"
          end
        end

        def execute_command(*command)
          WebDriver.logger.debug("Executing Process #{command}", id: :selenium_manager)

          Open3.capture3(*command)
        rescue StandardError => e
          raise Error::WebDriverError, "Unsuccessful command executed: #{command}; #{e.message}"
        end

        def parse_result_and_log(stdout)
          json_output = stdout.empty? ? {'logs' => [], 'result' => {}} : JSON.parse(stdout)

          json_output['logs'].each do |log|
            level = log['level'].casecmp('info').zero? ? 'debug' : log['level'].downcase
            WebDriver.logger.send(level, log['message'], id: :selenium_manager)
          end

          json_output['result']
        end

        def validate_command_result(command, status, result, stderr)
          if status.nil? || status.exitstatus.nil?
            WebDriver.logger.info("No exit status for: #{command}. Assuming success if result is present.",
                                  id: :selenium_manager)
          end

          return unless status&.exitstatus&.positive? || result.nil?

          code = status&.exitstatus || 'exit status not available'
          raise Error::WebDriverError,
                "Unsuccessful command executed: #{command} - Code #{code}\n#{result}\n#{stderr}"
        end
      end
    end # SeleniumManager
  end # WebDriver
end # Selenium
