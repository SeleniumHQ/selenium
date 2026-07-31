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
        describe 'serialization runtime' do
          # Complete, valid Cookie attributes, so a test can isolate one field (override it or add a
          # stray key) without tripping the required-presence check on the others.
          def valid_cookie_attrs
            {
              name: 'sid', value: Network::StringValue.new(value: 'YQ=='),
              domain: 'example.com', path: '/', size: 3, http_only: false, secure: true, same_site: :none
            }
          end

          describe 'a record with a baked discriminator' do
            it 'round-trips through the wire' do
              locator = BrowsingContext::CssLocator.new(value: '.foo')

              expect(locator.as_json).to eq('type' => 'css', 'value' => '.foo')
              expect(BrowsingContext::CssLocator.from_json(locator.as_json)).to eq(locator)
            end

            it 'rejects a required field omitted at construction' do
              expect { BrowsingContext::CssLocator.new }
                .to raise_error(ArgumentError, /CssLocator#value is required/)
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

            it 'raises on a variant outside our schema instead of passing the raw payload through' do
              payload = {'type' => 'futuristic', 'value' => 'x'}

              expect { BrowsingContext::Locator.from_json(payload) }
                .to raise_error(Error::WebDriverError, /variant not in this Selenium's BiDi schema/)
            end

            it 'raises when an object-only union receives a bare scalar (no arm can match)' do
              expect { Script::RemoteValue.from_json('not-an-object') }
                .to raise_error(Error::WebDriverError, /RemoteValue expected an object/)
            end

            it 'passes a bare scalar through a union that has a scalar arm (input.Origin)' do
              expect(Input::Origin.from_json('viewport')).to eq('viewport')
            end

            it 'keeps a map string key while typing its object value (object-only value union)' do
              parsed = Script::ObjectRemoteValue.from_json(
                'type' => 'object', 'value' => [['k', {'type' => 'number', 'value' => 2}]]
              )
              key, value = parsed.value.first

              expect(key).to eq('k') # a bare-string key survives, not rejected by the object-only union
              expect(value).to be_a(Script::NumberValue)
            end
          end

          describe 'nested structured fields' do
            let(:cookie) { Network::Cookie.new(**valid_cookie_attrs) }

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

            it 'parses nested RemoteValues inside an object/map result (list of pairs)' do
              parsed = Script::ObjectRemoteValue.from_json(
                'type' => 'object',
                'value' => [['k', {'type' => 'number', 'value' => 2}]]
              )

              key, value = parsed.value.first
              expect(key).to eq('k')
              expect(value).to be_a(Script::NumberValue)
              expect(value.value).to eq(2)
            end

            # The outbound mirror of the map-key case: a bare-string key serializes through the
            # scalar-tolerant union untouched while its object value is typed, and round-trips back.
            it 'serializes and round-trips a map LocalValue whose key is a bare string' do
              obj = Script::ObjectLocalValue.new(value: [['k', Script::StringValue.new(value: 'x')]])

              expect(obj.as_json).to eq(
                'type' => 'object',
                'value' => [['k', {'type' => 'string', 'value' => 'x'}]]
              )
              expect(Script::LocalValue.from_json(obj.as_json)).to eq(obj)
            end

            # A scalar-tolerant position still validates the scalar arm's type: the map entry is
            # `RemoteValue / text`, so a non-string bare value is a wire error, not passed through.
            it 'rejects a wrong-typed scalar at a map key position instead of passing it through' do
              wire = {'type' => 'object', 'value' => [[42, {'type' => 'number', 'value' => 2}]]}

              expect { Script::ObjectRemoteValue.from_json(wire) }
                .to raise_error(Error::WebDriverError, /value expected string, got 42/)
            end

            # Scalar tolerance is the key's alone: the value is the object-only RemoteValue union,
            # so a bare-scalar value is rejected rather than passed through — object_only holds here.
            it 'rejects a bare-scalar map value against the object-only value union' do
              wire = {'type' => 'object', 'value' => [['k', 'bare string, not an object']]}

              expect { Script::ObjectRemoteValue.from_json(wire) }
                .to raise_error(Error::WebDriverError, /expected an object on the wire/)
            end

            # A map is `[key, value]` pairs; a malformed entry that is not a 2-item pair is a wire
            # error, not something to pass through the scalar-tolerant path.
            it 'rejects a malformed map entry that is not a [key, value] pair' do
              wire = {'type' => 'object', 'value' => [['orphan-key']]}

              expect { Script::ObjectRemoteValue.from_json(wire) }
                .to raise_error(Error::WebDriverError, /expected a \[key, value\] pair/)
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

            it 'rejects a value that is neither the literal nor null, before it reaches the wire' do
              expect { BrowsingContext::SetBypassCSPParameters.new(bypass: false) }
                .to raise_error(ArgumentError, /bypass must be true/)
              expect { Emulation::SetScriptingEnabledParameters.new(enabled: true) }
                .to raise_error(ArgumentError, /enabled must be false/)
            end
          end

          describe 'extensible records' do
            it 'captures unknown keys and merges them back on serialization' do
              parsed = nil
              expect { parsed = Script::SharedReference.from_json('sharedId' => 's1', 'webdriverValue' => 42) }
                .to have_warning(:bidi_undeclared_property)

              expect(parsed.shared_id).to eq('s1')
              expect(parsed.extensions).to eq('webdriverValue' => 42)
              expect(parsed.as_json).to eq('sharedId' => 's1', 'webdriverValue' => 42)
            end

            # An extensible type keeps unknown properties so a received-then-resent payload
            # round-trips them. Extensibility alone is the trigger (ADR 17786, decision 9).
            it 'preserves an unknown key on an extensible type across a receive/re-send round trip' do
              parsed = nil
              expect { parsed = Storage::CookieFilter.from_json('name' => 'sid', 'x-vendor' => 'keep-me') }
                .to have_warning(:bidi_undeclared_property)

              expect(parsed.extensions).to eq('x-vendor' => 'keep-me')
              expect(parsed.as_json).to eq('name' => 'sid', 'x-vendor' => 'keep-me')
            end

            # network.Cookie is extensible but received-only (not reachable from any command's
            # params); it still preserves and echoes an unknown key, because extensibility — not
            # send-reachability — is what sanctions the extra field (ADR 17786, decision 9).
            it 'preserves an unknown key on an extensible received-only type across re-serialize' do
              wire = Network::Cookie.new(**valid_cookie_attrs).as_json.merge('x-vendor' => 'keep-me')
              parsed = nil
              expect { parsed = Network::Cookie.from_json(wire) }.to have_warning(:bidi_undeclared_property)

              expect(parsed.extensions).to eq('x-vendor' => 'keep-me')
              expect(parsed.as_json).to include('x-vendor' => 'keep-me')
            end

            it 'warns on and drops an unknown key on a non-extensible type' do
              wire = {'type' => 'password', 'username' => 'u', 'password' => 'p', 'x-vendor' => 'v'}
              parsed = nil
              expect { parsed = Network::AuthCredentials.from_json(wire) }.to have_warning(:bidi_undeclared_property)

              expect(parsed).not_to respond_to(:extensions)
            end
          end

          describe 'webExtension.install Firefox (moz:) vendor extension' do
            let(:extension) { WebExtension::ExtensionPath.new(path: '/tmp/ext') }

            # Construct the moz vendor subclass directly, with execute stubbed to capture the
            # params the vendor install would send.
            def moz_install(**kwargs)
              captured = nil
              connection = Object.new
              connection.define_singleton_method(:send_cmd) { |**| {} }
              domain = WebExtension::Moz.new(connection)
              domain.define_singleton_method(:execute) { |params:, **| captured = params }
              domain.install(extension_data: extension, **kwargs)
              captured
            end

            it 'composes typed moz: options into the extensible params under their exact wire keys' do
              params = moz_install(allow_private_browsing: true, permanent: false)

              expect(params.as_json).to eq(
                'extensionData' => {'type' => 'path', 'path' => '/tmp/ext'},
                'moz:allowPrivateBrowsing' => true,
                'moz:permanent' => false
              )
            end

            it 'omits vendor options left unset' do
              params = moz_install(permanent: true)

              expect(params.as_json).to eq(
                'extensionData' => {'type' => 'path', 'path' => '/tmp/ext'},
                'moz:permanent' => true
              )
            end

            it 'keeps moz: off the shared install so non-Firefox sessions never see it' do
              shared = WebExtension.instance_method(:install).parameters.map(&:last)

              expect(shared).to eq([:extension_data])
            end

            # #1140 makes InstallParameters extensible, so a not-yet-typed vendor key still rides along.
            it 'passes an unknown vendor key through the extensions bag' do
              params = WebExtension::InstallParameters.new(extension_data: extension, extensions: {'moz:future' => 1})

              expect(params.as_json).to include('moz:future' => 1)
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
              expect { Network::ContinueWithAuthParameters.build(request: 'r', action: :default, credentials: 'x') }
                .to raise_error(ArgumentError, /invalid combination/)
            end

            # The command signature marks credentials optional (required in only one variant), so
            # Ruby's keyword check can't catch this; the chosen variant's Record does.
            it 'rejects a union variant built without a field that variant requires' do
              expect { Network::ContinueWithAuthParameters.build(request: 'r', action: :provide_credentials) }
                .to raise_error(ArgumentError, /credentials is required/)
            end

            it 'dispatches a discriminated union by its value, falling back to the default variant' do
              provide = Network::ContinueWithAuthParameters.build(
                request: 'r', action: :provide_credentials,
                credentials: Network::AuthCredentials.new(username: 'u', password: 'p')
              )
              default = Network::ContinueWithAuthParameters.build(request: 'r', action: :default)

              expect(provide).to be_a(Network::ContinueWithAuthParameters::Credentials)
              expect(provide.as_json).to include('action' => 'provideCredentials',
                                                 'credentials' => {'type' => 'password', 'username' => 'u',
                                                                   'password' => 'p'})
              expect(default).to be_a(Network::ContinueWithAuthParameters::NoCredentials)
              expect(default.as_json).to eq('request' => 'r', 'action' => 'default')
            end
          end

          describe 'value-object enum validation' do
            it 'rejects an out-of-set enum value at construction, so an invalid object cannot exist' do
              expect { Network::Cookie.new(**valid_cookie_attrs, same_site: :sideways) }
                .to raise_error(ArgumentError, /Cookie#same_site must be one of/)
            end

            it 'rejects an unknown keyword at construction' do
              expect { Network::Cookie.new(**valid_cookie_attrs, bogus: 'x') }
                .to raise_error(ArgumentError, /unknown keyword: :bogus/)
            end

            it 'rejects a non-nullable field set to nil, instead of silently dropping it' do
              expect { BrowsingContext::NavigateParameters.new(context: nil, url: 'x') }
                .to raise_error(ArgumentError, /context cannot be nil/)
            end

            it 'rejects a scalar passed for a list-typed field at construction' do
              expect { Network::AddInterceptParameters.new(phases: :before_request_sent) }
                .to raise_error(ArgumentError, /phases expected a list/)
            end

            it 'rejects a non-Array enumerable for a scalar enum instead of coercing it' do
              expect { Network::Cookie.new(**valid_cookie_attrs, same_site: Set[:none]) }
                .to raise_error(ArgumentError, /same_site must be one of/)
            end

            it 'raises on an inbound enum value outside our schema' do
              expect { Log::ConsoleLogEntry.from_json('type' => 'console', 'level' => 'futureLevel') }
                .to raise_error(Error::WebDriverError, /level received an unknown value.*futureLevel/)
            end
          end

          describe 'enum symbol coercion' do
            it 'takes an idiomatic symbol and serializes the wire token (kebab included)' do
              params = Bluetooth::SimulateAdapterParameters.new(context: 'c', state: :powered_off)

              expect(params.state).to eq(:powered_off)
              expect(params.as_json).to include('state' => 'powered-off')
            end

            it 'deserializes a wire token back into its symbol' do
              parsed = Bluetooth::SimulateAdapterParameters.from_json('context' => 'c', 'state' => 'powered-off')

              expect(parsed.state).to eq(:powered_off)
            end

            it 'raises on an unrecognized inbound token' do
              expect { Bluetooth::SimulateAdapterParameters.from_json('context' => 'c', 'state' => 'powered-sideways') }
                .to raise_error(Error::WebDriverError, /state received an unknown value.*powered-sideways/)
            end

            it 'coerces each element of a list-valued enum' do
              params = Network::AddInterceptParameters.new(phases: %i[before_request_sent auth_required])

              expect(params.as_json).to include('phases' => %w[beforeRequestSent authRequired])
              expect(Network::AddInterceptParameters.from_json(params.as_json).phases)
                .to eq(%i[before_request_sent auth_required])
            end
          end

          describe 'inbound shape validation' do
            # A complete Cookie wire payload, so a shape test can corrupt one field without
            # tripping the required-presence check on the others.
            let(:cookie_wire) { Network::Cookie.new(**valid_cookie_attrs).as_json }

            it 'raises when a non-nullable field arrives as explicit null' do
              expect { Network::Cookie.from_json(cookie_wire.merge('name' => nil)) }
                .to raise_error(Error::WebDriverError, /Cookie#name received null but is not nullable/)
            end

            it 'raises when a list-typed field arrives as a scalar' do
              expect { Network::AddInterceptParameters.from_json('phases' => 'beforeRequestSent') }
                .to raise_error(Error::WebDriverError, /phases expected a list/)
            end

            it 'raises when a scalar-typed field arrives as a list' do
              expect { Network::Cookie.from_json(cookie_wire.merge('sameSite' => %w[none])) }
                .to raise_error(Error::WebDriverError, /same_site expected a single value/)
            end

            it 'raises when an object-typed record arrives as a scalar' do
              expect { Network::AuthCredentials.from_json('not-an-object') }
                .to raise_error(Error::WebDriverError, /AuthCredentials expected an object/)
            end

            it 'raises when a string-typed field arrives as a number' do
              expect { Network::Cookie.from_json(cookie_wire.merge('name' => 123)) }
                .to raise_error(Error::WebDriverError, /name expected string/)
            end

            it 'raises when a boolean-typed field arrives as a string' do
              expect { Network::Cookie.from_json(cookie_wire.merge('secure' => 'yes')) }
                .to raise_error(Error::WebDriverError, /secure expected boolean/)
            end

            it 'raises when an integer-typed field arrives as a string' do
              expect { Bluetooth::BluetoothManufacturerData.from_json('key' => 'nope', 'data' => 'x') }
                .to raise_error(Error::WebDriverError, /key expected integer/)
            end

            it 'raises when an integer-typed field arrives as a non-integer float' do
              expect { Bluetooth::BluetoothManufacturerData.from_json('key' => 1.5, 'data' => 'x') }
                .to raise_error(Error::WebDriverError, /key expected integer/)
            end

            it 'accepts an integer for an integer-typed field' do
              parsed = Bluetooth::BluetoothManufacturerData.from_json('key' => 5, 'data' => 'x')

              expect(parsed.key).to eq(5)
            end

            # Signal 3: an inline literal choice the projector now types as `string`
            # (scrollbarType = "classic" / "overlay" / null), previously opaque.
            it 'raises when an inline-enum scalar field arrives as the wrong primitive' do
              expect { Emulation::SetScrollbarTypeOverrideParameters.from_json('scrollbarType' => 123) }
                .to raise_error(Error::WebDriverError, /scrollbar_type expected string/)
            end

            # Signal 3: a scalar hidden behind an alias (size -> js-uint -> integer) now carries
            # its leaf primitive, so a wrong-typed value is rejected instead of passing opaque.
            it 'raises when an alias-typed integer field (js-uint) arrives as a string' do
              expect { Network::Cookie.from_json(cookie_wire.merge('size' => 'big')) }
                .to raise_error(Error::WebDriverError, /size expected integer/)
            end
          end

          # RequestDeviceInfo is a minimal record: a required `id` and a required-and-nullable `name`.
          describe 'inbound required-field tolerance' do
            it 'tolerates a missing required-nullable field as omitted (UNSET, not null) and warns' do
              parsed = nil
              expect { parsed = Bluetooth::RequestDeviceInfo.from_json('id' => 'dev-1') }
                .to have_warning(:bidi_missing_required)
              explicit = Bluetooth::RequestDeviceInfo.from_json('id' => 'dev-1', 'name' => nil)

              expect(parsed.name).to equal(Serialization::UNSET)
              expect(explicit.name).to be_nil
            end

            it 'escalates a missing required field to an error in strict mode (SE_BIDI_STRICT)' do
              allow(ENV).to receive(:fetch).and_call_original
              allow(ENV).to receive(:fetch).with('SE_BIDI_STRICT', '').and_return('true')

              expect { Bluetooth::RequestDeviceInfo.from_json('id' => 'dev-1') }
                .to raise_error(Error::WebDriverError, /RequestDeviceInfo#name is required but was missing/)
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
