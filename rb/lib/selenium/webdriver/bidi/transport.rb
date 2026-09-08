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
      # The seam between the generated Protocol layer and the websocket: serializes a
      # command's params, sends it, and parses the reply into its declared type.
      #
      # @api private
      class Transport
        # The websocket the transport sends over. Exposed so a domain can build a sibling
        # domain (e.g. a vendor variant) over the same connection without Transport ever
        # becoming a public constructor argument.
        attr_reader :connection

        def initialize(connection)
          @connection = connection
        end

        def execute(cmd:, params: nil, result: nil)
          reply = @connection.send_cmd(method: cmd, params: serialize(params))
          raise error_for(reply) if reply['error']

          value = reply['result']
          result ? result.from_json(value) : value
        end

        private

        def serialize(params)
          params&.as_json || {}
        end

        def error_for(reply)
          Protocol::ErrorCode.for(reply['error']).new("#{reply['message']}\n#{reply['stacktrace']}")
        end
      end # Transport
    end # BiDi
  end # WebDriver
end # Selenium
