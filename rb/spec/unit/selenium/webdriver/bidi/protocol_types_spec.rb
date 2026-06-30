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

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe 'generated structured types' do
          describe 'a record with a baked discriminator' do
            it 'round-trips through the wire' do
              locator = BrowsingContext::CssLocator.new(value: '.foo')

              expect(locator.as_json).to eq('type' => 'css', 'value' => '.foo')
              expect(BrowsingContext::CssLocator.from_json(locator.as_json)).to eq(locator)
            end

            it 'forces the discriminator and omits an unset field (required-enforcement is Phase 4)' do
              expect(BrowsingContext::CssLocator.new.as_json).to eq('type' => 'css')
            end
          end

          describe 'discriminated union dispatch' do
            it 'selects the variant by its discriminator value' do
              parsed = BrowsingContext::Locator.from_json('type' => 'css', 'value' => '.x')

              expect(parsed).to be_a(BrowsingContext::CssLocator)
              expect(parsed.value).to eq('.x')
            end

            it 'selects a variant by which fields are present when there is no discriminator' do
              parsed = Script::RemoteReference.from_json('sharedId' => 'abc')

              expect(parsed).to be_a(Script::SharedReference)
              expect(parsed.shared_id).to eq('abc')
            end

            it 'dispatches the LocalValue date and regexp variants restored upstream' do
              expect(Script::LocalValue.from_json('type' => 'date', 'value' => '2026-01-01'))
                .to be_a(Script::DateLocalValue)
              expect(Script::LocalValue.from_json('type' => 'regexp', 'value' => {'pattern' => 'ab+c'}))
                .to be_a(Script::RegExpLocalValue)
            end

            it 'dispatches NullValue by its "null" string tag and bakes the tag on serialization' do
              expect(Script::NullValue.new.as_json).to eq('type' => 'null')
              expect(Script::LocalValue.from_json('type' => 'null')).to eq(Script::NullValue.new)
            end

            it 'returns the raw payload for an unknown variant instead of raising (forward-compatible)' do
              payload = {'type' => 'futuristic', 'value' => 'x'}

              expect(BrowsingContext::Locator.from_json(payload)).to eq(payload)
            end
          end

          describe 'nested structured fields' do
            let(:cookie) do
              Network::Cookie.new(
                name: 'sid', value: Network::StringValue.new(value: 'YQ=='),
                domain: 'example.com', path: '/', size: 3,
                http_only: false, secure: true, same_site: 'none'
              )
            end

            it 'serializes a nested value object into its wire hash' do
              expect(cookie.as_json).to include('value' => {'type' => 'string', 'value' => 'YQ=='})
            end

            it 'parses a nested wire hash back into the value object' do
              parsed = Network::Cookie.from_json(cookie.as_json)

              expect(parsed.value).to eq(Network::StringValue.new(value: 'YQ=='))
              expect(parsed).to eq(cookie)
            end
          end

          describe 'recursive structured types' do
            it 'round-trips a nested LocalValue tree through the union dispatcher' do
              inner = Script::ArrayLocalValue.new(value: [Script::StringValue.new(value: 'x')])
              outer = Script::ArrayLocalValue.new(value: [Script::NumberValue.new(value: 1), inner])

              expect(outer.as_json).to eq(
                'type' => 'array',
                'value' => [
                  {'type' => 'number', 'value' => 1},
                  {'type' => 'array', 'value' => [{'type' => 'string', 'value' => 'x'}]}
                ]
              )
              expect(Script::LocalValue.from_json(outer.as_json)).to eq(outer)
            end
          end

          describe 'optional + nullable fields' do
            it 'omits an unset field but emits explicit null for a nullable one' do
              omitted = BrowsingContext::SetViewportParameters.new(context: 'c')
              explicit = BrowsingContext::SetViewportParameters.new(context: 'c', device_pixel_ratio: nil)

              expect(omitted.as_json).to eq('context' => 'c')
              expect(explicit.as_json).to eq('context' => 'c', 'devicePixelRatio' => nil)
            end
          end

          describe 'a const-or-null param' do
            it 'sends the literal or an explicit null (not a baked tag)' do
              expect(BrowsingContext::SetBypassCSPParameters.new(bypass: true).as_json).to eq('bypass' => true)
              expect(BrowsingContext::SetBypassCSPParameters.new(bypass: nil).as_json).to eq('bypass' => nil)
            end
          end

          describe 'extensible records' do
            it 'captures unknown keys and merges them back on serialization' do
              parsed = Script::SharedReference.from_json('sharedId' => 's1', 'webdriverValue' => 42)

              expect(parsed.shared_id).to eq('s1')
              expect(parsed.extensions).to eq('webdriverValue' => 42)
              expect(parsed.as_json).to eq('sharedId' => 's1', 'webdriverValue' => 42)
            end
          end

          describe 'outbound union command params' do
            it 'sends explicit null for a nullable union field a flat hash would have dropped' do
              params = Emulation::SetGeolocationOverrideParameters.build(coordinates: nil)

              expect(params).to be_a(Emulation::SetGeolocationOverrideParameters::Coordinates)
              expect(params.as_json).to eq('coordinates' => nil)
            end

            it 'dispatches a structural union by which field is supplied' do
              params = Emulation::SetGeolocationOverrideParameters.build(error: Emulation::GeolocationPositionError.new)

              expect(params).to be_a(Emulation::SetGeolocationOverrideParameters::Error)
              expect(params.as_json).to eq('error' => {'type' => 'positionUnavailable'})
            end

            it 'rejects a non-nullable variant field set to nil (it would be dropped on the wire)' do
              expect { Emulation::SetGeolocationOverrideParameters.build(error: nil) }
                .to raise_error(ArgumentError, /error cannot be nil/)
            end

            it 'rejects a field that does not belong to the selected variant' do
              expect { Network::ContinueWithAuthParameters.build(request: 'r', action: 'default', credentials: 'x') }
                .to raise_error(ArgumentError, /invalid combination/)
            end

            it 'dispatches a discriminated union by its value, falling back to the default variant' do
              provide = Network::ContinueWithAuthParameters.build(
                request: 'r', action: 'provideCredentials',
                credentials: Network::AuthCredentials.new(username: 'u', password: 'p')
              )
              default = Network::ContinueWithAuthParameters.build(request: 'r', action: 'default')

              expect(provide).to be_a(Network::ContinueWithAuthParameters::Credentials)
              expect(provide.as_json).to include('action' => 'provideCredentials',
                                                 'credentials' => {'type' => 'password', 'username' => 'u',
                                                                   'password' => 'p'})
              expect(default).to be_a(Network::ContinueWithAuthParameters::NoCredentials)
              expect(default.as_json).to eq('request' => 'r', 'action' => 'default')
            end
          end

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

          describe 'value-object enum validation' do
            it 'rejects an out-of-set enum value at construction, so an invalid object cannot exist' do
              expect { Network::Cookie.new(name: 'c', same_site: 'sideways') }
                .to raise_error(ArgumentError, /Cookie#same_site must be one of/)
            end

            it 'rejects an unknown keyword at construction' do
              expect { Network::Cookie.new(name: 'c', bogus: 'x') }
                .to raise_error(ArgumentError, /unknown keyword: :bogus/)
            end

            it 'rejects a non-nullable field set to nil, instead of silently dropping it' do
              expect { BrowsingContext::NavigateParameters.new(context: nil, url: 'x') }
                .to raise_error(ArgumentError, /context cannot be nil/)
            end

            it 'does not validate inbound from_json (trusts the browser, stays forward-compatible)' do
              entry = Log::ConsoleLogEntry.from_json('type' => 'console', 'level' => 'futureLevel')

              expect(entry).to be_a(Log::ConsoleLogEntry)
              expect(entry.level).to eq('futureLevel')
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
