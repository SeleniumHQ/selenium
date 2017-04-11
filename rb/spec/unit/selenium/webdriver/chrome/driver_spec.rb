# encoding: utf-8
#
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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Chrome
      describe Driver do
        let(:resp)    { {'sessionId' => 'foo', 'value' => Remote::Capabilities.chrome.as_json} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps)    { Remote::Capabilities.new }
        let(:http)    { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:chrome).and_return(caps)
          allow(Service).to receive(:binary_path).and_return('/foo')
          allow(Service).to receive(:new).and_return(service)
        end

        it 'sets the args capability' do
          Driver.new(http_client: http, args: %w[--foo=bar])

          expect(caps[:chrome_options]['args']).to eq(%w[--foo=bar])
        end

        it 'sets the proxy capabilitiy' do
          proxy = Proxy.new(http: 'localhost:1234')
          Driver.new(http_client: http, proxy: proxy)

          expect(caps[:proxy]).to eq(proxy)
        end

        it 'does not set the chrome.detach capability by default' do
          Driver.new(http_client: http)

          expect(caps[:chrome_options]).to be nil
          expect(caps['chrome.detach']).to be nil
        end

        it 'sets the prefs capability' do
          Driver.new(http_client: http, prefs: {foo: 'bar'})

          expect(caps[:chrome_options]['prefs']).to eq(foo: 'bar')
        end

        it 'lets the user override chrome.detach' do
          Driver.new(http_client: http, detach: true)

          expect(caps[:chrome_options]['detach']).to be true
        end

        it 'raises an ArgumentError if args is not an Array' do
          expect { Driver.new(args: '--foo=bar') }.to raise_error(ArgumentError)
        end

        it 'uses the given profile' do
          profile = Profile.new

          profile['some_pref'] = true
          profile.add_extension(__FILE__)

          Driver.new(http_client: http, profile: profile)

          profile_data = profile.as_json
          expect(caps[:chrome_options]['args'].first).to include(profile_data[:directory])
          expect(caps[:chrome_options]['extensions']).to eq(profile_data[:extensions])
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps[:chrome_options] = {'foo' => 'bar'}

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities][:chrome_options]).to include('foo' => 'bar')
            resp
          end

          Driver.new(http_client: http, desired_capabilities: custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps[:chrome_options] = {'args' => %w[foo bar]}

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities][:chrome_options]['args']).to eq(['baz'])
            resp
          end

          Driver.new(http_client: http, desired_capabilities: custom_caps, args: %w[baz])
        end

        it 'handshakes protocol' do
          expect(Remote::Bridge).to receive(:handshake)
          Driver.new(http_client: http)
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
