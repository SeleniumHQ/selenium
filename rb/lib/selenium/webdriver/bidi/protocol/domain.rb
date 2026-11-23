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
      module Protocol
        # @api private
        class Domain
          def initialize(source)
            connection = source.is_a?(Driver) ? source.send(:bridge).connection : source
            raise(Error::WebDriverError, 'a Driver or connection is required') unless connection.respond_to?(:send_cmd)

            @transport = Transport.new(connection)
          end

          # Stops invoking the listener an `add_<event>_listener` method returned the id for, without
          # waiting for a running invocation to finish. Local only, and a no-op for an unknown id.
          def remove_listener(id)
            @transport.remove_listener(id)
          end

          private

          # The connection this domain runs over, so a generated vendor accessor can build its
          # sibling variant (`Moz.new(connection)`) — construction stays connection-based.
          def connection = @transport.connection

          def execute(cmd:, params: nil, result: nil)
            @transport.execute(cmd: cmd, params: params, result: result)
          end

          def add_listener(event, &block)
            @transport.add_listener(event, self.class.const_get(:EVENT_TYPES).fetch(event), &block)
          end
        end
      end
    end
  end
end
