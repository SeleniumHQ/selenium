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

      def_delegators :@logger,
                     :close,
                     :debug, :debug?,
                     :info, :info?,
                     :warn?,
                     :error, :error?,
                     :fatal, :fatal?,
                     :level, :level=

      #
      # @param [String] progname Allow child projects to use Selenium's Logger pattern
      #
      def initialize(progname = 'Selenium')
        @logger = create_logger(progname)
        @ignored = []
      end

      #
      # Changes logger output to a new IO.
      #
      # @param [String] io
      #
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
        @logger.instance_variable_get(:@logdev).dev
      end

      #
      # Will not log the provided ID.
      #
      # @param [Array, Symbol] id
      #
      def ignore(id)
        Array(id).each { |ignore| @ignored << ignore }
      end

      #
      # Overrides default #warn to skip ignored messages by provided id
      #
      # @param [String] message
      # @param [Symbol, Array<Sybmol>] id
      # @yield see #deprecate
      #
      def warn(message, id: [])
        id = Array(id)
        return if (@ignored & id).any?

        msg = id.empty? ? message : "[#{id.map(&:inspect).join(', ')}] #{message} "
        msg += " #{yield}" if block_given?

        @logger.warn { msg }
      end

      #
      # Marks code as deprecated with/without replacement.
      #
      # @param [String] old
      # @param [String, nil] new
      # @param [Symbol, Array<Symbol>] id
      # @param [String] reference
      # @yield appends additional message to end of provided template
      #
      def deprecate(old, new = nil, id: [], reference: '', &block)
        id = Array(id)
        return if @ignored.include?(:deprecations) || (@ignored & id).any?

        ids = id.empty? ? '' : "[#{id.map(&:inspect).join(', ')}] "

        message = +"[DEPRECATION] #{ids}#{old} is deprecated"
        message << if new
                     ". Use #{new} instead."
                   else
                     ' and will be removed in a future release.'
                   end
        message << " See explanation for this deprecation: #{reference}." unless reference.empty?

        warn message, &block
      end

      private

      def create_logger(name)
        logger = ::Logger.new($stdout)
        logger.progname = name
        logger.level = default_level
        logger.formatter = proc do |severity, time, progname, msg|
          "#{time.strftime('%F %T')} #{severity} #{progname} #{msg}\n"
        end

        logger
      end

      def default_level
        $DEBUG || ENV.key?('DEBUG') ? :debug : :warn
      end
    end # Logger
  end # WebDriver
end # Selenium
