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

require 'forwardable'
require 'logger'

module Selenium
  module WebDriver
    #
    # @example Enable full logging
    #   Selenium::WebDriver.logger.level = :debug
    #
    # @example Log to file
    #   Selenium::WebDriver.logger.output = 'selenium.log'
    #
    # @example Use logger manually
    #   Selenium::WebDriver.logger.info('This is info message')
    #   Selenium::WebDriver.logger.warn('This is warning message')
    #
    class Logger
      extend Forwardable
      include ::Logger::Severity

      def_delegators :@logger, :debug, :debug?,
                     :info, :info?,
                     :warn, :warn?,
                     :error, :error?,
                     :fatal, :fatal?,
                     :level

      def initialize
        @logger = create_logger($stdout)
      end

      def output=(io)
        # `Logger#reopen` was added in Ruby 2.3
        if @logger.respond_to?(:reopen)
          @logger.reopen(io)
        else
          @logger = create_logger(io)
        end
      end

      #
      # For Ruby < 2.3 compatibility
      # Based on https://github.com/ruby/ruby/blob/ruby_2_3/lib/logger.rb#L250
      #

      def level=(severity)
        if severity.is_a?(Integer)
          @logger.level = severity
        else
          case severity.to_s.downcase
          when 'debug'.freeze
            @logger.level = DEBUG
          when 'info'.freeze
            @logger.level = INFO
          when 'warn'.freeze
            @logger.level = WARN
          when 'error'.freeze
            @logger.level = ERROR
          when 'fatal'.freeze
            @logger.level = FATAL
          when 'unknown'.freeze
            @logger.level = UNKNOWN
          else
            raise ArgumentError, "invalid log level: #{severity}"
          end
        end
      end

      #
      # Returns IO object used by logger internally.
      #
      # Normally, we would have never needed it, but we want to
      # use it as IO object for all child processes to ensure their
      # output is redirected there.
      #
      # It is only used in debug level, in other cases output is suppressed.
      #
      # @api private
      #
      def io
        @logger.instance_variable_get(:@logdev).instance_variable_get(:@dev)
      end

      #
      # Marks code as deprecated with/without replacement.
      #
      # @param [String] old
      # @param [String, nil] new
      #
      def deprecate(old, new = nil)
        message = "[DEPRECATION] #{old} is deprecated"
        message << if new
                     ". Use #{new} instead."
                   else
                     ' and will be removed in the next releases.'
                   end

        warn message
      end

      private

      def create_logger(output)
        logger = ::Logger.new(output)
        logger.progname = 'Selenium'
        logger.level = default_level
        logger.formatter = proc do |severity, time, progname, msg|
          "#{time.strftime('%F %T')} #{severity} #{progname} #{msg}\n"
        end

        logger
      end

      def default_level
        if $DEBUG || ENV.key?('DEBUG')
          DEBUG
        else
          WARN
        end
      end
    end # Logger
  end # WebDriver
end # Selenium
