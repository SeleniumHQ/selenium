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

require 'selenium/webdriver/bidi/dispatcher/listener'
require 'selenium/webdriver/bidi/dispatcher/ordered_listener'

module Selenium
  module WebDriver
    class BiDi
      # Holds the event listeners of one BiDi connection and invokes each with the typed
      # payloads of its event. Listening is local: nothing here sends a command, so the
      # caller subscribes with Protocol::Session#subscribe itself.
      #
      # @api private
      class Dispatcher
        def initialize
          @listeners = {}
          @mutex = Mutex.new
          @last_id = 0
          @closed = false
        end

        def add_listener(event, payload_type, &block)
          raise ArgumentError, 'a block is required to listen for an event' unless block

          @mutex.synchronize do
            raise Error::WebDriverError, 'The BiDi connection is closed' if @closed

            id = "#{event}##{@last_id += 1}"
            listener_class = ENV.fetch('SE_ORDERED_EVENTS', nil) == 'true' ? OrderedListener : Listener
            @listeners[id] = listener_class.new(event, payload_type, block)
            id
          end
        end

        def remove_listener(id)
          @mutex.synchronize { @listeners.delete(id) }&.deactivate
        end

        # Runs on the socket thread, which also delivers command replies, so it never waits.
        def receive(event, params)
          listeners = @mutex.synchronize { @listeners.values.select { |listener| listener.event == event } }
          return if listeners.empty?

          payload_type = listeners.first.payload_type
          begin
            payload = payload_type ? payload_type.from_json(params) : params
          rescue StandardError => e
            message = "Dropped a #{event} payload that failed validation: #{e.class}: #{e.message}"
            return WebDriver.logger.error(message, id: :bidi)
          end
          listeners.each { |listener| listener.dispatch(payload) }
        end

        def close
          listeners = @mutex.synchronize do
            @closed = true
            @listeners.values.tap { @listeners.clear }
          end
          listeners.each(&:deactivate)
        end
      end # Dispatcher
    end # BiDi
  end # WebDriver
end # Selenium
