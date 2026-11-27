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
      class Dispatcher
        # Invoked with each payload on a thread of its own, without waiting for earlier invocations.
        #
        # @api private
        class Listener
          attr_reader :event, :payload_type

          def initialize(event, payload_type, block)
            @event = event
            @payload_type = payload_type
            @block = block
            @active = true
            @mutex = Mutex.new
          end

          def dispatch(payload)
            Thread.new { invoke(payload) }
          end

          # Not joined: the caller may be this listener itself, removing itself or quitting the driver.
          def deactivate
            @mutex.synchronize { @active = false }
          end

          private

          def invoke(payload)
            return unless @mutex.synchronize { @active }

            ListenerErrors.listener_thread!

            @block.call(payload)
          # Nothing above a listener's thread can handle what escapes it, and test assertions are not StandardErrors.
          rescue Exception => e # rubocop:disable Lint/RescueException
            backtrace = Array(e.backtrace).first(5).join("\n")
            WebDriver.logger.error("A listener for #{event} raised #{e.class}: #{e.message}\n#{backtrace}", id: :bidi)
          end
        end # Listener
      end # Dispatcher
    end # BiDi
  end # WebDriver
end # Selenium
