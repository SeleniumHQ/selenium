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
    module Chromium
      module Features
        CHROMIUM_COMMANDS = {
          launch_app: [:post, 'session/:session_id/chromium/launch_app'],
          get_network_conditions: [:get, 'session/:session_id/chromium/network_conditions'],
          set_network_conditions: [:post, 'session/:session_id/chromium/network_conditions'],
          delete_network_conditions: [:delete, 'session/:session_id/chromium/network_conditions'],
          set_permission: [:post, 'session/:session_id/permissions'],
          get_available_log_types: [:get, 'session/:session_id/se/log/types'],
          get_log: [:post, 'session/:session_id/se/log']
        }.freeze

        def commands(command)
          CHROME_COMMANDS[command] || self.class::COMMANDS[command]
        end

        def launch_app(id)
          execute :launch_app, {}, {id: id}
        end

        def cast_sinks
          execute :get_cast_sinks
        end

        def cast_sink_to_use=(name)
          execute :set_cast_sink_to_use, {}, {sinkName: name}
        end

        def cast_issue_message
          execute :cast_issue_message
        end

        def start_cast_tab_mirroring(name)
          execute :start_cast_tab_mirroring, {}, {sinkName: name}
        end

        def start_cast_desktop_mirroring(name)
          execute :start_cast_desktop_mirroring, {}, {sinkName: name}
        end

        def stop_casting(name)
          execute :stop_casting, {}, {sinkName: name}
        end

        def set_permission(name, value)
          execute :set_permission, {}, {descriptor: {name: name}, state: value}
        end

        def network_conditions
          execute :get_network_conditions
        end

        def network_conditions=(conditions)
          execute :set_network_conditions, {}, {network_conditions: conditions}
        end

        def delete_network_conditions
          execute :delete_network_conditions
        end

        def send_command(command_params)
          execute :send_command, {}, command_params
        end

        def available_log_types
          types = execute :get_available_log_types
          Array(types).map(&:to_sym)
        end

        def log(type)
          data = execute :get_log, {}, {type: type.to_s}

          Array(data).map do |l|
            LogEntry.new l.fetch('level', 'UNKNOWN'), l.fetch('timestamp'), l.fetch('message')
          rescue KeyError
            next
          end
        end
      end # Bridge
    end # Chromium
  end # WebDriver
end # Selenium
