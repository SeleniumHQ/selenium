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

require File.expand_path('../../spec_helper', __dir__)
require_relative 'network_spec_support'

module Selenium
  module WebDriver
    describe Network::HandlerRegistry do
      include NetworkSpecSupport

      subject(:registry) { described_class.new(bridge) }

      let(:connection) { NetworkSpecSupport::RecordingConnection.new }
      let(:bridge) { NetworkSpecSupport::RecordingBridge.over(connection) }
      let(:errors) { bridge.listener_errors }
      let(:log) { Queue.new }

      def logging(name)
        proc { |event| log << [name, event.url] }
      end

      def add(handler = proc {}, **)
        registry.add(handler, **)
      end

      def emit_challenge(**)
        connection.emit('network.authRequired', auth_required(**))
      end

      def answered(count: 1)
        connection.await('network.continueWithAuth', count: count).map { |payload| payload[:params] }
      end

      def drain(queue)
        Array.new(queue.size) { queue.pop }
      end

      describe '#add' do
        it 'subscribes when it gets its first handler, then adds an intercept for each handler' do
          add
          add(url_patterns: 'https://example.com/')

          expect(connection.sent.map { |payload| payload[:method] })
            .to eq(%w[session.subscribe network.addIntercept network.addIntercept])
          expect(connection.sent('session.subscribe').first[:params]).to eq('events' => ['network.authRequired'])
          expect(connection.sent('network.addIntercept').map { |payload| payload[:params] })
            .to eq([{'phases' => ['authRequired']},
                    {'phases' => ['authRequired'],
                     'urlPatterns' => [{'type' => 'string', 'pattern' => 'https://example.com/'}]}])
        end

        it 'limits the intercept to a window' do
          add(window_handle: 'window-2')

          expect(connection.sent('network.addIntercept').first[:params])
            .to eq('phases' => ['authRequired'], 'contexts' => ['window-2'])
        end

        it 'refuses a window and a user context together before sending anything' do
          expect { add(window_handle: 'window-2', user_context: 'context-1') }
            .to raise_error(ArgumentError, /not both/)
          expect(connection.sent).to be_empty
        end

        it 'refuses an invalid URL pattern before sending anything' do
          expect { add(url_patterns: 'https://*.example.com/') }.to raise_error(ArgumentError, /reserves/)
          expect(connection.sent).to be_empty
        end

        it 'requires a block' do
          expect { add(nil) }.to raise_error(ArgumentError, /block/)
        end

        it 'unsubscribes again when the first intercept is refused' do
          connection.errors['network.addIntercept'] = 'invalid argument'

          expect { add }.to raise_error(Error::InvalidArgumentError)
          expect(connection.sent('session.unsubscribe').first[:params]).to eq('subscriptions' => ['subscription-1'])
        end
      end

      describe '#remove' do
        it 'removes the intercept, and unsubscribes by id when no handler is left' do
          first = add
          second = add
          intercepts = [registry.intercept(first), registry.intercept(second)]

          registry.remove(first)
          expect(connection.sent('session.unsubscribe')).to be_empty

          registry.remove(second)
          expect(connection.sent('network.removeIntercept').map { |payload| payload[:params] })
            .to eq(intercepts.map { |intercept| {'intercept' => intercept} })
          expect(connection.sent('session.unsubscribe').map { |payload| payload[:params] })
            .to eq([{'subscriptions' => ['subscription-1']}])
        end

        it 'subscribes again when it gets a handler after emptying' do
          registry.remove(add)
          add

          expect(connection.sent('session.subscribe').size).to eq(2)
        end

        it 'does nothing for a handle already removed, or one it never returned' do
          handle = add
          registry.remove(handle)

          expect { registry.remove(handle) }.not_to(change { connection.sent.size })
          expect { registry.remove(Object.new) }.not_to(change { connection.sent.size })
        end
      end

      describe '#clear' do
        it 'removes every handler' do
          add
          add

          registry.clear

          expect(registry.handles).to be_empty
          expect(connection.sent('network.removeIntercept').size).to eq(2)
        end
      end

      context 'when a challenge arrives' do
        it 'consults the handler added last first' do
          first = add(logging(:first))
          second = add(logging(:second))

          emit_challenge(intercepts: [registry.intercept(first), registry.intercept(second)])
          answered

          expect(drain(log).map(&:first)).to eq(%i[second first])
        end

        it 'stops at the first handler to answer the challenge' do
          first = add(logging(:first))
          second = add(proc(&:cancel))

          emit_challenge(intercepts: [registry.intercept(first), registry.intercept(second)])

          expect(answered).to eq([{'request' => 'request-1', 'action' => 'cancel'}])
          expect(log).to be_empty
        end

        it 'answers with the credentials a handler gives' do
          handle = add(proc { |challenge| challenge.authenticate(username: 'user', password: 'pass') })

          emit_challenge(intercepts: [registry.intercept(handle)])

          expect(answered.first)
            .to eq('request' => 'request-1', 'action' => 'provideCredentials',
                   'credentials' => {'type' => 'password', 'username' => 'user', 'password' => 'pass'})
        end

        it 'leaves a challenge no handler answers to the browser' do
          handle = add(logging(:first))

          emit_challenge(intercepts: [registry.intercept(handle)])

          expect(answered).to eq([{'request' => 'request-1', 'action' => 'default'}])
        end

        it 'consults only the handlers whose intercepts blocked the event' do
          first = add(logging(:first))
          add(logging(:second))

          emit_challenge(intercepts: [registry.intercept(first)])
          answered

          expect(drain(log).map(&:first)).to eq([:first])
        end

        it 'ignores an event that is not blocked' do
          handle = add(logging(:first))

          emit_challenge(blocked: false, intercepts: [registry.intercept(handle)])
          emit_challenge(id: 'request-2', intercepts: [registry.intercept(handle)])
          answered

          expect(connection.sent('network.continueWithAuth').map { |payload| payload[:params]['request'] })
            .to eq(['request-2'])
        end

        it 'leaves to the browser a challenge blocked by the intercept of a handler removed since' do
          handle = add(logging(:first))
          intercept = registry.intercept(handle)
          add
          registry.remove(handle)

          emit_challenge(intercepts: [intercept])

          expect(answered).to eq([{'request' => 'request-1', 'action' => 'default'}])
          expect(log).to be_empty
        end

        it 'consults a handler scoped to a user context only for events in it' do
          handle = add(logging(:scoped), user_context: 'context-1')

          emit_challenge(user_context: 'default', intercepts: [registry.intercept(handle)])
          emit_challenge(id: 'request-2', user_context: 'context-1', url: 'https://example.com/in',
                         intercepts: [registry.intercept(handle)])
          answered(count: 2)

          expect(drain(log)).to eq([[:scoped, 'https://example.com/in']])
        end

        it 'cancels the challenge and stores the error when a handler raises, consulting no further handler' do
          first = add(logging(:first))
          second = add(proc { raise ArgumentError, 'boom' })

          emit_challenge(intercepts: [registry.intercept(first), registry.intercept(second)])

          expect(answered).to eq([{'request' => 'request-1', 'action' => 'cancel'}])
          expect(log).to be_empty
          expect { errors.check }.to raise_error(ArgumentError, 'boom')
        end

        it 'cancels the challenge when a handler raises outside StandardError, as a failed assertion does' do
          handle = add(proc { raise Exception, 'assertion' }) # rubocop:disable Lint/RaiseException

          emit_challenge(intercepts: [registry.intercept(handle)])
          answered

          expect { errors.check }.to raise_error(Exception, 'assertion')
        end

        it 'cancels the challenge and stores the error when a handler gives credentials of the wrong type' do
          handle = add(proc { |challenge| challenge.authenticate(username: 1, password: 'pass') })

          emit_challenge(intercepts: [registry.intercept(handle)])

          expect(answered).to eq([{'request' => 'request-1', 'action' => 'cancel'}])
          expect { errors.check }.to raise_error(ArgumentError, /username expected string/)
        end

        it 'logs an answer the browser refuses, since no handler caused it' do
          logged = Queue.new
          allow(WebDriver.logger).to receive(:error) { |message, **opts| logged << message if opts[:id] == :network }
          connection.errors['network.continueWithAuth'] = 'no such request'
          handle = add

          emit_challenge(intercepts: [registry.intercept(handle)])

          expect(logged.pop(timeout: 5)).to match(/Could not answer the authentication challenge: .*NoSuchRequestError/)
          expect { errors.check }.not_to raise_error
        end

        it 'keeps consulting the handlers an event started with when one is removed meanwhile' do
          started = Queue.new
          release = Queue.new
          first = add(logging(:first))
          second = add(proc {
            started << true
            release.pop
          })

          emit_challenge(intercepts: [registry.intercept(first), registry.intercept(second)])
          started.pop(timeout: 5)
          registry.remove(first)
          release << true
          answered

          expect(drain(log).map(&:first)).to eq([:first])
        end
      end
    end
  end
end
