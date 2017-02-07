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

      def_delegators :@logger, :debug, :debug?,
                     :info, :info?,
                     :warn, :warn?,
                     :error, :error?,
                     :fatal, :fatal?,
                     :level, :level=

      def initialize
        @logger = ::Logger.new($stdout)
        @logger.progname = 'Selenium'
        @logger.level = ($DEBUG ? :debug : :warn)
        @logger.formatter = proc do |severity, time, progname, msg|
          "#{time.strftime('%F %T')} #{severity} #{progname} #{msg}\n"
        end
      end

      def output=(io)
        @logger.reopen(io)
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
        if debug?
          @logger.instance_variable_get(:@logdev).instance_variable_get(:@dev)
        else
          File.new(Platform.null_device, 'w')
        end
      end
    end # Logger
  end # WebDriver
end # Selenium
