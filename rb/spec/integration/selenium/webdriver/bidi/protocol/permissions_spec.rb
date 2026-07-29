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
        describe Permissions,
                 pending_if: {browser_family: :safari,
                              exception: {class: Error::UnknownCommandError,
                                          message: /(?:Module permissions does not exist|permissions\.)/},
                              reason: 'Safari driver currently returns unknown command for BiDi permissions commands'},
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:permissions) { described_class.new(driver) }
          let(:script) { Script.new(driver) }
          let(:browsing_context) { BrowsingContext.new(driver) }

          def target(context)
            Script::ContextTarget.new(context: context)
          end

          def evaluate(expression, context = driver.window_handle, await_promise: false)
            script.evaluate(expression: expression, target: target(context), await_promise: await_promise)
          end

          def geolocation_permission(context = driver.window_handle)
            evaluate(
              "navigator.permissions.query({name: 'geolocation'}).then(permission => permission.state)",
              context,
              await_promise: true
            ).result.value
          end

          def origin(context = driver.window_handle)
            evaluate('window.location.origin', context).result.value
          end

          describe '#set_permission' do
            it 'sets geolocation permission to granted' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('blank.html'), wait: :complete)

              permissions.set_permission(
                descriptor: Permissions::PermissionDescriptor.new(name: 'geolocation'),
                state: :granted,
                origin: origin
              )

              expect(geolocation_permission).to eq('granted')
            end

            it 'accepts embedded origin and user context parameters' do
              browser = Browser.new(driver)
              user_context = browser.create_user_context.user_context
              context = browsing_context.create(type: :tab, user_context: user_context).context

              browsing_context.navigate(context: driver.window_handle, url: url_for('blank.html'), wait: :complete)
              browsing_context.navigate(context: context, url: url_for('blank.html'), wait: :complete)
              permission_origin = origin(driver.window_handle)
              original_state = geolocation_permission(driver.window_handle)

              permissions.set_permission(
                descriptor: Permissions::PermissionDescriptor.new(name: 'geolocation'),
                state: :granted,
                origin: permission_origin,
                embedded_origin: permission_origin,
                user_context: user_context
              )

              expect(geolocation_permission(context)).to eq('granted')
              expect(geolocation_permission(driver.window_handle)).to eq(original_state)
            ensure
              browsing_context.close(context: context) if context
              browser.remove_user_context(user_context: user_context) if browser && user_context
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
