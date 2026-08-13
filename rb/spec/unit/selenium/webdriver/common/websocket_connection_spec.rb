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

module Selenium
  module WebDriver
    describe WebSocketConnection do
      # Stub network I/O so we can test initialize without a real socket.
      before do
        allow_any_instance_of(described_class).to receive(:process_handshake)
        allow_any_instance_of(described_class).to receive(:attach_socket_listener).and_return(nil)
      end

      describe 'MAX_FRAME_SIZE' do
        it 'is 100 MB' do
          expect(described_class::MAX_FRAME_SIZE).to eq(100 * 1024 * 1024)
        end
      end

      describe '#initialize' do
        it 'raises WebSocket.max_frame_size to MAX_FRAME_SIZE when current value is lower' do
          original = WebSocket.max_frame_size
          WebSocket.max_frame_size = 1024

          described_class.new(url: 'ws://localhost:4444')

          expect(WebSocket.max_frame_size).to eq(described_class::MAX_FRAME_SIZE)
        ensure
          WebSocket.max_frame_size = original
        end

        it 'does not lower WebSocket.max_frame_size when already above MAX_FRAME_SIZE' do
          original = WebSocket.max_frame_size
          higher = described_class::MAX_FRAME_SIZE * 2
          WebSocket.max_frame_size = higher

          described_class.new(url: 'ws://localhost:4444')

          expect(WebSocket.max_frame_size).to eq(higher)
        ensure
          WebSocket.max_frame_size = original
        end
      end
    end
  end
end
