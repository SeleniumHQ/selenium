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
    module DriverExtensions
      module HasLogEvents
        KINDS = %i[console exception].freeze

        #
        # Registers listener to be called whenever browser receives
        # a new Console API message such as console.log() or an unhandled
        # exception.
        #
        # This currently relies on DevTools so is only supported in
        # Chromium browsers.
        #
        # @example Collect console messages
        #   logs = []
        #   driver.on_log_event(:console) do |event|
        #     logs.push(event)
        #   end
        #
        # @example Collect JavaScript exceptions
        #   exceptions = []
        #   driver.on_log_event(:exception) do |event|
        #     exceptions.push(event)
        #   end
        #
        # @param [Symbol] kind :console or :exception
        # @param [#call] block which is called when event happens
        # @yieldparam [DevTools::ConsoleEvent, DevTools::ExceptionEvent]
        #

        def on_log_event(kind, &block)
          raise WebDriverError, "Don't know how to handle #{kind} events" unless KINDS.include?(kind)

          enabled = log_listeners[kind].any?
          log_listeners[kind] << block
          return if enabled

          devtools.runtime.enable
          __send__("log_#{kind}_events")
        end

        private

        def log_listeners
          @log_listeners ||= Hash.new { |listeners, kind| listeners[kind] = [] }
        end

        def log_console_events
          devtools.runtime.on(:console_api_called) do |params|
            event = DevTools::ConsoleEvent.new(
              type: params['type'],
              timestamp: params['timestamp'],
              args: params['args']
            )

            log_listeners[:console].each do |listener|
              listener.call(event)
            end
          end
        end

        def log_exception_events
          devtools.runtime.on(:exception_thrown) do |params|
            event = DevTools::ExceptionEvent.new(
              description: params.dig('exceptionDetails', 'exception', 'description'),
              timestamp: params['timestamp'],
              stacktrace: params.dig('exceptionDetails', 'stackTrace', 'callFrames')
            )

            log_listeners[:exception].each do |listener|
              listener.call(event)
            end
          end
        end

      end # HasLogEvents
    end # DriverExtensions
  end # WebDriver
end # Selenium
