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

        #
        #
        # Registers listener to be called whenever browser receives
        # a new Console API message such as console.log().
        # This currently relies on DevTools so is only supported in
        # Chromium browsers.
        #
        # @example
        #   logs = []
        #   driver.on_log_event do |event|
        #     logs.push(event)
        #   end
        #
        # @param [#call] block which yields DevTools::ConsoleEvent
        #

        def on_log_event(&block)
          console_listeners_enabled = console_listeners.any?
          console_listeners << block
          return if console_listeners_enabled

          devtools.runtime.enable
          devtools.runtime.on(:console_api_called) do |params|
            event = DevTools::ConsoleEvent.new(
              type: params['type'],
              timestamp: params['timestamp'],
              args: params['args']
            )

            console_listeners.each do |listener|
              listener.call(event)
            end
          end
        end

        private

        def console_listeners
          @console_listeners ||= []
        end

      end # HasLogEvents
    end # DriverExtensions
  end # WebDriver
end # Selenium
