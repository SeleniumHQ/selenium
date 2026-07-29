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
        describe UserAgentClientHints,
                 pending_if: [{browser: :firefox,
                               exception: {class: Error::UnknownCommandError,
                                           message: /userAgentClientHints\.setClientHintsOverride/},
                               reason: 'Firefox driver currently returns unknown command for userAgentClientHints'},
                              {browser_family: :safari,
                               exception: {class: Error::UnknownCommandError,
                                           message: /userAgentClientHints\.setClientHintsOverride/},
                               reason: 'Safari driver currently returns unknown command for userAgentClientHints'}],
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:user_agent_client_hints) { described_class.new(driver) }
          let(:script) { Script.new(driver) }

          def target
            Script::ContextTarget.new(context: driver.window_handle)
          end

          def evaluate(expression)
            script.evaluate(expression: expression, target: target, await_promise: false).result.value
          end

          def client_hints(platform: 'RubyOS')
            described_class::ClientHintsMetadata.new(
              brands: [described_class::BrandVersion.new(brand: 'RubyBrowser', version: '1')],
              full_version_list: [described_class::BrandVersion.new(brand: 'RubyBrowser', version: '1.0.0')],
              platform: platform,
              platform_version: '1.0',
              architecture: 'x86',
              model: '',
              mobile: false,
              bitness: '64',
              wow64: false,
              form_factors: ['Desktop']
            )
          end

          describe '#set_client_hints_override' do
            it 'overrides navigator user agent data for the current context' do
              user_agent_client_hints.set_client_hints_override(
                client_hints: client_hints,
                contexts: [driver.window_handle]
              )

              driver.navigate.to url_for('blank.html')

              expect(evaluate('navigator.userAgentData.platform')).to eq('RubyOS')
              expect(evaluate('navigator.userAgentData.brands[0].brand')).to eq('RubyBrowser')
            ensure
              begin
                user_agent_client_hints.set_client_hints_override(
                  client_hints: nil,
                  contexts: [driver.window_handle]
                )
              rescue StandardError
                nil
              end
            end

            it 'accepts user-context filters' do
              user_context = Browser.new(driver).create_user_context.user_context

              expect(user_agent_client_hints.set_client_hints_override(
                       client_hints: client_hints(platform: 'RubyUserContextOS'),
                       user_contexts: [user_context]
                     )).to be_empty
            ensure
              if user_context
                user_agent_client_hints.set_client_hints_override(client_hints: nil,
                                                                  user_contexts: [user_context])
              end
              Browser.new(driver).remove_user_context(user_context: user_context) if user_context
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
