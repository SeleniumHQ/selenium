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
require 'stringio'

module Selenium
  module WebDriver
    describe WebSocketConnection do
      # Build an instance without opening a socket so the frame-handling logic
      # can be exercised in isolation.
      subject(:connection) { described_class.allocate }

      around do |example|
        original = WebSocket.max_frame_size
        example.call
      ensure
        WebSocket.max_frame_size = original
      end

      describe '#apply_frame_size_limit' do
        it 'raises the global limit when it is below the Selenium default' do
          WebSocket.max_frame_size = 1

          connection.send(:apply_frame_size_limit)

          expect(WebSocket.max_frame_size).to eq(described_class::MAX_FRAME_SIZE)
        end

        it 'leaves a larger user-configured limit untouched' do
          larger = described_class::MAX_FRAME_SIZE * 2
          WebSocket.max_frame_size = larger

          connection.send(:apply_frame_size_limit)

          expect(WebSocket.max_frame_size).to eq(larger)
        end
      end

      describe '#close' do
        let(:socket) { StringIO.new }

        before do
          connection.instance_variable_set(:@closing_mtx, Mutex.new)
          connection.instance_variable_set(:@messages_mtx, Mutex.new)
          connection.instance_variable_set(:@socket, socket)
          connection.instance_variable_set(:@callback_threads, ThreadGroup.new)
        end

        it 'still closes the socket when the listener already initiated shutdown' do
          connection.instance_variable_set(:@closing, true)

          connection.close

          expect(socket).to be_closed
        end
      end

      describe '#send_cmd' do
        let(:socket) { StringIO.new }

        before do
          connection.instance_variable_set(:@closing, false)
          connection.instance_variable_set(:@closing_mtx, Mutex.new)
          connection.instance_variable_set(:@messages_mtx, Mutex.new)
          connection.instance_variable_set(:@socket, socket)
          connection.instance_variable_set(:@url, 'ws://localhost:9222/session')
        end

        def reply_with(frame)
          allow(socket).to receive(:write) do
            Thread.new { connection.send(:process_frame, frame) }
          end
        end

        def pending_state
          [connection.send(:pending_responses), connection.send(:messages)]
        end

        it 'fails fast when the connection is closing' do
          connection.instance_variable_set(:@closing, true)

          expect { connection.send_cmd(method: 'foo') }
            .to raise_error(IOError, /closed/)
        end

        it 'returns the reply as soon as it arrives' do
          stub_const("#{described_class}::RESPONSE_WAIT_INTERVAL", 10)
          reply_with('{"id":1,"result":{"value":"ok"}}')

          started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          response = connection.send_cmd(method: 'foo')

          expect(response).to eq('id' => 1, 'result' => {'value' => 'ok'})
          expect(Process.clock_gettime(Process::CLOCK_MONOTONIC) - started).to be < 5
          expect(pending_state).to eq([{}, {}])
        end

        it 'times out and drops a late reply' do
          stub_const("#{described_class}::RESPONSE_WAIT_TIMEOUT", 0.05)

          expect { connection.send_cmd(method: 'foo') }.to raise_error(Error::TimeoutError)
          connection.send(:process_frame, '{"id":1,"result":{}}')

          expect(pending_state).to eq([{}, {}])
        end

        it 'stops waiting when the connection is closed' do
          allow(socket).to receive(:write) do
            Thread.new do
              sleep 0.05
              connection.send(:close_socket)
            end
          end

          started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          expect { connection.send_cmd(method: 'foo') }
            .to raise_error(IOError, /closed while waiting for a response/)
          expect(Process.clock_gettime(Process::CLOCK_MONOTONIC) - started).to be < 5
          expect(pending_state).to eq([{}, {}])
        end

        it 'stops waiting when the listener dies on an unexpected error' do
          allow(socket).to receive(:readpartial).and_return('frame')
          allow(connection).to receive(:process_incoming_frames).and_raise(JSON::ParserError)
          allow(socket).to receive(:write) { connection.send(:attach_socket_listener) }

          started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          expect { connection.send_cmd(method: 'foo') }
            .to raise_error(IOError, /closed while waiting for a response/)
          expect(Process.clock_gettime(Process::CLOCK_MONOTONIC) - started).to be < 5
        end

        it 'stops tracking the command when the write fails' do
          allow(socket).to receive(:write).and_raise(Errno::EPIPE)

          expect { connection.send_cmd(method: 'foo') }.to raise_error(Errno::EPIPE, /WebSocket is closed/)
          expect(pending_state).to eq([{}, {}])
        end
      end

      describe '#process_frame' do
        let(:frame) { {'id' => 1, 'result' => {}} }

        before do
          connection.instance_variable_set(:@messages_mtx, Mutex.new)
          allow(JSON).to receive(:parse).and_return(frame)
        end

        it 'does not render the frame to a string when debug logging is off' do
          allow(frame).to receive(:to_s)

          connection.send(:process_frame, '{"id":1,"result":{}}')

          expect(frame).not_to have_received(:to_s)
        end

        it 'records the frame and wakes the waiting command' do
          waiter = ConditionVariable.new
          allow(waiter).to receive(:signal)
          connection.send(:pending_responses)[1] = waiter

          connection.send(:process_frame, '{"id":1,"result":{}}')

          expect(connection.send(:messages)).to eq(1 => frame)
          expect(waiter).to have_received(:signal)
        end

        it 'drops a frame no command is waiting for' do
          connection.send(:process_frame, '{"id":1,"result":{}}')

          expect(connection.send(:messages)).to be_empty
        end

        it 'renders the frame when the logger is at debug level' do
          allow(frame).to receive(:to_s).and_return('rendered')
          allow(WebDriver.logger).to receive(:debug).and_yield

          connection.send(:process_frame, '{"id":1,"result":{}}')

          expect(frame).to have_received(:to_s)
        end
      end

      describe '#frame_dropped?' do
        let(:incoming_frame) { WebSocket::Frame::Incoming::Client.new(version: 13) }
        let(:socket) { StringIO.new }

        before do
          connection.instance_variable_set(:@incoming_frame, incoming_frame)
          connection.instance_variable_set(:@closing_mtx, Mutex.new)
          connection.instance_variable_set(:@messages_mtx, Mutex.new)
          connection.instance_variable_set(:@socket, socket)
        end

        it 'is false when there is no decoding error' do
          expect(connection.send(:frame_dropped?)).to be(false)
        end

        it 'is true and closes the connection when a frame exceeds the maximum size' do
          WebSocket.max_frame_size = 1
          raw = WebSocket::Frame::Outgoing::Server.new(version: 13, data: 'a' * 1024, type: 'text').to_s
          incoming_frame << raw
          incoming_frame.next

          expect(connection.send(:frame_dropped?)).to be(true)
          expect(incoming_frame.error?).to be(true)
          expect(connection.instance_variable_get(:@closing)).to be(true)
          expect(socket).to be_closed
        end
      end
    end
  end
end
