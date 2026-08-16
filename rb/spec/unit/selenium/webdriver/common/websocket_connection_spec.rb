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
        it 'fails fast when the connection is closing' do
          connection.instance_variable_set(:@closing, true)

          expect { connection.send_cmd(method: 'foo') }
            .to raise_error(IOError, /closed/)
        end
      end

      describe '#frame_dropped?' do
        let(:incoming_frame) { WebSocket::Frame::Incoming::Client.new(version: 13) }
        let(:socket) { StringIO.new }

        before do
          connection.instance_variable_set(:@incoming_frame, incoming_frame)
          connection.instance_variable_set(:@closing_mtx, Mutex.new)
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
