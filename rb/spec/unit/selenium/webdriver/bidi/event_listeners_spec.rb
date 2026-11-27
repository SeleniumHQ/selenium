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
    # Runs the generated domains over a real WebSocketConnection, socket thread included, whose
    # socket is a remote end that answers each command and emits events on request.
    describe 'low-level event listeners' do
      let(:remote_end_class) do
        Class.new do
          attr_reader :sent

          def initialize
            @sent = []
            @inbound = Queue.new
            @commands = WebSocket::Frame::Incoming::Server.new(version: 13)
            @write_mtx = Mutex.new
          end

          def write(data)
            @write_mtx.synchronize do
              @commands << data
              while (frame = @commands.next)
                command = JSON.parse(frame.to_s)
                @sent << command
                push(id: command['id'], type: 'success', result: result_for(command['method']))
              end
            end
          end

          def emit(method, params)
            push(type: 'event', method: method, params: params)
          end

          def readpartial(_size)
            @inbound.pop || raise(EOFError)
          end

          def close
            @inbound.close
          end

          private

          def result_for(method)
            method == 'browsingContext.getTree' ? {contexts: []} : {}
          end

          def push(message)
            @inbound << WebSocket::Frame::Outgoing::Server.new(version: 13, data: JSON.generate(message),
                                                               type: 'text').to_s
          end
        end
      end

      let(:remote_end) { remote_end_class.new }

      let(:connection) do
        WebSocketConnection.allocate.tap do |connection|
          allow(connection).to receive(:process_handshake)
          connection.instance_variable_set(:@socket, remote_end)
          connection.send(:initialize, url: 'ws://localhost:9222/session')
        end
      end

      let(:contexts) { BiDi::Protocol::BrowsingContext.new(connection) }
      let(:received) { Queue.new }
      let(:release) { Queue.new }

      after do
        release.close
        connection.close
      end

      def load(url: 'https://example.com')
        {context: 'ctx-1', navigation: nil, timestamp: 1, url: url}
      end

      def emit_load(url)
        remote_end.emit('browsingContext.load', load(url: url))
      end

      def take(queue = received)
        queue.pop(timeout: 5) || raise('nothing arrived within 5 seconds')
      end

      # The socket thread handles messages in order, so a reply means every earlier payload was dispatched.
      def await_dispatch
        contexts.get_tree
      end

      # The error is logged on the listener's own thread, after the payload has been handed off.
      def await_errors(count)
        logged = Queue.new
        allow(WebDriver.logger).to receive(:error).and_wrap_original do |original, *args, **kwargs|
          original.call(*args, **kwargs).tap { logged << args.first }
        end
        yield
        count.times { take(logged) }
      end

      def blocking_listener(started)
        lambda do |payload|
          started << payload.url
          release.pop
          received << payload.url
        end
      end

      it 'adding a listener sends nothing and returns a unique id' do
        listener = proc {}

        first = contexts.add_load_listener(&listener)
        second = contexts.add_load_listener(&listener)

        expect(remote_end.sent).to be_empty
        expect(first).not_to eq(second)
      end

      it 'requires a block' do
        expect { contexts.add_load_listener }.to raise_error(ArgumentError, /block/)
      end

      it 'a listener receives the typed payloads of its event without any subscription' do
        contexts.add_load_listener { |payload| received << payload }

        remote_end.emit('browsingContext.domContentLoaded', load(url: 'https://other'))
        emit_load('https://example.com')

        payload = take
        expect(payload).to be_a(BiDi::Protocol::BrowsingContext::NavigationInfo)
        expect(payload.url).to eq('https://example.com')
        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'invokes a listener with each payload without waiting for earlier invocations' do
        started = Queue.new
        contexts.add_load_listener(&blocking_listener(started))

        emit_load('https://one')
        emit_load('https://two')

        expect([take(started), take(started)]).to contain_exactly('https://one', 'https://two')
      end

      it 'a running listener delays neither another listener nor a command reply' do
        other = Queue.new
        contexts.add_load_listener { release.pop }
        contexts.add_load_listener { |payload| other << payload.url }

        emit_load('https://example.com')

        expect(take(other)).to eq('https://example.com')
        expect(contexts.get_tree.contexts).to eq([])
      end

      it 'marks the thread a listener runs on, so its commands leave stored listener errors alone' do
        contexts.add_load_listener { received << ListenerErrors.listener_thread? }

        emit_load('https://example.com')

        expect(take).to be true
      end

      it 'a listener can send a command' do
        contexts.add_load_listener { received << contexts.get_tree.contexts }

        emit_load('https://example.com')

        expect(take).to eq([])
      end

      it 'logs an exception raised by a listener as an error' do
        contexts.add_load_listener { raise Error::WebDriverError, 'boom' }

        expect {
          await_errors(1) { emit_load('https://example.com') }
        }.to have_error(:bidi, /listener for browsingContext\.load raised.*WebDriverError: boom/)
      end

      it 'logs a failed assertion in a listener, which raises outside StandardError' do
        contexts.add_load_listener { |payload| expect(payload.url).to eq('https://other') }

        expect {
          await_errors(1) { emit_load('https://example.com') }
        }.to have_error(:bidi, /listener for browsingContext\.load raised.*ExpectationNotMetError/)
      end

      it 'logs a payload that fails validation as an error and delivers it to no listener' do
        second = Queue.new
        contexts.add_load_listener { |payload| received << payload.url }
        contexts.add_load_listener { |payload| second << payload.url }

        expect {
          remote_end.emit('browsingContext.load', context: 'ctx-1', url: 'https://invalid')
          emit_load('https://example.com')
          expect([take, take(second)]).to eq(%w[https://example.com https://example.com])
        }.to have_error(:bidi, /Dropped a browsingContext\.load payload that failed validation/)
        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'drops a payload for an event with no listener silently' do
        contexts.add_dom_content_loaded_listener { nil }

        expect {
          remote_end.emit('browsingContext.load', context: 'ctx-1', url: 'https://invalid')
          await_dispatch
        }.not_to have_error(:bidi)
      end

      it 'removing a listener is local and can be repeated through any domain instance' do
        listener = contexts.add_load_listener { |payload| received << payload.url }

        BiDi::Protocol::Network.new(connection).remove_listener(listener)
        contexts.remove_listener(listener)
        expect(remote_end.sent).to be_empty

        emit_load('https://example.com')
        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'removing one listener leaves another for the same event' do
        second = Queue.new
        removed = contexts.add_load_listener { |payload| received << payload.url }
        contexts.add_load_listener { |payload| second << payload.url }

        contexts.remove_listener(removed)
        emit_load('https://example.com')

        expect(take(second)).to eq('https://example.com')
        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'removal returns at once, lets a running invocation finish and invokes nothing after it' do
        started = Queue.new
        listener = contexts.add_load_listener(&blocking_listener(started))
        emit_load('https://running')
        take(started)

        contexts.remove_listener(listener)
        emit_load('https://late')
        release << true

        expect(take).to eq('https://running')
        expect(received.pop(timeout: 0.2)).to be_nil
        expect(started).to be_empty
      end

      it 'skips a payload handed to a listener just before it was removed' do
        listener = BiDi::Dispatcher::Listener.new('browsingContext.load', nil, ->(payload) { received << payload })

        listener.deactivate
        listener.dispatch('payload')

        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'a listener can remove itself' do
        removed = Queue.new
        listener = nil
        listener = contexts.add_load_listener do |payload|
          received << payload.url
          contexts.remove_listener(listener)
          removed << true
        end

        emit_load('https://one')
        take(removed)
        emit_load('https://two')

        expect(take).to eq('https://one')
        expect(received.pop(timeout: 0.2)).to be_nil
      end

      it 'closing the connection drops every listener and refuses new ones' do
        contexts.add_load_listener { |payload| received << payload.url }

        connection.close
        connection.event_receiver.receive('browsingContext.load', load.transform_keys(&:to_s))

        expect(received.pop(timeout: 0.2)).to be_nil
        expect { contexts.add_load_listener { nil } }
          .to raise_error(Error::WebDriverError, /BiDi connection is closed/)
      end

      it 'refuses a first listener on a connection that already closed' do
        connection.close

        expect { contexts.add_load_listener { nil } }
          .to raise_error(Error::WebDriverError, /BiDi connection is closed/)
      end

      it 'a listener can close the connection' do
        contexts.add_load_listener do
          connection.close
          received << true
        end

        emit_load('https://example.com')

        expect(take).to be(true)
      end

      it 'attaches no event receiver until a listener is added' do
        expect(connection.event_receiver).to be_nil

        contexts.add_load_listener { nil }

        expect(connection.event_receiver).to be_a(BiDi::Dispatcher)
      end

      it 'leaves the legacy callbacks receiving raw params beside a listener' do
        raw = Queue.new
        contexts.add_load_listener { |payload| received << payload }
        id = connection.add_callback('browsingContext.load') { |params| raw << params }

        emit_load('https://example.com')

        expect(take(raw)).to eq(load.transform_keys(&:to_s))
        expect(take).to be_a(BiDi::Protocol::BrowsingContext::NavigationInfo)
      ensure
        connection.remove_callback('browsingContext.load', id) if id
      end
    end
  end # WebDriver
end # Selenium
