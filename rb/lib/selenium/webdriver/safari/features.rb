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
    module Safari
      module Features

        # https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/WebDriverEndpointDoc/Commands/Commands.html
        SAFARI_COMMANDS = {
          get_permissions: [:get, 'session/:session_id/apple/permissions'],
          set_permissions: [:post, 'session/:session_id/apple/permissions'],
          attach_debugger: [:post, 'session/:session_id/apple/attach_debugger']
        }.freeze

        def commands(command)
          SAFARI_COMMANDS[command] || self.class::COMMANDS[command]
        end

        def permissions
          execute(:get_permissions)['permissions']
        end

        def permissions=(permissions)
          execute :set_permissions, {}, {permissions: permissions}
        end

        def attach_debugger
          execute :attach_debugger, {}, {}
        end

      end # Bridge
    end # Safari
  end # WebDriver
end # Selenium
