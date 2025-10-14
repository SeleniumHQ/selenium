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

module Selenium
  module WebDriver
    class Network
      extend Forwardable

      attr_reader :callbacks, :network
      alias bidi network

      def_delegators :network, :continue_with_auth, :continue_with_request, :continue_with_response

      def initialize(bridge)
        @network = BiDi::Network.new(bridge.bidi)
        @callbacks = {}
      end

      def remove_handler(id)
        intercept = callbacks[id]
        network.remove_intercept(intercept['intercept'])
        callbacks.delete(id)
      end

      def clear_handlers
        callbacks.each_key { |id| remove_handler(id) }
      end

      def add_authentication_handler(username = nil, password = nil, *filter, pattern_type: nil, &block)
        selected_block =
          if username && password
            proc { |auth| auth.authenticate(username, password) }
          else
            block
          end

        add_handler(
          :auth_required,
          BiDi::Network::PHASES[:auth_required],
          BiDi::InterceptedAuth,
          filter,
          pattern_type: pattern_type,
          &selected_block
        )
      end

      def add_request_handler(*filter, pattern_type: nil, &block)
        add_handler(
          :before_request,
          BiDi::Network::PHASES[:before_request],
          BiDi::InterceptedRequest,
          filter,
          pattern_type: pattern_type,
          &block
        )
      end

      def add_response_handler(*filter, pattern_type: nil, &block)
        add_handler(
          :response_started,
          BiDi::Network::PHASES[:response_started],
          BiDi::InterceptedResponse,
          filter,
          pattern_type: pattern_type,
          &block
        )
      end

      private

      def add_handler(event_type, phase, intercept_type, filter, pattern_type: nil)
        intercept = network.add_intercept(phases: [phase], url_patterns: [filter].flatten, pattern_type: pattern_type)
        callback_id = network.on(event_type) do |event|
          request = event['request']
          intercepted_item = intercept_type.new(network, request)
          yield(intercepted_item)
        end

        callbacks[callback_id] = intercept
        callback_id
      end
    end # Network
  end # WebDriver
end # Selenium
