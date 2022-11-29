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
    class BiDi
      autoload :Session, 'selenium/webdriver/bidi/session'

      def initialize(url:)
        @ws = WebSocketConnection.new(url: url)
      end

      def close
        @ws.close
      end

      def callbacks
        @ws.callbacks
      end

      def session
        Session.new(self)
      end

      def send_cmd(method, **params)
        data = {method: method, params: params.compact}
        message = @ws.send_cmd(**data)
        raise Error::WebDriverError, error_message(message) if message['error']

        message['result']
      end

      def error_message(message)
        "#{message['error']}: #{message['message']}\n#{message['stacktrace']}"
      end

      def on_console_log(&block)
        console_log_listener = []
        enabled = console_log_listener.any?
        console_log_listener << block
        return if enabled

        bidi.on(:console_api_called) do |params|
          event = BiDi::Log::ConsoleLogEntry.new(
            level: params['level'],
            text: params['text'],
            timestamp: params['timestamp'],
            type: params['type'],
            method: params['method'],
            args: params['args']
          )

          console_log_listener.each do |listener|
            listener.call(event)
          end
        end
      end

    end # BiDi
  end # WebDriver
end # Selenium
