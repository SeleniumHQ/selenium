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

require_relative '../../spec_helper'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        # One canary per BiDi module that Safari does not yet implement. The module's own spec is
        # skipped on Safari (skip_if) so its dozens of unsupported examples don't burn Safari's slow,
        # serial runner. Each probe below runs only on Safari, staying pending while the command
        # raises. When Safari implements the module the command succeeds, the expectation runs, and the
        # probe passes, raising PendingExampleFixedError so we drop skip_if(:safari) in the named spec.
        describe 'Safari BiDi support probes',
                 skip_unless: {bidi: true, browser_family: :safari, reason: 'probes only run on Safari'} do
          after { |example| reset_driver!(example: example) }

          it 'bluetooth is unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock bluetooth_spec.rb'} do
            result = Bluetooth.new(driver).simulate_adapter(
              context: driver.window_handle, state: :powered_on, le_supported: true
            )
            expect(result).to be_empty
          end

          it 'browser client windows are unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock browser_spec.rb'} do
            expect(Browser.new(driver).get_client_windows.client_windows).to be_an(Array)
          end

          it 'emulation is unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock emulation_spec.rb'} do
            result = Emulation.new(driver).set_forced_colors_mode_theme_override(
              theme: nil, contexts: [driver.window_handle]
            )
            expect(result).to be_empty
          end

          it 'permissions is unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock permissions_spec.rb'} do
            result = Permissions.new(driver).set_permission(
              descriptor: Permissions::PermissionDescriptor.new(name: 'geolocation'),
              state: :granted,
              origin: url_for('blank.html')
            )
            expect(result).to be_empty
          end

          it 'storage is unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownError},
                          reason: 'when green, unblock storage_spec.rb'} do
            expect(Storage.new(driver).get_cookies.cookies).to be_an(Array)
          end

          it 'user agent client hints are unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock user_agent_client_hints_spec.rb'} do
            result = UserAgentClientHints.new(driver).set_client_hints_override(
              client_hints: nil, contexts: [driver.window_handle]
            )
            expect(result).to be_empty
          end

          it 'web extensions are unimplemented on Safari',
             pending_if: {browser_family: :safari, exception: {class: Error::UnknownCommandError},
                          reason: 'when green, unblock web_extension_spec.rb'} do
            expect(WebExtension.new(driver).uninstall(extension: 'ruby-bidi-probe')).to be_empty
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
