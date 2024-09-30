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

require_relative 'session'

module Selenium
  module WebDriver
    class BiDi
      class Network
        NetworkEvents = {
          BEFORE_REQUEST_SENT: 'network.beforeRequestSent',
          RESPONSE_STARTED: 'network.responseStarted',
          RESPONSE_COMPLETED: 'network.responseCompleted',
          AUTH_REQUIRED: 'network.authRequired',
          FETCH_ERROR: 'network.fetchError'
        }.freeze

        InterceptPhases = {
          BEFORE_REQUEST: 'beforeRequestSent',
          RESPONSE_STARTED: 'responseStarted',
          AUTH_REQUIRED: 'authRequired'
        }.freeze

        def initialize(bidi)
          @bidi = bidi
          @session = Session.new(bidi)
        end

        def before_request_sent(&block)
          @session.subscribe(NetworkEvents::BEFORE_REQUEST_SENT, &block)
        end

        def response_started(&block)
          @session.subscribe(NetworkEvents::RESPONSE_STARTED, &block)
        end

        def response_completed(&block)
          @session.subscribe(NetworkEvents::RESPONSE_COMPLETED, &block)
        end

        def on_auth_required(&consumer)
          if @browsing_context_ids.empty?
            @bidi.add_listener("network.authRequired", &consumer)
          else
            @bidi.add_listener(@browsing_context_ids, "network.authRequired", &consumer)
          end
        end

        def auth_required
          @session.subscribe(NetworkEvents[:AUTH_REQUIRED])
        end

        def fetch_error(&block)
          subscribe(NetworkEvents::FETCH_ERROR, &block)
        end

        def add_intercept(phases: [], contexts: nil, url_patterns: nil)
          @bidi.send_cmd('network.addIntercept', phases: phases, contexts: contexts, urlPatterns: url_patterns)
        end

        def remove_intercept(intercept)
          @bidi.send_cmd('network.removeIntercept', intercept: intercept)
        end

        def clear_auth_handlers
          @bidi.send_cmd('network.clearAuthHandlers')
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

        def fail_request(request_id)
          @bidi.send_cmd('network.failRequest', request_id: request_id)
        end

        def cancel_auth(request_id)
          @bidi.send_cmd('network.cancelAuth', request_id: request_id)
        end

        def continue_request(request_id)
          @bidi.send_cmd('network.continueRequest', request_id: request_id)
        end

        def continue_response(params)
          @bidi.send_cmd('network.continueResponse', params: params)
        end

        def provide_response(params)
          @bidi.send_cmd('network.provideResponse', params: params)
        end
      end # Network
    end # BiDi
  end # WebDriver
end # Selenium
