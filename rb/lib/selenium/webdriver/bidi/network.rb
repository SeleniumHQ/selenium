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
      class Network
        EVENTS = {
          before_request: 'network.beforeRequestSent',
          response_started: 'network.responseStarted',
          response_completed: 'network.responseCompleted',
          auth_required: 'network.authRequired',
          FETCH_ERROR: 'network.fetchError'
        }.freeze

        PHASES = {
          before_request: 'beforeRequestSent',
          response_started: 'responseStarted',
          auth_required: 'authRequired'
        }.freeze

        def initialize(bidi)
          @bidi = bidi
        end

        def add_intercept(phases: [], contexts: nil, url_patterns: nil)
          @bidi.send_cmd('network.addIntercept', phases: phases, contexts: contexts, urlPatterns: url_patterns)
        end

        def remove_intercept(intercept)
          @bidi.send_cmd('network.removeIntercept', intercept: intercept)
        end

        def continue_with_auth(request_id, username, password)
          @bidi.send_cmd(
            'network.continueWithAuth',
            'request' => request_id,
            'action' => 'provideCredentials',
            'credentials' => {
              'type' => 'password',
              'username' => username,
              'password' => password
            }
          )
        end

        def on(event, &block)
          event = EVENTS[event] if event.is_a?(Symbol)
          @bidi.add_callback(event, &block)
        end
      end # Network
    end # BiDi
  end # WebDriver
end # Selenium
