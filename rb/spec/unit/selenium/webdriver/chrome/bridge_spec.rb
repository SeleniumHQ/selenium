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
      describe Bridge do
        let(:resp)    { {'sessionId' => 'foo', 'value' => @default_capabilities} }
        let(:service) { double(Service, start: true, uri: 'http://example.com') }
        let(:caps)    { {} }
        let(:http)    { double(Remote::Http::Default, call: resp).as_null_object }

        before do
          @default_capabilities = Remote::Capabilities.chrome.as_json

          allow(Chrome).to receive(:driver_path).and_return('/foo')
          allow(Remote::Capabilities).to receive(:chrome).and_return(caps)
          allow(Service).to receive(:new).and_return(service)
        end

        it 'sets the nativeEvents capability' do
          Bridge.new(http_client: http, native_events: true)

          expect(caps['chromeOptions']['nativeEvents']).to be true
          expect(caps['chrome.nativeEvents']).to be true
        end

        it 'sets the args capability' do
          Bridge.new(http_client: http, args: %w[--foo=bar])

          expect(caps['chromeOptions']['args']).to eq(%w[--foo=bar])
          expect(caps['chrome.switches']).to eq(%w[--foo=bar])
        end

        it 'sets the proxy capabilitiy' do
          proxy = Proxy.new(http: 'localhost:1234')
          Bridge.new(http_client: http, proxy: proxy)

          expect(caps['proxy']).to eq(proxy)
        end

        it 'sets the chrome.verbose capability' do
          Bridge.new(http_client: http, verbose: true)

          expect(caps['chromeOptions']['verbose']).to be true
          expect(caps['chrome.verbose']).to be true
        end

        it 'does not set the chrome.detach capability by default' do
          Bridge.new(http_client: http)

          expect(caps['chromeOptions']['detach']).to be nil
          expect(caps['chrome.detach']).to be nil
        end

        it 'sets the prefs capability' do
          Bridge.new(http_client: http, prefs: {foo: 'bar'})

          expect(caps['chromeOptions']['prefs']).to eq(foo: 'bar')
          expect(caps['chrome.prefs']).to eq(foo: 'bar')
        end

        it 'lets the user override chrome.detach' do
          Bridge.new(http_client: http, detach: true)

          expect(caps['chromeOptions']['detach']).to be true
          expect(caps['chrome.detach']).to be true
        end

        it 'lets the user override chrome.noWebsiteTestingDefaults' do
          Bridge.new(http_client: http, no_website_testing_defaults: true)

          expect(caps['chromeOptions']['noWebsiteTestingDefaults']).to be true
          expect(caps['chrome.noWebsiteTestingDefaults']).to be true
        end

        it 'uses the user-provided server URL if given' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com'))

          Bridge.new(http_client: http, url: 'http://example.com')
        end

        it 'raises an ArgumentError if args is not an Array' do
          expect { Bridge.new(args: '--foo=bar') }.to raise_error(ArgumentError)
        end

        it 'uses the given profile' do
          profile = Profile.new

          profile['some_pref'] = true
          profile.add_extension(__FILE__)

          Bridge.new(http_client: http, profile: profile)

          profile_data = profile.as_json
          expect(caps['chromeOptions']['profile']).to eq(profile_data['zip'])
          expect(caps['chromeOptions']['extensions']).to eq(profile_data['extensions'])

          expect(caps['chrome.profile']).to eq(profile_data['zip'])
          expect(caps['chrome.extensions']).to eq(profile_data['extensions'])
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['chromeOptions'] = {'foo' => 'bar'}

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities]['chromeOptions']).to include('foo' => 'bar')
            resp
          end

          Bridge.new(http_client: http, desired_capabilities: custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['chromeOptions'] = {'args' => %w[foo bar]}

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities]['chromeOptions']['args']).to eq(['baz'])
            resp
          end

          Bridge.new(http_client: http, desired_capabilities: custom_caps, args: %w[baz])
        end

        it 'accepts :service_log_path' do
          expect(Service).to receive(:new).with(Chrome.driver_path, Service::DEFAULT_PORT, '--log-path=/foo/bar')
          Bridge.new(http_client: http, service_log_path: '/foo/bar')
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
