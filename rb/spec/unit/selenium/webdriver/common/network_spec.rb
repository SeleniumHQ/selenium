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
require_relative 'network/network_spec_support'

module Selenium
  module WebDriver
    describe Network do
      include NetworkSpecSupport

      let(:connection) { NetworkSpecSupport::RecordingConnection.new }
      let(:legacy_bidi) do
        instance_double(BiDi).as_null_object.tap do |bidi|
          allow(bidi).to receive_messages(session: BiDi::Session.new(bidi), send_cmd: {'intercept' => 'intercept-id'})
        end
      end
      let(:network) { described_class.new(NetworkSpecSupport::RecordingBridge.over(connection, bidi: legacy_bidi)) }

      def intercepts
        connection.sent('network.addIntercept').map { |payload| payload[:params] }
      end

      def challenge(intercept)
        connection.emit('network.authRequired', auth_required(intercepts: [intercept]))
        connection.await('network.continueWithAuth').first[:params]
      end

      describe '#add_authentication' do
        it 'answers the challenges of the URLs it applies to with the credentials' do
          network.add_authentication(username: 'user', password: 'pass', url_patterns: 'https://example.com/')

          expect(intercepts.first['urlPatterns']).to eq([{'type' => 'string', 'pattern' => 'https://example.com/'}])
          expect(challenge(connection.intercepts.last))
            .to include('action' => 'provideCredentials',
                        'credentials' => {'type' => 'password', 'username' => 'user', 'password' => 'pass'})
        end
      end

      describe '#add_authentication_handler' do
        it 'deprecates a username and password for #add_authentication' do
          expect { network.add_authentication_handler('user', 'pass') }.to have_deprecated(:network_auth_credentials)
          expect(challenge(connection.intercepts.last)['action']).to eq('provideCredentials')
        end

        it 'deprecates positional filters without a pattern type, which still match every challenge' do
          expect { network.add_authentication_handler('user', 'pass', 'https://*.example.com/', '/login') }
            .to have_deprecated(%i[network_url_filters network_auth_credentials])
          expect(intercepts).to eq([{'phases' => ['authRequired']}])
        end

        it 'sends positional filters with the string pattern type as pattern strings, a list among them' do
          urls = ['https://example.com/a', 'https://example.com/b']

          expect { network.add_authentication_handler('user', 'pass', urls, pattern_type: :string) }
            .to have_deprecated(%i[network_url_filters network_auth_credentials])
          expect(intercepts.first['urlPatterns'])
            .to eq(urls.map { |url| {'type' => 'string', 'pattern' => url} })
        end

        it 'sends positional filters with the url pattern type as URL components' do
          url = 'https://example.com:8443/a?b=c'

          expect { network.add_authentication_handler('user', 'pass', url, pattern_type: :url) }
            .to have_deprecated(%i[network_url_filters network_auth_credentials])
          expect(intercepts.first['urlPatterns'])
            .to eq([{'type' => 'pattern', 'protocol' => 'https', 'hostname' => 'example.com', 'port' => '8443',
                     'pathname' => '/a', 'search' => 'b=c'}])
        end

        it 'refuses an unknown pattern type, with or without filters, as before' do
          expect { network.add_authentication_handler('user', 'pass', 'https://example.com/', pattern_type: :glob) }
            .to raise_error(ArgumentError, /Unknown pattern type/)
          expect { network.add_authentication_handler('user', 'pass', pattern_type: :glob) }
            .to raise_error(ArgumentError, /Unknown pattern type/)
          expect(connection.sent).to be_empty
        end

        it 'deprecates a pattern type given with url patterns, using the url patterns' do
          url = 'https://example.com/'

          expect { network.add_authentication_handler(url_patterns: url, pattern_type: :string, &:cancel) }
            .to have_deprecated(:network_url_filters)
          expect(intercepts.first['urlPatterns']).to eq([{'type' => 'string', 'pattern' => 'https://example.com/'}])
        end

        it 'matches every request when given a pattern type with no filters' do
          expect { network.add_authentication_handler(pattern_type: :string, &:cancel) }
            .to have_deprecated(:network_url_filters)
          expect(intercepts).to eq([{'phases' => ['authRequired']}])
        end

        it 'refuses url patterns given with the deprecated filters' do
          url = 'https://example.com/'

          expect { network.add_authentication_handler(nil, nil, url, url_patterns: url, &:cancel) }
            .to raise_error(ArgumentError, /not both/)
        end
      end

      describe '#remove_authentication_handler' do
        it 'removes the handler without deprecations' do
          expect {
            handle = network.add_authentication_handler(&:cancel)
            network.remove_authentication_handler(handle)
          }.to have_deprecated([])

          expect(connection.sent('network.removeIntercept').size).to eq(1)
          expect(connection.sent('session.unsubscribe').size).to eq(1)
        end
      end

      describe '#clear_authentication_handlers' do
        it 'removes every authentication handler without deprecations' do
          expect {
            network.add_authentication_handler(&:cancel)
            network.add_authentication(username: 'user', password: 'pass')
            network.clear_authentication_handlers
          }.to have_deprecated([])

          expect(connection.sent('network.removeIntercept').size).to eq(2)
          expect(connection.sent('session.unsubscribe').size).to eq(1)
        end
      end

      describe '#remove_handler' do
        it 'takes an authentication handle as well as the others, without deprecations' do
          expect {
            request = network.add_request_handler(&:continue)
            auth = network.add_authentication(username: 'user', password: 'pass')
            network.remove_handler(request)
            network.remove_handler(auth)
          }.to have_deprecated([])

          expect(connection.sent('network.removeIntercept').size).to eq(1)
          expect(connection.sent('session.unsubscribe').size).to eq(1)
        end
      end

      describe '#clear_handlers' do
        it 'removes authentication handlers as well as the others, without deprecations' do
          expect {
            network.add_request_handler(&:continue)
            network.add_authentication(username: 'user', password: 'pass')
            network.clear_handlers
          }.to have_deprecated([])

          expect(connection.sent('network.removeIntercept').size).to eq(1)
          expect(connection.sent('session.unsubscribe').size).to eq(1)
        end
      end

      describe '#callbacks' do
        it 'is deprecated, and lists every handler with the intercept it added' do
          request = network.add_request_handler(&:continue)
          auth = network.add_authentication(username: 'user', password: 'pass')

          expect {
            expect(network.callbacks).to eq(auth => {'intercept' => connection.intercepts.last},
                                            request => {'intercept' => 'intercept-id'})
          }.to have_deprecated(:network_callbacks)
        end
      end

      describe '#continue_with_auth' do
        it 'is deprecated, and still answers the challenge it names' do
          allow(legacy_bidi).to receive(:send_cmd)

          expect { network.continue_with_auth('request-1', 'user', 'pass') }
            .to have_deprecated(:network_continue_with_auth)
          expect(legacy_bidi).to have_received(:send_cmd)
            .with('network.continueWithAuth', request: 'request-1', action: 'provideCredentials',
                                              credentials: {type: 'password', username: 'user', password: 'pass'})
        end
      end

      describe '#network' do
        it 'is deprecated for BiDi::Protocol::Network, and returns the old implementation' do
          expect { expect(network.network).to be_a BiDi::Network }.to have_deprecated(:network_bidi)
        end
      end

      describe '#bidi' do
        it 'is deprecated for BiDi::Protocol::Network, and returns the old implementation' do
          expect { expect(network.bidi).to be_a BiDi::Network }.to have_deprecated(:network_bidi)
        end
      end
    end
  end
end
