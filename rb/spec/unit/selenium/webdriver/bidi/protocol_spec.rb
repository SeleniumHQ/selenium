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
          describe 'enum argument validation' do
            it 'raises on a value outside the allowed enum set, before any wire call' do
              browsing_context = BrowsingContext.new(Transport.new(instance_double(WebDriver::WebSocketConnection)))

              expect { browsing_context.navigate(context: 'c', url: 'x', wait: 'tomorrow') }
                .to raise_error(ArgumentError, /wait must be one of/)
            end

            it 'validates each element of a list-valued enum' do
              network = Network.new(Transport.new(instance_double(WebDriver::WebSocketConnection)))

              expect { network.add_data_collector(data_types: %w[bogus], max_encoded_data_size: 1) }
                .to raise_error(ArgumentError, /dataTypes must be one of/)
            end

            it 'validates a union discriminator against the combined allowed set' do
              network = Network.new(Transport.new(instance_double(WebDriver::WebSocketConnection)))

              expect { network.continue_with_auth(request: 'r', action: 'bogus') }
                .to raise_error(ArgumentError, /action must be one of.*provideCredentials.*default.*cancel/)
            end

            it 'passes an allowed value through to the transport' do
              connection = instance_double(WebDriver::WebSocketConnection)
              allow(connection).to receive(:send_cmd).and_return('result' => {'navigation' => 'n', 'url' => 'u'})

              BrowsingContext.new(Transport.new(connection)).navigate(context: 'c', url: 'u', wait: 'complete')

              expect(connection).to have_received(:send_cmd)
            end
          end

          describe 'a command driven through the transport' do
            it 'marshals params (dropping nils) and parses the typed result' do
              connection = instance_double(WebDriver::WebSocketConnection)
              allow(connection).to receive(:send_cmd).and_return('result' => {'navigation' => 'n1', 'url' => 'https://x'})

              result = BrowsingContext.new(Transport.new(connection)).navigate(context: 'c', url: 'https://x')

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
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
