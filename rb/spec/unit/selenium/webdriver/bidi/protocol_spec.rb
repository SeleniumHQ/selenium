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

require File.expand_path('../spec_helper', __dir__)
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/protocol', __dir__)
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/transport', __dir__)

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe 'generated command surface' do
          let(:connection) { instance_double(WebDriver::WebSocketConnection) }

          # The double stands in for a real connection, which responds to send_cmd.
          before { allow(connection).to receive(:send_cmd) }

          describe 'construction' do
            it 'builds a transport over the connection it is given' do
              expect(BrowsingContext.new(connection).instance_variable_get(:@transport)).to be_a(Transport)
            end

            it 'raises without a driver or connection' do
              expect { BrowsingContext.new(Object.new) }
                .to raise_error(Error::WebDriverError, /Driver or connection/)
            end
          end

          describe 'enum argument validation' do
            it 'raises on a value outside the allowed enum set, before any wire call' do
              expect { BrowsingContext.new(connection).navigate(context: 'c', url: 'x', wait: :tomorrow) }
                .to raise_error(ArgumentError, /wait must be one of/)
            end

            it 'validates each element of a list-valued enum' do
              expect { Network.new(connection).add_data_collector(data_types: %i[bogus], max_encoded_data_size: 1) }
                .to raise_error(ArgumentError, /dataTypes must be one of/)
            end

            it 'validates a union discriminator against the combined allowed set' do
              expect { Network.new(connection).continue_with_auth(request: 'r', action: :bogus) }
                .to raise_error(ArgumentError, /action must be one of.*provide_credentials.*default.*cancel/)
            end

            it 'passes an allowed value through to the transport' do
              allow(connection).to receive(:send_cmd).and_return('result' => {'navigation' => 'n', 'url' => 'u'})

              BrowsingContext.new(connection).navigate(context: 'c', url: 'u', wait: :complete)

              expect(connection).to have_received(:send_cmd)
                .with(method: 'browsingContext.navigate', params: hash_including('wait' => 'complete'))
            end
          end

          describe 'a command driven through the transport' do
            it 'marshals params (dropping nils) and parses the typed result' do
              allow(connection).to receive(:send_cmd).and_return('result' => {'navigation' => 'n1', 'url' => 'https://x'})

              result = BrowsingContext.new(connection).navigate(context: 'c', url: 'https://x')

              expect(connection).to have_received(:send_cmd)
                .with(method: 'browsingContext.navigate', params: {'context' => 'c', 'url' => 'https://x'})
              expect(result).to be_a(BrowsingContext::NavigateResult)
              expect(result.url).to eq('https://x')
              expect(result.navigation).to eq('n1')
            end
          end

          describe 'inbound event dispatch' do
            it 'maps an event wire method to the type its params parse into' do
              type = BrowsingContext::EVENT_TYPES['browsingContext.load']
              parsed = type.from_json('context' => 'c', 'navigation' => 'n', 'timestamp' => 1, 'url' => 'https://x')

              expect(type).to eq(BrowsingContext::NavigationInfo)
              expect(parsed).to be_a(BrowsingContext::NavigationInfo)
              expect(parsed.url).to eq('https://x')
            end
          end

          describe 'outbound domain type accessors' do
            it 'exposes an outbound union as an accessor returning the class (variant factories dispatch)' do
              expect(WebExtension.new(connection).extension_data).to eq(WebExtension::ExtensionData)
            end

            it 'constructs an outbound record directly through its accessor' do
              path = WebExtension.new(connection).extension_path(path: '/tmp/ext')

              expect(path).to be_a(WebExtension::ExtensionPath)
              expect(path.as_json).to eq('type' => 'path', 'path' => '/tmp/ext')
            end

            it 'builds a variant end-to-end through a union accessor and its factory' do
              built = WebExtension.new(connection).extension_data.path(path: '/tmp/ext')

              expect(built).to be_a(WebExtension::ExtensionPath)
              expect(built.as_json).to eq('type' => 'path', 'path' => '/tmp/ext')
            end

            it 'dispatches a locator variant through a union accessor factory' do
              built = BrowsingContext.new(connection).locator.css(value: '.submit')

              expect(built).to be_a(BrowsingContext::CssLocator)
              expect(built.as_json).to eq('type' => 'css', 'value' => '.submit')
            end

            it 'exposes a vendor variant over the same connection, driving its overridden command' do
              moz = WebExtension.new(connection).moz
              expect(moz).to be_a(WebExtension::Moz)

              allow(connection).to receive(:send_cmd).and_return('result' => {'extension' => 'ext-id'})
              moz.install(extension_data: WebExtension.new(connection).extension_path(path: '/tmp/ext'),
                          allow_private_browsing: true)

              expect(connection).to have_received(:send_cmd)
                .with(method: 'webExtension.install',
                      params: hash_including('moz:allowPrivateBrowsing' => true))
            end

            it 'does not expose an inbound-only type (script.RemoteValue is received, never sent)' do
              expect(Script.new(connection)).not_to respond_to(:remote_value)
            end

            it 'does not expose a command param wrapper (the command method builds it)' do
              expect(WebExtension.new(connection)).not_to respond_to(:install_parameters)
            end

            it 'exposes a nested type reached as a plain field ref (a locator value a caller fills in)' do
              value = BrowsingContext.new(connection).accessibility_locator_value(name: 'submit', role: 'button')

              expect(value).to be_a(BrowsingContext::AccessibilityLocator::Value)
              expect(value.as_json).to eq('name' => 'submit', 'role' => 'button')
            end

            it 'does not expose a synthetic reached only as a union arm (built through its union)' do
              expect(Network.new(connection)).not_to respond_to(:continue_with_auth_parameters_credentials)
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
