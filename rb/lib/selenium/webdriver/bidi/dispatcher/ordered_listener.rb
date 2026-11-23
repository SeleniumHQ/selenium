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
        # Invoked with one payload at a time, in arrival order, on its own worker thread.
        # Used only when SE_ORDERED_EVENTS is true; kept for evaluating ordered delivery.
        #
        # @api private
        class OrderedListener < Listener
          STOP = Object.new.freeze

          def initialize(...)
            super
            @queue = Queue.new
            @worker = Thread.new do
              until (payload = @queue.pop).equal?(STOP)
                invoke(payload)
              end
            end
          end

          def dispatch(payload)
            @queue << payload
          end

          # A payload queued behind the marker arrived after removal and is never invoked.
          def deactivate
            super
            @queue << STOP
          end
        end # OrderedListener
      end # Dispatcher
    end # BiDi
  end # WebDriver
end # Selenium
