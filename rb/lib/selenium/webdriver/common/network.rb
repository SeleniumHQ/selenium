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
    class Network
      attr_reader :auth_callbacks

      def initialize(bridge)
        @network = BiDi::Network.new(bridge.bidi)
        @auth_callbacks = {}
      end

      def add_auth_handler(username, password)
        intercept = @network.add_intercept(phases: [BiDi::Network::PHASES[:auth_required]])
        auth_id = @network.on(:auth_required) do |event|
          request_id = event['requestId']
          @network.continue_with_auth(request_id, username, password)
        end
        @auth_callbacks[auth_id] = intercept

        auth_id
      end

      def remove_auth_handler(id)
        intercept = @auth_callbacks[id]
        @network.remove_intercept(intercept['intercept'])
        @auth_callbacks.delete(id)
      end

      def clear_auth_handlers
        @auth_callbacks.each_key { |id| remove_auth_handler(id) }
      end
    end # Network
  end # WebDriver
end # Selenium
