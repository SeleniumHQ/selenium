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
    module DriverExtensions
      module HasNetworkConnection
        def network_connection_type
          connection_value = @bridge.network_connection

          connection_type = values_to_type[connection_value]

          # In case the connection type is not recognized return the
          # connection value.
          connection_type || connection_value
        end

        def network_connection_type=(connection_type)
          raise ArgumentError, 'Invalid connection type' unless valid_type? connection_type

          connection_value = type_to_values[connection_type]

          @bridge.network_connection = connection_value
        end

        private

        def type_to_values
          {airplane_mode: 1, wifi: 2, data: 4, all: 6, none: 0}
        end

        def values_to_type
          type_to_values.invert
        end

        def valid_type?(type)
          type_to_values.key? type
        end
      end # HasNetworkConnection
    end # DriverExtensions
  end # WebDriver
end # Selenium
