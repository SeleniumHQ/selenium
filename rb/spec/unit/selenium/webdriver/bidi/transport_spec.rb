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
      describe Transport do
        let(:connection) { instance_double(WebDriver::WebSocketConnection) }
        let(:transport) { described_class.new(connection) }

        def stub_result(result = {})
          allow(connection).to receive(:send_cmd).and_return('result' => result)
        end

        it 'serializes a params object and returns the raw result by default' do
          stub_result('handle' => 'h1')
          params = Protocol::Browser::CreateUserContextParameters.new(accept_insecure_certs: true)

          expect(transport.execute(cmd: 'browser.createUserContext', params: params)).to eq('handle' => 'h1')
          expect(connection).to have_received(:send_cmd)
            .with(method: 'browser.createUserContext', params: {'acceptInsecureCerts' => true})
        end

        it 'parses the result into the declared type' do
          stub_result('navigation' => 'n1', 'url' => 'https://x')
          params = Protocol::BrowsingContext::NavigateParameters.new(context: 'c', url: 'https://x')

          result = transport.execute(cmd: 'browsingContext.navigate', params: params,
                                     result: Protocol::BrowsingContext::NavigateResult)

          expect(result).to be_a(Protocol::BrowsingContext::NavigateResult)
          expect(result.url).to eq('https://x')
        end

        it 'sends an empty payload when there are no params' do
          stub_result
          transport.execute(cmd: 'browser.close')
          expect(connection).to have_received(:send_cmd).with(method: 'browser.close', params: {})
        end

        it 'drops omitted entries from a passthrough hash' do
          stub_result
          transport.execute(cmd: 'session.unsubscribe', params: {events: ['log.entryAdded'], subscriptions: nil})
          expect(connection).to have_received(:send_cmd)
            .with(method: 'session.unsubscribe', params: {events: ['log.entryAdded']})
        end

        it 'emits explicit wire null for a nullable field set to nil, omitting UNSET ones' do
          stub_result
          params = Protocol::BrowsingContext::SetViewportParameters.new(context: 'c', viewport: nil)

          transport.execute(cmd: 'browsingContext.setViewport', params: params)

          expect(connection).to have_received(:send_cmd)
            .with(method: 'browsingContext.setViewport', params: {'context' => 'c', 'viewport' => nil})
        end

        it 'raises on an error reply' do
          allow(connection).to receive(:send_cmd)
            .and_return('error' => 'no such frame', 'message' => 'gone', 'stacktrace' => '')

          expect { transport.execute(cmd: 'browsingContext.navigate') }
            .to raise_error(Error::WebDriverError, /no such frame: gone/)
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
