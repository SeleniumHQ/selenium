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
require 'selenium/logger'

module Selenium
  #
  # Wrapper for getting information from the Selenium Manager binaries.
  # This implementation is still in beta, and may change.
  # @api private
  #
  class Manager
    module Error
      class SeleniumManagerError < StandardError; end
      class PlatformError < StandardError; end
    end # Error

    class << self
      attr_writer :bin_path

      def logger(**opts)
        @logger ||= Selenium::Logger.new('Manager', **opts)
      end

      def bin_path
        @bin_path ||= '../../../../../bin'
      end

      # @param [Array] args command line arguments.
      # @return [Hash] the output results
      def results(args)
        run(binary, args)
      end

      private

      # @return [String] the path to the correct selenium manager
      def binary
        @binary ||= begin
          path = File.expand_path(bin_path, __FILE__)
          path << case os
                  when :windows
                    '/windows/selenium-manager.exe'
                  when :macosx
                    '/macos/selenium-manager'
                  when :linux
                    '/linux/selenium-manager'
                  end

          location = File.expand_path(path, __FILE__)

          begin
            raise Error::PlatformError, "not a file: #{location.inspect}" unless File.file?(location)
            raise Error::PlatformError, "not executable: #{location.inspect}" unless File.executable?(location)
          rescue TypeError
            raise Error::SeleniumManagerError,
                  "Unable to locate or obtain Selenium Manager binary; #{location} is not a valid file object"
          rescue Error::SeleniumManagerError => e
            raise Error::SeleniumManagerError, "Selenium Manager binary located, but #{e.message}"
          end

          logger.debug("Selenium Manager binary found at #{location}", id: :locate)
          location
        end
      end

      def run(binary, args)
        command = [binary] + args
        command += %w[--output json]
        command << '--debug' if logger.debug?

        logger.debug("Executing Process #{command}", id: :run)

        begin
          stdout, stderr, status = Open3.capture3(*command)
          json_output = stdout.empty? ? nil : JSON.parse(stdout)
          result = json_output['result']
        rescue StandardError => e
          raise Error::SeleniumManagerError, "Unsuccessful command executed: #{command}; #{e.message}"
        end

        (json_output&.fetch('logs') || []).each do |log|
          level = log['level'].casecmp('info').zero? ? 'debug' : log['level'].downcase
          logger.send(level, log['message'], id: :run)
        end

        if status.exitstatus.positive?
          raise Error::SeleniumManagerError, "Unsuccessful command executed: #{command}\n#{result}#{stderr}"
        end

        result
      end

      def os
        host_os = RbConfig::CONFIG['host_os']
        case host_os
        when /mswin|msys|mingw|cygwin|bccwin|wince|emc/
          :windows
        when /darwin|mac os/
          :macosx
        when /linux/
          :linux
        when /solaris|bsd/
          :unix
        else
          raise Error::PlatformError, "unknown os: #{host_os.inspect}"
        end
      end
    end
  end # Manager
end # Selenium
