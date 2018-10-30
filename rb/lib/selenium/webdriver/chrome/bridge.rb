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
    module Chrome
      module Bridge

        COMMANDS = {
          get_network_conditions: [:get, '/session/:session_id/chromium/network_conditions'.freeze],
          set_network_conditions: [:post, '/session/:session_id/chromium/network_conditions'.freeze],
          send_command: [:post, '/session/:session_id/goog/cdp/execute'.freeze]
        }.freeze

        def commands(command)
          COMMANDS[command] || super
        end

        def network_conditions
          execute :get_network_conditions
        end

        def send_command(command_params)
          execute :send_command, {}, command_params
        end

        def network_conditions=(conditions)
          execute :set_network_conditions, {}, {network_conditions: conditions}
        end

      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
