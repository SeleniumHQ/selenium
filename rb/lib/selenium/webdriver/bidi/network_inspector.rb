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
      class NetworkInspector
        EVENTS = {
          before_request_sent: 'beforeRequestSent',
          fetch_error: 'fetchError',
          response_completed: 'responseCompleted',
          response_started: 'responseStarted'
        }.freeze

        def initialize(driver, browsing_context_ids = nil)
          unless driver.capabilities.web_socket_url
            raise Error::WebDriverError,
                  'WebDriver instance must support BiDi protocol'
          end

          @bidi = driver.bidi
          @bidi.session.subscribe('network.beforeRequestSent', browsing_context_ids)
          @bidi.session.subscribe('network.responseStarted', browsing_context_ids)
          @bidi.session.subscribe('network.responseCompleted', browsing_context_ids)
        end

        def before_request_sent(&block)
          on(:before_request_sent, &block)
        end

        def response_started(&block)
          on(:response_started, &block)
        end

        def response_completed(&block)
          on(:response_completed, &block)
        end

        private

        def on(event, &block)
          event = EVENTS[event] if event.is_a?(Symbol)
          @bidi.callbacks["network.#{event}"] << block
        end
      end # NetworkInspector
    end # Bidi
  end # WebDriver
end # Selenium
