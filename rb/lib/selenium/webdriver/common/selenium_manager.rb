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
          command = generate_command(binary, options)

          output = run(*command)

          browser_path = output['browser_path']
          driver_path = output['driver_path']
          Platform.assert_executable driver_path

          if options.respond_to? :binary
            options.binary = browser_path
            options.browser_version = nil
          end

          driver_path
        end

        private

        def generate_command(binary, options)
          command = [binary, '--browser', options.browser_name]
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
          command
        end

        # @return [String] the path to the correct selenium manager
        def binary
          @binary ||= begin
            target = "#{Dir.home}/.cache/selenium/manager/#{current_version}"
            WebDriver.logger.debug("Caching Selenium Manager binary to #{target}", id: :selenium_manager)
            FileUtils.mkdir_p(target)
            FileUtils.cp(source, target) if Dir.empty?(target)
            cached_path = Dir["#{target}/*"].first

            if cached_path.nil?
              raise Error::WebDriverError, "Unable to copy Selenium Manager binary from #{source} to #{target}"
            end

            Platform.assert_executable(cached_path)
            cached_path
          rescue TypeError => e
            raise Error::WebDriverError,
                  "Unable to locate or obtain Selenium Manager binary; #{cached_path} is not a invalid; #{e.message}"
          rescue Error::WebDriverError => e
            raise Error::WebDriverError, "Selenium Manager binary located at #{cached_path}, but #{e.message}"
          end
        end

        def run(*command)
          command += %w[--output json]
          command << '--debug' if WebDriver.logger.debug?

          WebDriver.logger.debug("Executing Process #{command}", id: :selenium_manager)

          begin
            stdout, stderr, status = Open3.capture3(*command)
          rescue StandardError => e
            raise Error::WebDriverError, "Unsuccessful command executed: #{command}; #{e.message}"
          end

          json_output = stdout.empty? ? {} : JSON.parse(stdout)
          (json_output['logs'] || []).each do |log|
            level = log['level'].casecmp('info').zero? ? 'debug' : log['level'].downcase
            WebDriver.logger.send(level, log['message'], id: :selenium_manager)
          end

          result = json_output['result']
          return result unless status.exitstatus.positive?

          raise Error::WebDriverError, "Unsuccessful command executed: #{command}\n#{result}#{stderr}"
        end

        def source
          @source ||= begin
            location = File.expand_path(bin_path, __FILE__)
            location << if Platform.windows?
                          '/windows/selenium-manager.exe'
                        elsif Platform.mac?
                          '/macos/selenium-manager'
                        elsif Platform.linux?
                          '/linux/selenium-manager'
                        end
            WebDriver.logger.debug("Getting Selenium Manager binary from #{location}",
                                   id: :selenium_manager)
            location
          end
        end

        def current_version
          gem_version = Gem::Version.new Selenium::WebDriver::VERSION
          "0.#{gem_version.segments[0..1].join('.')}"
        end
      end
    end # SeleniumManager
  end # WebDriver
end # Selenium
