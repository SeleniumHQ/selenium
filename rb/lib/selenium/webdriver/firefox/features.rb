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
    module Firefox
      module Features
        FIREFOX_COMMANDS = {
          get_context: [:get, 'session/:session_id/moz/context'],
          set_context: [:post, 'session/:session_id/moz/context'],
          install_addon: [:post, 'session/:session_id/moz/addon/install'],
          uninstall_addon: [:post, 'session/:session_id/moz/addon/uninstall'],
          full_page_screenshot: [:get, 'session/:session_id/moz/screenshot/full']
        }.freeze

        def command_list
          FIREFOX_COMMANDS.merge(self.class::COMMANDS)
        end

        def commands(command)
          command_list[command]
        end

        def install_addon(path, temporary)
          payload = {addon: encode_extension(path)}
          payload[:temporary] = temporary unless temporary.nil?
          execute :install_addon, {}, payload
        end

        def uninstall_addon(id)
          execute :uninstall_addon, {}, {id: id}
        end

        def install_web_extension(path, allow_private_browsing: nil, permanent: nil)
          unless bidi?
            temporary = !permanent unless permanent.nil?
            options = {temporary: temporary, allowPrivateBrowsing: allow_private_browsing}.compact
            return WebDriver::WebExtension.new(execute(:install_addon, {}, {addon: encode_extension(path), **options}))
          end

          options = {allow_private_browsing:, permanent:}.compact
          result = web_extension.moz.install(extension_data: web_extension_data(path), **options)
          WebDriver::WebExtension.new(result.extension)
        end

        def uninstall_web_extension(extension_id)
          bidi? ? web_extension.uninstall(extension: extension_id) : uninstall_addon(extension_id)
          nil
        end

        def full_screenshot
          execute :full_page_screenshot
        end

        def context=(context)
          execute :set_context, {}, {context: context}
        end

        def context
          execute :get_context
        end
      end # Bridge
    end # Firefox
  end # WebDriver
end # Selenium
